import React, { useMemo } from 'react';
import { Play, Pause, Moon } from 'lucide-react';
import { AudioMode } from '../types';

interface PulsingVisualizerProps {
  isPlaying: boolean;
  isFadingOut: boolean;
  beatFreq: number;
  carrierFreq: number;
  mode: AudioMode;
  onTogglePlay: () => void;
  stageName?: string;
}

export const PulsingVisualizer: React.FC<PulsingVisualizerProps> = ({
  isPlaying,
  isFadingOut,
  beatFreq,
  carrierFreq,
  mode,
  onTogglePlay,
  stageName,
}) => {
  // Determine frequency brainwave band in Chinese
  const band = useMemo(() => {
    if (beatFreq <= 1.0) return { name: '次慢波 (修復深度)', label: 'δ', color: 'from-indigo-600 to-blue-700', text: 'text-indigo-400' };
    if (beatFreq <= 4.0) return { name: 'Delta 慢波 (深層入眠)', label: 'δ', color: 'from-indigo-500 to-purple-600', text: 'text-purple-300' };
    if (beatFreq <= 7.5) return { name: 'Theta 波 (朦朧減壓)', label: 'θ', color: 'from-purple-500 to-fuchsia-600', text: 'text-fuchsia-300' };
    return { name: 'Alpha 波 (安靜閉目)', label: 'α', color: 'from-amber-500 to-orange-600', text: 'text-amber-300' };
  }, [beatFreq]);

  // CSS pulse duration directly synced to beat frequency: duration = 1 / Hz seconds
  const pulseDuration = useMemo(() => {
    const clampedHz = Math.max(0.5, Math.min(8.0, beatFreq));
    return (1 / clampedHz).toFixed(2);
  }, [beatFreq]);

  return (
    <div className="relative flex flex-col items-center justify-center my-6 select-none">
      {/* Outer ambient glow halo */}
      <div
        className={`absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full blur-3xl transition-opacity duration-1000 ${
          isPlaying ? 'opacity-40 bg-indigo-600/40' : 'opacity-10 bg-slate-700/20'
        }`}
      />

      {/* Main interactive pulsing ring container */}
      <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
        {/* Dynamic harmonic ripple rings */}
        {isPlaying && (
          <>
            <div
              className="absolute inset-0 rounded-full border border-indigo-500/25 pointer-events-none"
              style={{
                animation: `ping ${Math.max(1.5, parseFloat(pulseDuration) * 2)}s cubic-bezier(0, 0, 0.2, 1) infinite`,
              }}
            />
            <div
              className="absolute -inset-4 rounded-full border border-purple-500/15 pointer-events-none"
              style={{
                animation: `pulse ${Math.max(1.0, parseFloat(pulseDuration))}s ease-in-out infinite`,
              }}
            />
          </>
        )}

        {/* Central Orb Button */}
        <button
          onClick={onTogglePlay}
          aria-label={isPlaying ? '暫停睡眠音療' : '開始睡眠音療'}
          className={`relative group w-48 h-48 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center transition-all duration-500 focus:outline-none ${
            isPlaying
              ? 'bg-gradient-to-b from-obsidian-800 to-obsidian-900 border-2 border-indigo-500/60 shadow-[0_0_50px_rgba(99,102,241,0.35)]'
              : 'bg-obsidian-850 border border-slate-800 hover:border-indigo-500/40 shadow-[0_0_20px_rgba(0,0,0,0.5)]'
          }`}
          style={
            isPlaying
              ? {
                  animation: `breathe ${pulseDuration}s ease-in-out infinite alternate`,
                }
              : undefined
          }
        >
          {/* Inner subtle SVG ripple */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-obsidian-900/90 via-obsidian-850/50 to-indigo-950/30 flex flex-col items-center justify-center p-4">
            {/* Status icon / pulse indicator */}
            <div className="mb-1 flex items-center gap-1.5">
              {isPlaying ? (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span className="text-[11px] font-medium tracking-wider text-indigo-300 uppercase">
                    {mode === 'speaker' ? '單聲道外放脈衝' : '雙耳立體聲'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60">
                  <Moon className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px] font-medium text-slate-400">點擊開始入眠</span>
                </div>
              )}
            </div>

            {/* Beat Frequency Display */}
            <div className="text-center my-1">
              <div className="text-3xl sm:text-4xl font-light tracking-tight text-white font-mono flex items-baseline justify-center gap-1">
                <span>{beatFreq.toFixed(1)}</span>
                <span className="text-sm font-normal text-slate-400">Hz</span>
              </div>
              <div className={`text-xs font-semibold tracking-wide uppercase mt-0.5 ${band.text}`}>
                {band.label} {band.name}
              </div>
            </div>

            {/* Play / Pause indicator icon */}
            <div className="mt-1 flex items-center justify-center">
              {isFadingOut ? (
                <span className="text-[11px] text-amber-300 animate-pulse">漸弱靜音中...</span>
              ) : isPlaying ? (
                <div className="p-2 rounded-full bg-indigo-500/20 text-indigo-300 group-hover:bg-indigo-500/40 transition">
                  <Pause className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-2.5 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 group-hover:scale-110 transition">
                  <Play className="w-5 h-5 translate-x-0.5" />
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Subtext info pill */}
      <div className="mt-3 flex flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-mono text-slate-300">{Math.round(carrierFreq)} Hz</span> 溫潤基底載波
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span>{mode === 'speaker' ? '床頭外放揚聲器' : '立體聲耳機'}</span>
        </div>
        {stageName && isPlaying && (
          <div className="text-[11px] text-indigo-400 font-medium px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40 animate-fade-in">
            {stageName}
          </div>
        )}
      </div>
    </div>
  );
};
