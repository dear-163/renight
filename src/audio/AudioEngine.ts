import { AudioEngineParams, AudioMode, DynamicScheduleInfo, DynamicScheduleStage, NoiseType, WaveformType } from '../types';

export class AudioEngine {
  private ctx: AudioContext | null = null;

  // Master Gain & Output
  private masterGain: GainNode | null = null;
  private currentBaseMasterVolume: number = 0.7;

  // Monaural Speaker Mode Nodes
  private speakerCarrierOsc: OscillatorNode | null = null;
  private speakerCarrierGain: GainNode | null = null;
  private speakerLfoOsc: OscillatorNode | null = null;
  private speakerLfoGain: GainNode | null = null;

  // Binaural Headphone Mode Nodes
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private leftPanner: StereoPannerNode | GainNode | null = null;
  private rightPanner: StereoPannerNode | GainNode | null = null;
  private binauralGain: GainNode | null = null;

  // Ambient Noise Nodes
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private noiseGain: GainNode | null = null;
  private brownNoiseBuffer: AudioBuffer | null = null;
  private pinkNoiseBuffer: AudioBuffer | null = null;

  // Background Audio Bridge (Keeps iOS Safari & Android audio alive on lock screen)
  private silentAudioElement: HTMLAudioElement | null = null;

  // Current State
  private _isPlaying: boolean = false;
  private _isFadingOut: boolean = false;
  private params: AudioEngineParams;

  // Dynamic Entrainment Scheduler State
  private dynamicScheduleActive: boolean = false;
  private dynamicStartTime: number = 0;
  private dynamicDemoMultiplier: number = 1.0; // 1.0 = real 45min, 60.0 = demo 45sec
  private dynamicTimerId: number | null = null;
  private onDynamicUpdateCallback: ((info: DynamicScheduleInfo) => void) | null = null;
  private onDynamicCompleteCallback: (() => void) | null = null;

  constructor(initialParams: AudioEngineParams) {
    this.params = { ...initialParams };
    this.currentBaseMasterVolume = initialParams.masterVolume;
  }

  public get isPlaying(): boolean {
    return this._isPlaying;
  }

  public get isFadingOut(): boolean {
    return this._isFadingOut;
  }

  public get isDynamicScheduleActive(): boolean {
    return this.dynamicScheduleActive;
  }

  public get audioContextState(): AudioContextState | 'uninitialized' {
    return this.ctx ? this.ctx.state : 'uninitialized';
  }

  /**
   * Initializes silent audio element that instructs iOS/Android OS
   * to treat this browser session as an active background media player.
   */
  private initSilentAudioBridge(): void {
    if (!this.silentAudioElement && typeof Audio !== 'undefined') {
      const audio = new Audio();
      // Minimal RFC-compliant 1-second 8kHz mono silent WAV file data URI
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      audio.loop = true;
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      this.silentAudioElement = audio;
    }
  }

  private async playSilentAudioBridge(): Promise<void> {
    this.initSilentAudioBridge();
    if (this.silentAudioElement) {
      try {
        this.silentAudioElement.currentTime = 0;
        await this.silentAudioElement.play();
      } catch (err) {
        console.warn('Silent audio background bridge notice:', err);
      }
    }
  }

  private pauseSilentAudioBridge(): void {
    if (this.silentAudioElement) {
      try {
        this.silentAudioElement.pause();
      } catch (_) {}
    }
  }

