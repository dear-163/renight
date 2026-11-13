import React, { useState } from 'react';
import { useAudioEngine } from './audio/useAudioEngine';
import { Header } from './components/Header';
import { PulsingVisualizer } from './components/PulsingVisualizer';
import { DynamicSchedulerBanner } from './components/DynamicSchedulerBanner';
import { SpeakerModeToggle } from './components/SpeakerModeToggle';
import { SoundPresetSelector } from './components/SoundPresetSelector';
import { CircadianAlarmModule } from './components/CircadianAlarmModule';
import { AudioTuningDrawer } from './components/AudioTuningDrawer';
import { SleepIntakeModal } from './components/SleepIntakeModal';
import { NightstandOledView } from './components/NightstandOledView';
import { SoundPreset } from './types';
import { Shield, Sparkles, Moon, Volume2 } from 'lucide-react';

export default function App() {
  const {
    params,
    isPlaying,
    isFadingOut,
    activePresetId,
    timerMinutes,
    remainingTimerSeconds,
    dynamicInfo,
    isAlarmTesting,
    wakeLockEnabled,
    toggleWakeLock,
    updateParamValues,
    togglePlayback,
    startPlayback,
    applyPreset,
    setTimerPreset,
    toggleSpeakerMode,
    testAlarmChime,
    setDynamicDemoSpeed,
  } = useAudioEngine();

  const [isIntakeOpen, setIsIntakeOpen] = useState<boolean>(false);
  const [isNightstandOpen, setIsNightstandOpen] = useState<boolean>(false);

  const handleApplyIntakePreset = (preset: SoundPreset, targetHours: number) => {
    applyPreset(preset);
    // If target hours is 0.5 (nap), set 30m timer, else set 45m or hours
    if (targetHours <= 0.5) {
      setTimerPreset(30);
    } else {
      setTimerPreset(45); // default nightstand auto-off
    }
    // Start playback immediately on intake submission
    startPlayback(false, false);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col items-center px-4 sm:px-6 pb-12 pt-[env(safe-area-inset-top,1rem)] font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Background ambient radial gradients */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-indigo-950/20 via-purple-950/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Container constrained to mobile phone width for mobile-first PWA experience */}
      <main className="w-full max-w-md sm:max-w-lg flex flex-col items-center">
        {/* App Header */}
        <Header
          onOpenIntake={() => setIsIntakeOpen(true)}
          onOpenNightstand={() => setIsNightstandOpen(true)}
          isSpeakerMode={params.mode === 'speaker'}
        />

        {/* Acoustic Delivery Mode (Speaker vs Headphone) */}
        <SpeakerModeToggle
          mode={params.mode}
          onToggle={toggleSpeakerMode}
          onToggleNightstandOled={() => setIsNightstandOpen(true)}
          isNightstandActive={isNightstandOpen}
        />

        {/* Central Responsive Pulsing Visualizer */}
        <PulsingVisualizer
          isPlaying={isPlaying}
          isFadingOut={isFadingOut}
          beatFreq={params.beatFreq}
          carrierFreq={params.carrierFreq}
          mode={params.mode}
          onTogglePlay={togglePlayback}
          stageName={dynamicInfo.stage !== 'idle' ? dynamicInfo.stageName : undefined}
        />

        {/* 4. Patented-Equivalent Dynamic Entrainment Scheduler (45-Minute Journey) */}
        <DynamicSchedulerBanner
          info={dynamicInfo}
          isPlaying={isPlaying}
          onStartSchedule={(demoSpeed) => {
            setDynamicDemoSpeed(demoSpeed);
            startPlayback(true, demoSpeed);
          }}
          onToggleDemoSpeed={setDynamicDemoSpeed}
        />

        {/* 90-Minute Circadian Sleep Cycle & Smart Alarm */}
        <CircadianAlarmModule
          onTestChime={testAlarmChime}
          isAlarmTesting={isAlarmTesting}
        />

        {/* Neuroscience Preset Selector */}
        <SoundPresetSelector
          activePresetId={activePresetId}
          onSelectPreset={(preset) => {
            applyPreset(preset);
          }}
        />

        {/* Fine Tuning Drawer & Sleep Timer */}
        <AudioTuningDrawer
          params={params}
          timerMinutes={timerMinutes}
          remainingSeconds={remainingTimerSeconds}
          onUpdateParams={updateParamValues}
          onSetTimer={setTimerPreset}
        />

        {/* Neuroscience & Acoustic Tuning Footer Note */}
        <footer className="w-full text-center text-xs text-slate-500 space-y-2 pt-4 border-t border-slate-900 pb-8">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium text-slate-300">Renight 純原生 Web Audio 聲學合成引擎</span>
          </div>
          <p className="text-[11px] leading-relaxed max-w-sm mx-auto text-slate-500">
            零外部音檔依賴。專為手機揚聲器外放調校之單聲道調幅技術，載波頻率嚴格限制於 130 Hz 以上避免破音與失真。
          </p>
          <div className="text-[10px] text-slate-600 font-mono">
            晝夜節律睡眠療法 • 離線優先 Progressive Web App
          </div>
        </footer>
      </main>

      {/* Sleep Intake Check-in Modal */}
      <SleepIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onApplyIntakePreset={handleApplyIntakePreset}
      />

      {/* OLED Nightstand Bedside Pure Black Mode */}
      <NightstandOledView
        isOpen={isNightstandOpen}
        onClose={() => setIsNightstandOpen(false)}
        isPlaying={isPlaying}
        onTogglePlay={togglePlayback}
        beatFreq={params.beatFreq}
        remainingSeconds={remainingTimerSeconds}
        dynamicInfo={dynamicInfo}
        wakeLockEnabled={wakeLockEnabled}
        onToggleWakeLock={toggleWakeLock}
      />
    </div>
  );
}
