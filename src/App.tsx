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
import { Sparkles, Waves, Clock, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

type TabView = 'journey' | 'presets' | 'alarm' | 'tuning';

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
  
  // Tab state for clean, uncluttered bedtime hierarchy
  const [activeTab, setActiveTab] = useState<TabView>('journey');

  const handleApplyIntakePreset = (preset: SoundPreset, targetHours: number) => {
    applyPreset(preset);
    if (targetHours <= 0.5) {
      setTimerPreset(30);
    } else {
      setTimerPreset(45);
    }
    startPlayback(false, false);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col items-center px-4 sm:px-6 pb-16 pt-[env(safe-area-inset-top,0.75rem)] font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Background ambient radial gradients */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-indigo-950/20 via-purple-950/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <main className="w-full max-w-md sm:max-w-lg flex flex-col items-center">
        {/* App Header */}
        <Header
          onOpenIntake={() => setIsIntakeOpen(true)}
          onOpenNightstand={() => setIsNightstandOpen(true)}
          isSpeakerMode={params.mode === 'speaker'}
        />

        {/* Compact Delivery Mode Toggle */}
        <SpeakerModeToggle
          mode={params.mode}
          onToggle={toggleSpeakerMode}
          onToggleNightstandOled={() => setIsNightstandOpen(true)}
          isNightstandActive={isNightstandOpen}
        />

        {/* Central Core Hero: Pulsing Visualizer */}
        <PulsingVisualizer
          isPlaying={isPlaying}
          isFadingOut={isFadingOut}
          beatFreq={params.beatFreq}
          carrierFreq={params.carrierFreq}
          mode={params.mode}
          onTogglePlay={togglePlayback}
          stageName={dynamicInfo.stage !== 'idle' ? dynamicInfo.stageName : undefined}
        />

        {/* Intuitive Bedtime Segmented Control (Keeps view clean & calm) */}
        <div className="w-full grid grid-cols-4 gap-1 p-1 bg-obsidian-900/90 border border-slate-800/80 rounded-2xl mb-4 backdrop-blur-md shadow-sm">
          <button
            onClick={() => setActiveTab('journey')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium transition ${
              activeTab === 'journey'
                ? 'bg-gradient-to-b from-indigo-900/60 to-obsidian-850 text-white border border-indigo-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 mb-0.5 text-indigo-400" />
            <span className="text-[11px]">45分排程</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium transition ${
              activeTab === 'presets'
                ? 'bg-gradient-to-b from-purple-900/60 to-obsidian-850 text-white border border-purple-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Waves className="w-3.5 h-3.5 mb-0.5 text-purple-400" />
            <span className="text-[11px]">音療預設</span>
          </button>

          <button
            onClick={() => setActiveTab('alarm')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium transition ${
              activeTab === 'alarm'
                ? 'bg-gradient-to-b from-blue-900/60 to-obsidian-850 text-white border border-blue-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 mb-0.5 text-blue-400" />
            <span className="text-[11px]">節律鬧鐘</span>
          </button>

          <button
            onClick={() => setActiveTab('tuning')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium transition ${
              activeTab === 'tuning'
                ? 'bg-gradient-to-b from-slate-800 to-obsidian-850 text-white border border-slate-700 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 mb-0.5 text-slate-300" />
            <span className="text-[11px]">微調定時</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="w-full transition-all duration-300">
          {activeTab === 'journey' && (
            <div className="animate-fade-in">
              <DynamicSchedulerBanner
                info={dynamicInfo}
                isPlaying={isPlaying}
                onStartSchedule={(demoSpeed) => {
                  setDynamicDemoSpeed(demoSpeed);
                  startPlayback(true, demoSpeed);
                }}
                onToggleDemoSpeed={setDynamicDemoSpeed}
              />
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="animate-fade-in">
              <SoundPresetSelector
                activePresetId={activePresetId}
                onSelectPreset={(preset) => {
                  applyPreset(preset);
                }}
              />
            </div>
          )}

          {activeTab === 'alarm' && (
            <div className="animate-fade-in">
              <CircadianAlarmModule
                onTestChime={testAlarmChime}
                isAlarmTesting={isAlarmTesting}
              />
            </div>
          )}

          {activeTab === 'tuning' && (
            <div className="animate-fade-in">
              <AudioTuningDrawer
                params={params}
                timerMinutes={timerMinutes}
                remainingSeconds={remainingTimerSeconds}
                onUpdateParams={updateParamValues}
                onSetTimer={setTimerPreset}
              />
            </div>
          )}
        </div>

        {/* Neuroscience & Acoustic Tuning Footer Note */}
        <footer className="w-full text-center text-xs text-slate-500 space-y-1.5 pt-6 border-t border-slate-900 pb-8 mt-2">
          <div className="flex items-center justify-center gap-1.5 text-slate-400">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span className="font-medium text-slate-300 text-[11px]">Renight 純原生 Web Audio 聲學合成</span>
          </div>
          <p className="text-[10px] leading-relaxed max-w-xs mx-auto text-slate-500">
            免戴耳機床頭外放調校 • 零外部音檔依賴 • 全程背景播放與離線快取
          </p>
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