  /**
   * Registers app with iOS / Android Lock Screen & Notification Center
   */
  public updateMediaSession(title: string = 'Renight 晝夜音療', subtitle: string = '床頭外放揚聲器 (免耳機)'): void {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title,
          artist: subtitle,
          album: '神經科學慢波音療',
          artwork: [
            {
              src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='128' fill='%2308080C'/%3E%3Ccircle cx='256' cy='256' r='180' fill='none' stroke='%236366F1' stroke-width='16' stroke-opacity='0.4'/%3E%3Ccircle cx='256' cy='256' r='130' fill='none' stroke='%238B5CF6' stroke-width='20' stroke-opacity='0.7'/%3E%3Cpath d='M256 150 C200 150 170 200 170 256 C170 312 215 356 270 356 C300 356 325 342 340 320 C310 325 260 305 255 245 C250 195 285 165 315 158 C296 152 276 150 256 150 Z' fill='%23A855F7'/%3E%3Ccircle cx='345' cy='190' r='12' fill='%23818CF8'/%3E%3C/svg%3E",
              sizes: '512x512',
              type: 'image/svg+xml'
            }
          ]
        });
        navigator.mediaSession.playbackState = 'playing';
      } catch (_) {}
    }
  }

  public setupMediaSessionHandlers(onPlayToggle: () => void): void {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => onPlayToggle());
        navigator.mediaSession.setActionHandler('pause', () => onPlayToggle());
        navigator.mediaSession.setActionHandler('stop', () => this.stopImmediate());
      } catch (_) {}
    }
  }

  private initContextIfNeeded(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Auto-resume if iOS throttles or suspends AudioContext
      this.ctx.onstatechange = () => {
        if (this._isPlaying && this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      };

      // Listen to visibilitychange to keep audio running across lock screen
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (this._isPlaying && this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
        });
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Pre-generate noise buffers (Brown noise & Pink noise)
  private getOrCreateNoiseBuffer(ctx: AudioContext, type: 'brown' | 'pink'): AudioBuffer {
    if (type === 'brown' && this.brownNoiseBuffer) return this.brownNoiseBuffer;
    if (type === 'pink' && this.pinkNoiseBuffer) return this.pinkNoiseBuffer;

    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 5; // 5-second seamless loop
    const buffer = ctx.createBuffer(2, bufferSize, sampleRate);

    if (type === 'brown') {
      // Brown (Brownian/Red) noise: integrated white noise (1/f^2)
      for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + (0.025 * white)) / 1.025;
          data[i] = lastOut * 3.5;
        }
      }
      this.brownNoiseBuffer = buffer;
    } else {
      // Pink noise (1/f falloff via Paul Kellet filter approximation)
      for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
      }
      this.pinkNoiseBuffer = buffer;
    }

    return buffer;
  }

  public async start(fadeDuration: number = 2.0): Promise<void> {
    const ctx = this.initContextIfNeeded();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (this._isPlaying) {
      this.stopImmediate();
    }

    const now = ctx.currentTime;
    this.currentBaseMasterVolume = this.params.masterVolume;

    // Master Gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.connect(ctx.destination);

    // Setup Entrainment Synthesizer (Speaker vs Headphone)
    if (this.params.mode === 'speaker') {
      this.setupMonauralSpeakerEngine(ctx, now);
    } else {
      this.setupBinauralHeadphoneEngine(ctx, now);
    }

    // Setup Ambient Noise Masking
    this.setupNoiseEngine(ctx, now);

    // Smooth Fade In ramp
    this.masterGain.gain.linearRampToValueAtTime(this.params.masterVolume, now + fadeDuration);

    this._isPlaying = true;
    this._isFadingOut = false;

    // Start background audio bridge (keeps iOS / Android playback active when screen is locked)
    this.playSilentAudioBridge().catch(() => {});
    this.updateMediaSession(
      'Renight 晝夜音療',
      this.params.mode === 'speaker' ? '床頭揚聲器 (免耳機)' : '立體聲耳機模式'
    );
  }

  /**
   * Speaker-friendly Monaural Beats / Isochronic Amplitude Modulation
   * Formula: Gain(t) = BaseGain * (1 + depth * sin(2*PI*beatFreq*t))
   */
  private setupMonauralSpeakerEngine(ctx: AudioContext, now: number): void {
    const carrier = ctx.createOscillator();
    carrier.type = this.params.waveform;
    const safeCarrierFreq = Math.max(130, this.params.carrierFreq);
    carrier.frequency.setValueAtTime(safeCarrierFreq, now);

    const carrierGain = ctx.createGain();
    const baseGain = 0.55;
    carrierGain.gain.setValueAtTime(baseGain, now);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(this.params.beatFreq, now);

    const lfoGain = ctx.createGain();
    const modulationAmplitude = baseGain * Math.min(0.7, Math.max(0.1, this.params.modulationDepth));
    lfoGain.gain.setValueAtTime(modulationAmplitude, now);

    lfo.connect(lfoGain);
    lfoGain.connect(carrierGain.gain);

    carrier.connect(carrierGain);
    carrierGain.connect(this.masterGain!);

    carrier.start(now);
    lfo.start(now);

    this.speakerCarrierOsc = carrier;
    this.speakerCarrierGain = carrierGain;
    this.speakerLfoOsc = lfo;
    this.speakerLfoGain = lfoGain;
  }

  /**
   * Headphone Mode: Stereo Binaural Beats
   */
  private setupBinauralHeadphoneEngine(ctx: AudioContext, now: number): void {
    const carrier = Math.max(130, this.params.carrierFreq);
    const delta = this.params.beatFreq;
    const fLeft = carrier - (delta / 2);
    const fRight = carrier + (delta / 2);

    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    oscL.type = this.params.waveform;
    oscR.type = this.params.waveform;
    oscL.frequency.setValueAtTime(fLeft, now);
    oscR.frequency.setValueAtTime(fRight, now);

    const binauralGain = ctx.createGain();
    binauralGain.gain.setValueAtTime(0.45, now);

    if ('createStereoPanner' in ctx) {
      const panL = ctx.createStereoPanner();
      const panR = ctx.createStereoPanner();
      panL.pan.setValueAtTime(-1.0, now);
      panR.pan.setValueAtTime(1.0, now);

      oscL.connect(panL);
      panL.connect(binauralGain);

      oscR.connect(panR);
      panR.connect(binauralGain);

      this.leftPanner = panL;
      this.rightPanner = panR;
    } else {
      oscL.connect(binauralGain);
      oscR.connect(binauralGain);
    }

    binauralGain.connect(this.masterGain!);

    oscL.start(now);
    oscR.start(now);

    this.leftOsc = oscL;
    this.rightOsc = oscR;
    this.binauralGain = binauralGain;
  }

  /**
   * Ambient Noise Engine
   */
  private setupNoiseEngine(ctx: AudioContext, now: number): void {
    if (this.params.noiseType === 'off' || this.params.noiseVolume <= 0) {
      return;
    }

    const buffer = this.getOrCreateNoiseBuffer(ctx, this.params.noiseType);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(this.params.noiseType === 'brown' ? 380 : 550, now);
    filter.Q.setValueAtTime(0.7, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(this.params.noiseVolume * 0.65, now);

    source.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain!);

    source.start(now);

    this.noiseSource = source;
    this.noiseFilter = filter;
    this.noiseGain = noiseGain;
  }

  /**
   * Live parameter update without stopping audio playback
   */
  public updateParams(newParams: Partial<AudioEngineParams>): void {
    const prevParams = { ...this.params };
    this.params = { ...this.params, ...newParams };

    if (!this.ctx || !this._isPlaying) return;
    const now = this.ctx.currentTime;

    if (newParams.mode && newParams.mode !== prevParams.mode) {
      this.start(1.0);
      return;
    }

    if (newParams.masterVolume !== undefined && this.masterGain && !this._isFadingOut && !this.dynamicScheduleActive) {
      this.currentBaseMasterVolume = newParams.masterVolume;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(newParams.masterVolume, now + 0.1);
    }

    if (this.params.mode === 'speaker') {
      if (this.speakerCarrierOsc && newParams.carrierFreq !== undefined) {
        const safeCarrier = Math.max(130, newParams.carrierFreq);
        this.speakerCarrierOsc.frequency.cancelScheduledValues(now);
        this.speakerCarrierOsc.frequency.linearRampToValueAtTime(safeCarrier, now + 0.2);
      }
      if (this.speakerLfoOsc && newParams.beatFreq !== undefined) {
        this.speakerLfoOsc.frequency.cancelScheduledValues(now);
        this.speakerLfoOsc.frequency.linearRampToValueAtTime(newParams.beatFreq, now + 0.2);
      }
      if (this.speakerLfoGain && (newParams.modulationDepth !== undefined || newParams.carrierFreq !== undefined)) {
        const baseGain = 0.55;
        const modDepth = Math.min(0.7, Math.max(0.1, this.params.modulationDepth));
        this.speakerLfoGain.gain.cancelScheduledValues(now);
        this.speakerLfoGain.gain.linearRampToValueAtTime(baseGain * modDepth, now + 0.2);
      }
      if (this.speakerCarrierOsc && newParams.waveform) {
        this.speakerCarrierOsc.type = newParams.waveform;
      }
    }

    if (this.params.mode === 'headphone') {
      const carrier = Math.max(130, this.params.carrierFreq);
      const delta = this.params.beatFreq;
      const fLeft = carrier - (delta / 2);
      const fRight = carrier + (delta / 2);

      if (this.leftOsc) {
        this.leftOsc.frequency.cancelScheduledValues(now);
        this.leftOsc.frequency.linearRampToValueAtTime(fLeft, now + 0.2);
        if (newParams.waveform) this.leftOsc.type = newParams.waveform;
      }
      if (this.rightOsc) {
        this.rightOsc.frequency.cancelScheduledValues(now);
        this.rightOsc.frequency.linearRampToValueAtTime(fRight, now + 0.2);
        if (newParams.waveform) this.rightOsc.type = newParams.waveform;
      }
    }

    if (newParams.noiseType !== undefined && newParams.noiseType !== prevParams.noiseType) {
      if (this.noiseSource) {
        try { this.noiseSource.stop(); } catch (_) {}
        this.noiseSource = null;
      }
      this.setupNoiseEngine(this.ctx, now);
    } else if (newParams.noiseVolume !== undefined && this.noiseGain) {
      this.noiseGain.gain.cancelScheduledValues(now);
      this.noiseGain.gain.linearRampToValueAtTime(newParams.noiseVolume * 0.65, now + 0.1);
    }
  }

  // =========================================================================
  // 4. Patented-Equivalent Dynamic Entrainment Scheduler (45-Minute Journey)
  // =========================================================================
  /**
   * Start 3-stage dynamic frequency scheduler over a 45-minute session
   * Stage 1 (0 - 10 min): 6.0 Hz -> 4.0 Hz (Theta), mod depth 0.35, brown noise 40%
   * Stage 2 (10 - 40 min): 4.0 Hz -> 0.8 Hz (Delta), mod depth 0.25, brown noise 20%
   * Stage 3 (40 - 45 min): Master GainNode ramps down smoothly to 0 (Exponential fade-out)
   *
   * @param demoSpeed If true, fast-forwards 45-minute journey into 45 seconds for testing
   */
  public async startDynamicSchedule(
    demoSpeed: boolean = false,
    onUpdate?: (info: DynamicScheduleInfo) => void,
    onComplete?: () => void
  ): Promise<void> {
    this.dynamicScheduleActive = true;
    this.dynamicDemoMultiplier = demoSpeed ? 60.0 : 1.0;
    this.dynamicStartTime = Date.now();
    this.onDynamicUpdateCallback = onUpdate || null;
    this.onDynamicCompleteCallback = onComplete || null;

    // Configure initial parameters for Stage 1
    this.params.beatFreq = 6.0;
    this.params.modulationDepth = 0.35;
    this.params.noiseType = 'brown';
    this.params.noiseVolume = 0.40;

    await this.start(2.0);

    if (this.dynamicTimerId !== null) {
      clearInterval(this.dynamicTimerId);
    }

    // Run tick every 500ms
    this.dynamicTimerId = window.setInterval(() => {
      this.tickDynamicSchedule();
    }, 500);

    this.tickDynamicSchedule(); // initial tick
  }

  public stopDynamicSchedule(): void {
    if (this.dynamicTimerId !== null) {
      clearInterval(this.dynamicTimerId);
      this.dynamicTimerId = null;
    }
    this.dynamicScheduleActive = false;
    this.dynamicStartTime = 0;
  }

  private tickDynamicSchedule(): void {
    if (!this.dynamicScheduleActive || !this._isPlaying || !this.ctx) return;

    const realElapsedSec = (Date.now() - this.dynamicStartTime) / 1000;
    const sessionElapsedSec = realElapsedSec * this.dynamicDemoMultiplier;
    const totalDurationSec = 45 * 60; // 2700s

    let stage: DynamicScheduleStage = 1;
    let stageName = '階段一：思緒降溫';
    let stageDescription = '透過 6.0 Hz 降至 4.0 Hz Theta 波與 40% 棕色噪聲安撫大腦飛旋思緒';
    let targetBeatFreq = 6.0;
    let targetModDepth = 0.35;
    let targetNoiseVol = 0.40;
    let masterMultiplier = 1.0;

    if (sessionElapsedSec <= 600) {
      // 階段一 (0 - 10 分鐘): 6.0 Hz 降至 4.0 Hz (Theta 頻段)
      stage = 1;
      const p = Math.min(1.0, Math.max(0.0, sessionElapsedSec / 600));
      targetBeatFreq = 6.0 - p * (6.0 - 4.0); // 6.0 -> 4.0 Hz
      targetModDepth = 0.35;
      targetNoiseVol = 0.40;
      stageName = '階段一：思緒降溫 (Theta 減壓)';
      stageDescription = `撫平飛旋思緒：大腦同步頻率從 6.0 Hz 降至 4.0 Hz (本階段剩餘 ${Math.round((1 - p) * 10)} 分鐘)。`;
    } else if (sessionElapsedSec <= 2400) {
      // 階段二 (10 - 40 分鐘): 4.0 Hz 平滑線性過渡至 0.8 Hz (Delta 慢波)
      stage = 2;
      const p = Math.min(1.0, Math.max(0.0, (sessionElapsedSec - 600) / 1800));
      targetBeatFreq = 4.0 - p * (4.0 - 0.8); // 4.0 -> 0.8 Hz
      targetModDepth = 0.35 - p * (0.35 - 0.25); // 0.35 -> 0.25
      targetNoiseVol = 0.40 - p * (0.40 - 0.20); // 0.40 -> 0.20
      stageName = '階段二：深層睡眠誘導 (Delta 慢波)';
      stageDescription = `深層慢波誘導：律動降低至 ${targetBeatFreq.toFixed(1)} Hz Delta。棕色噪聲降至 ${Math.round(targetNoiseVol * 100)}% 避免聽覺疲勞。`;
    } else if (sessionElapsedSec <= totalDurationSec) {
      // 階段三 (40 - 45 分鐘): 主輸出音量平滑指數漸弱至 0
      stage = 3;
      const p = Math.min(1.0, Math.max(0.0, (sessionElapsedSec - 2400) / 300));
      targetBeatFreq = 0.8;
      targetModDepth = 0.25 * (1 - p);
      targetNoiseVol = 0.20 * (1 - p);
      // Exponential fade-out curve
      masterMultiplier = Math.max(0.0001, Math.pow(1 - p, 2.2));
      stageName = '階段三：無縫靜音退出';
      stageDescription = `無感平滑漸弱：剩餘 ${Math.round((1 - p) * 5)} 分鐘。聲音平順消退至寂靜，不驚擾睡眠。`;
    } else {
      // Completed!
      stage = 'completed';
      stageName = '誘導週期已完成';
      stageDescription = '45分鐘動態律動已平順結束，祝您整夜好眠。';
      this.stopDynamicSchedule();
      this.stopImmediate();
      if (this.onDynamicCompleteCallback) {
        this.onDynamicCompleteCallback();
      }
      return;
    }

    // Apply audio node updates
    const now = this.ctx.currentTime;

    // Apply beat frequency
    this.params.beatFreq = targetBeatFreq;
    if (this.params.mode === 'speaker' && this.speakerLfoOsc) {
      this.speakerLfoOsc.frequency.cancelScheduledValues(now);
      this.speakerLfoOsc.frequency.setValueAtTime(targetBeatFreq, now);
    } else if (this.params.mode === 'headphone' && this.leftOsc && this.rightOsc) {
      const carrier = Math.max(130, this.params.carrierFreq);
      this.leftOsc.frequency.setValueAtTime(carrier - targetBeatFreq / 2, now);
      this.rightOsc.frequency.setValueAtTime(carrier + targetBeatFreq / 2, now);
    }

    // Apply modulation depth
    this.params.modulationDepth = targetModDepth;
    if (this.speakerLfoGain) {
      const baseGain = 0.55;
      this.speakerLfoGain.gain.setValueAtTime(baseGain * targetModDepth, now);
    }

    // Apply noise volume
    this.params.noiseVolume = targetNoiseVol;
    if (this.noiseGain) {
      this.noiseGain.gain.setValueAtTime(targetNoiseVol * 0.65, now);
    }

    // Apply master gain ramp in Stage 3
    if (this.masterGain) {
      const currentTargetMaster = this.currentBaseMasterVolume * masterMultiplier;
      this.masterGain.gain.setValueAtTime(Math.max(0.0001, currentTargetMaster), now);
    }

    // Notify listeners
    if (this.onDynamicUpdateCallback) {
      const info: DynamicScheduleInfo = {
        enabled: true,
        stage,
        stageName,
        stageDescription,
        elapsedSeconds: sessionElapsedSec,
        totalDurationSeconds: totalDurationSec,
        currentBeatFreq: targetBeatFreq,
        currentModDepth: targetModDepth,
        currentNoiseVolume: targetNoiseVol,
        progressPercent: Math.min(100, (sessionElapsedSec / totalDurationSec) * 100),
        isDemoSpeed: this.dynamicDemoMultiplier > 1.0,
      };
      this.onDynamicUpdateCallback(info);
    }
  }

  /**
   * Pre-fade ramp down for Sleep Timer:
   * Smoothly decreases volume to 0 over rampSeconds (e.g. 300s = 5 minutes).
   */
  public scheduleSleepTimerRamp(rampSeconds: number): void {
    if (!this.ctx || !this.masterGain || !this._isPlaying) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + rampSeconds);
  }

  /**
   * Smooth Fade Out and Stop
   */
  public async fadeOutAndStop(fadeDuration: number = 2.5): Promise<void> {
    this.stopDynamicSchedule();

    if (!this.ctx || !this._isPlaying || !this.masterGain) {
      this.stopImmediate();
      return;
    }

    this._isFadingOut = true;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);

    setTimeout(() => {
      this.stopImmediate();
      this._isFadingOut = false;
    }, fadeDuration * 1000 + 100);
  }

  public stopImmediate(): void {
    this.stopDynamicSchedule();
    this.pauseSilentAudioBridge();
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }

    try {
      if (this.speakerCarrierOsc) { this.speakerCarrierOsc.stop(); this.speakerCarrierOsc.disconnect(); }
      if (this.speakerLfoOsc) { this.speakerLfoOsc.stop(); this.speakerLfoOsc.disconnect(); }
      if (this.leftOsc) { this.leftOsc.stop(); this.leftOsc.disconnect(); }
      if (this.rightOsc) { this.rightOsc.stop(); this.rightOsc.disconnect(); }
      if (this.noiseSource) { this.noiseSource.stop(); this.noiseSource.disconnect(); }
      if (this.masterGain) { this.masterGain.disconnect(); }
    } catch (_) {}

    this.speakerCarrierOsc = null;
    this.speakerCarrierGain = null;
    this.speakerLfoOsc = null;
    this.speakerLfoGain = null;
    this.leftOsc = null;
    this.rightOsc = null;
    this.noiseSource = null;
    this.noiseFilter = null;
    this.noiseGain = null;
    this.masterGain = null;

    this._isPlaying = false;
    this._isFadingOut = false;
  }

  /**
   * Pure Synthesized Circadian Alarm Tone
   */
  public playSynthesizedChime(crescendoSeconds: number = 20): () => void {
    const ctx = this.initContextIfNeeded();
    const startTime = ctx.currentTime;

    const chimeGain = ctx.createGain();
    chimeGain.gain.setValueAtTime(0.001, startTime);
    chimeGain.gain.linearRampToValueAtTime(0.7, startTime + crescendoSeconds);
    chimeGain.connect(ctx.destination);

    const baseFreqs = [261.63, 329.63, 392.00, 523.25, 659.25];

    const playChordBurst = () => {
      const burstTime = ctx.currentTime;
      baseFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * (1 + (idx * 0.002)), burstTime);

        noteGain.gain.setValueAtTime(0.0001, burstTime);
        noteGain.gain.linearRampToValueAtTime(0.25 / (idx + 1), burstTime + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, burstTime + 3.8);

        osc.connect(noteGain);
        noteGain.connect(chimeGain);

        osc.start(burstTime);
        osc.stop(burstTime + 4.0);
      });
    };

    playChordBurst();
    const intervalId = window.setInterval(playChordBurst, 4000);

    return () => {
      clearInterval(intervalId);
      const stopTime = ctx.currentTime;
      chimeGain.gain.cancelScheduledValues(stopTime);
      chimeGain.gain.linearRampToValueAtTime(0.0001, stopTime + 1.5);
      setTimeout(() => {
        try { chimeGain.disconnect(); } catch (_) {}
      }, 1600);
    };
  }
}
