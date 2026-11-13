import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioEngine } from './AudioEngine';
import { AudioEngineParams, AudioMode, DynamicScheduleInfo, SoundPreset } from '../types';
import { DEFAULT_PRESET } from './presets';

const STORAGE_KEY_PREFS = 'renight_audio_prefs_v1';

const INITIAL_PARAMS: AudioEngineParams = {
  carrierFreq: DEFAULT_PRESET.carrierFreq,
  beatFreq: DEFAULT_PRESET.beatFreq,
  mode: 'speaker', // Nightstand Speaker is DEFAULT as requested
  waveform: DEFAULT_PRESET.waveform,
  modulationDepth: DEFAULT_PRESET.modulationDepth,
  noiseType: DEFAULT_PRESET.noiseType,
  noiseVolume: DEFAULT_PRESET.noiseVolume,
  masterVolume: 0.75,
  isNightstandMode: true,
};

export function useAudioEngine() {
  const [params, setParams] = useState<AudioEngineParams>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      if (saved) return { ...INITIAL_PARAMS, ...JSON.parse(saved) };
    } catch (_) {}
    return INITIAL_PARAMS;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string>(DEFAULT_PRESET.id);

  // Sleep Timer (minutes: 0 = infinite, 15, 30, 45, 60, 90)
  const [timerMinutes, setTimerMinutes] = useState<number>(45); // default 45m in Nightstand mode
  const [remainingTimerSeconds, setRemainingTimerSeconds] = useState<number | null>(45 * 60);
  const timerEndTimestampRef = useRef<number | null>(null);

  // Screen Wake Lock State (keeps screen awake on bedside nightstand)
  const [wakeLockEnabled, setWakeLockEnabled] = useState<boolean>(true);
  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);
  const wakeLockSentinelRef = useRef<WakeLockSentinel | null>(null);

  // Dynamic Entrainment Scheduler State (45m 3-stage)
  const [dynamicInfo, setDynamicInfo] = useState<DynamicScheduleInfo>({
    enabled: true, // enabled by default with the 45m scheduler preset
    stage: 'idle',
    stageName: '動態神經律動已就緒',
    stageDescription: '專利級45分鐘入眠：Theta 降溫 (6→4 Hz)、Delta 深度慢波 (0.8 Hz) 與平滑靜音退出。',
    elapsedSeconds: 0,
    totalDurationSeconds: 45 * 60,
    currentBeatFreq: 6.0,
    currentModDepth: 0.35,
    currentNoiseVolume: 0.40,
    progressPercent: 0,
    isDemoSpeed: false,
  });

  const engineRef = useRef<AudioEngine | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const stopAlarmChimeFnRef = useRef<(() => void) | null>(null);
  const isAlarmTestingRef = useRef<boolean>(false);
  const [isAlarmTesting, setIsAlarmTesting] = useState<boolean>(false);

  // Initialize engine singleton once
  if (!engineRef.current) {
    engineRef.current = new AudioEngine(params);
  }

  // Save preferences to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(params));
    } catch (_) {}
  }, [params]);

  // Screen Wake Lock Acquisition & Release
  const acquireWakeLock = useCallback(async () => {
    if (!wakeLockEnabled || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    try {
      if (wakeLockSentinelRef.current && !wakeLockSentinelRef.current.released) {
        return;
      }
      const sentinel = await navigator.wakeLock.request('screen');
      wakeLockSentinelRef.current = sentinel;
      setIsWakeLockActive(true);
      sentinel.addEventListener('release', () => {
        setIsWakeLockActive(false);
        wakeLockSentinelRef.current = null;
      });
    } catch (err) {
      console.log('Screen Wake Lock notice:', err);
    }
  }, [wakeLockEnabled]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockSentinelRef.current) {
      try {
        await wakeLockSentinelRef.current.release();
      } catch (_) {}
      wakeLockSentinelRef.current = null;
    }
    setIsWakeLockActive(false);
  }, []);

  // Sync wake lock with playback state & visibility
  useEffect(() => {
    if (isPlaying && wakeLockEnabled) {
      acquireWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isPlaying && wakeLockEnabled) {
        acquireWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isPlaying, wakeLockEnabled, acquireWakeLock, releaseWakeLock]);

  // Wall-Clock Based Sleep Timer Countdown (Survives mobile screen locking without clock drift)
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (isPlaying && timerMinutes > 0) {
      if (!timerEndTimestampRef.current) {
        timerEndTimestampRef.current = Date.now() + (remainingTimerSeconds ?? (timerMinutes * 60)) * 1000;
      }

      timerIntervalRef.current = window.setInterval(() => {
        if (!timerEndTimestampRef.current) return;
        const now = Date.now();
        const diffSeconds = Math.max(0, Math.round((timerEndTimestampRef.current - now) / 1000));
        setRemainingTimerSeconds(diffSeconds);

        if (diffSeconds <= 0) {
          // Timer finished: fade out and stop
          if (engineRef.current) {
            engineRef.current.fadeOutAndStop(3.0);
          }
          setIsPlaying(false);
          timerEndTimestampRef.current = null;
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
        } else if (diffSeconds === 300 && engineRef.current) {
          // Pre-fade ramp down for the final 5 minutes
          engineRef.current.scheduleSleepTimerRamp(300);
        }
      }, 1000);
    } else if (!isPlaying) {
      timerEndTimestampRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isPlaying, timerMinutes]);

  const updateParamValues = useCallback((newParams: Partial<AudioEngineParams>) => {
    setParams((prev) => {
      const updated = { ...prev, ...newParams };
      if (engineRef.current) {
        engineRef.current.updateParams(updated);
      }
      return updated;
    });
  }, []);

  const startPlayback = useCallback(async (isDynamic: boolean = false, isDemo: boolean = false) => {
    if (!engineRef.current) return;

    if (isDynamic || activePresetId === 'dynamic-45m-scheduler') {
      await engineRef.current.startDynamicSchedule(
        isDemo,
        (info) => {
          setDynamicInfo(info);
          setParams((prev) => ({
            ...prev,
            beatFreq: info.currentBeatFreq,
            modulationDepth: info.currentModDepth,
            noiseVolume: info.currentNoiseVolume,
          }));
        },
        () => {
          setIsPlaying(false);
          setDynamicInfo((prev) => ({ ...prev, stage: 'completed' }));
        }
      );
    } else {
      await engineRef.current.start(2.0);
    }

    setIsPlaying(true);
    setIsFadingOut(false);

    if (timerMinutes > 0) {
      const totalSec = timerMinutes * 60;
      setRemainingTimerSeconds(totalSec);
      timerEndTimestampRef.current = Date.now() + totalSec * 1000;
    }
  }, [activePresetId, timerMinutes]);

  const stopPlayback = useCallback(async (immediate: boolean = false) => {
    if (!engineRef.current) return;
    timerEndTimestampRef.current = null;
    if (immediate) {
      engineRef.current.stopImmediate();
      setIsPlaying(false);
      setIsFadingOut(false);
    } else {
      setIsFadingOut(true);
      await engineRef.current.fadeOutAndStop(2.5);
      setIsPlaying(false);
      setIsFadingOut(false);
    }
    setDynamicInfo((prev) => ({ ...prev, stage: 'idle' }));
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopPlayback(false);
    } else {
      const isDynamic = activePresetId === 'dynamic-45m-scheduler';
      startPlayback(isDynamic, dynamicInfo.isDemoSpeed);
    }
  }, [isPlaying, activePresetId, dynamicInfo.isDemoSpeed, startPlayback, stopPlayback]);

  // Connect MediaSession lock screen actions
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setupMediaSessionHandlers(togglePlayback);
    }
  }, [togglePlayback]);

  const applyPreset = useCallback((preset: SoundPreset) => {
    setActivePresetId(preset.id);
    const newSettings: Partial<AudioEngineParams> = {
      carrierFreq: preset.carrierFreq,
      beatFreq: preset.beatFreq,
      waveform: preset.waveform,
      modulationDepth: preset.modulationDepth,
      noiseType: preset.noiseType,
      noiseVolume: preset.noiseVolume,
    };
    updateParamValues(newSettings);

    if (preset.isDynamicSchedule) {
      setTimerMinutes(45);
      setRemainingTimerSeconds(45 * 60);
      timerEndTimestampRef.current = Date.now() + 45 * 60 * 1000;
      setDynamicInfo((prev) => ({
        ...prev,
        enabled: true,
        stage: 'idle',
        stageName: '階段一：思緒降溫已就緒 (45分鐘)',
        currentBeatFreq: 6.0,
      }));
    } else {
      setDynamicInfo((prev) => ({ ...prev, enabled: false, stage: 'idle' }));
    }
  }, [updateParamValues]);

  const setTimerPreset = useCallback((minutes: number) => {
    setTimerMinutes(minutes);
    if (minutes > 0) {
      setRemainingTimerSeconds(minutes * 60);
      timerEndTimestampRef.current = Date.now() + minutes * 60 * 1000;
    } else {
      setRemainingTimerSeconds(null);
      timerEndTimestampRef.current = null;
    }
  }, []);

  const toggleSpeakerMode = useCallback((mode: AudioMode) => {
    updateParamValues({
      mode,
      carrierFreq: mode === 'speaker' ? Math.max(130, params.carrierFreq) : params.carrierFreq
    });
  }, [params.carrierFreq, updateParamValues]);

  // Test Circadian Alarm Harmonic Chime
  const testAlarmChime = useCallback(() => {
    if (!engineRef.current) return;
    if (isAlarmTestingRef.current) {
      if (stopAlarmChimeFnRef.current) {
        stopAlarmChimeFnRef.current();
        stopAlarmChimeFnRef.current = null;
      }
      isAlarmTestingRef.current = false;
      setIsAlarmTesting(false);
    } else {
      stopAlarmChimeFnRef.current = engineRef.current.playSynthesizedChime(15);
      isAlarmTestingRef.current = true;
      setIsAlarmTesting(true);
    }
  }, []);

  const stopAlarmChime = useCallback(() => {
    if (stopAlarmChimeFnRef.current) {
      stopAlarmChimeFnRef.current();
      stopAlarmChimeFnRef.current = null;
    }
    isAlarmTestingRef.current = false;
    setIsAlarmTesting(false);
  }, []);

  return {
    params,
    isPlaying,
    isFadingOut,
    activePresetId,
    timerMinutes,
    remainingTimerSeconds,
    dynamicInfo,
    isAlarmTesting,
    wakeLockEnabled,
    isWakeLockActive,
    toggleWakeLock: () => setWakeLockEnabled((prev) => !prev),
    updateParamValues,
    togglePlayback,
    startPlayback,
    stopPlayback,
    applyPreset,
    setTimerPreset,
    toggleSpeakerMode,
    testAlarmChime,
    stopAlarmChime,
    setDynamicDemoSpeed: (isDemo: boolean) => {
      setDynamicInfo((prev) => ({ ...prev, isDemoSpeed: isDemo }));
    }
  };
}
