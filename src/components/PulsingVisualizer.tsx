import React, { useMemo } from 'react';
import { Play, Pause, Moon, Volume2, Sparkles } from 'lucide-react';
import { AudioMode } from '../types';

interface PulsingVisualizerProps {
  isPlaying: boolean;
  isFadingOut: boolean;
  beatFreq: number;
  carrierFreq: number;
  mode: AudioMode;
  onTogglePlay: () => void;
  stageName?: string;
  presetName?: string;
}

export const PulsingVisualizer: React.FC<PulsingVisualizerProps> = ({
  isPlaying,
  isFadingOut,
  beatFreq,
  carrierFreq,
  mode,
  onTogglePlay,
  stageName,
  presetName,
}) => {
  // Determine frequency brainwave band in Chinese
  const band = useMemo(() => {
    if (beatFreq <= 1.0) {
      return {
        name: '次慢波 (深層修復)',
        label: 'δ',
        glowColor: 'rgba(99, 102, 241, 0.4)',
        accentBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        textColor: 'text-indigo-400'
      };
    }
    if (beatFreq <= 4.0) {
      return {
        name: 'Delta 慢波 (無夢沉睡)',
        label: 'δ',
        glowColor: 'rgba(168, 85, 247, 0.4)',
        accentBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        textColor: 'text-purple-300'
      };
    }
    if (beatFreq <= 7.5) {
      return {
        name: 'Theta 波 (思緒沉澱)',
        label: 'θ',
        glowColor: 'rgba(217, 70, 239, 0.4)',
        accentBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
        textColor: 'text-fuchsia-300'
      };
    }
    return {
      name: 'Alpha 波 (閉目放鬆)',
      label: 'α',
      glowColor: 'rgba(245, 158, 11, 0.4)',
      accentBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      textColor: 'text-amber-300'
    };
  }, [beatFreq]);

  // CSS pulse duration directly synced to beat frequency: duration = 1 / Hz seconds
  const pulseDuration = useMemo(() => {
    const clampedHz = Math.max(0.5, Math.min(8.0, beatFreq));
    return (1 / clampedHz).toFixed(2);
  }, [beatFreq]);

  return (
    <div className="relative flex flex-col items-center justify-center my-6 select-none w-full">
      {/* Outer ambient glow halo (Fluid organic breathing) */}
      <div
        className={`absolute w-72 h-72 sm:w-84 sm:h-84 rounded-full blur-3xl transition-all duration-1000 ${
          isPlaying ? 'opacity-50 scale-110' : 'opacity-15 scale-95'
        }`}
        style={{
          background: isPlaying ? `radial-gradient(circle, ${band.glowColor} 0%, rgba(8,8,12,0) 70%)` : 'rgba(30, 41, 59, 0.2)',
        }}
      />

      {/* Main interactive pulsing ring container */}
      <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
        {/* Dynamic harmonic ripple rings */}
        {isPlaying && (
          <>
            <div
              className="absolute inset-0 rounded-full border border-indigo-500/20 pointer-events-none"
              style={{
                animation: `ping ${Math.max(1.8, parseFloat(pulseDuration) * 2.2)}s cubic-bezier(0, 0, 0.2, 1) infinite`,
              }}
            />
            <div
              className="absolute -inset-4 rounded-full border border-purple-500/15 pointer-events-none"
              style={{
                animation: `pulse ${Math.max(1.2, parseFloat(pulseDuration))}s ease-in-out infinite`,
              }}
            />
            {/* Third soft outer wave */}
            <div
              className="absolute -inset-8 rounded-full border border-indigo-400/10 pointer-events-none"
              style={{
                animation: `pulse ${Math.max(1.6, parseFloat(pulseDuration) * 1.5)}s ease-in-out infinite alternate`,
              }}
            />
          </>
        )}

        {/* Central Orb Button */}
        <button
          onClick={onTogglePlay}
          aria-label={isPlaying ? '暫停睡眠音療' : '開始睡眠音療'}
          className={`relative group w-48 h-48 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center transition-all duration-700 focus:outline-none ${
            isPlaying
              ? 'bg-gradient-to-b from-obsidian-850 via-obsidian-900 to-obsidian-950 border border-indigo-500/50 shadow-[0_0_60px_rgba(99,102,241,0.35)]'
              : 'bg-obsidian-900 border border-slate-800/80 hover:border-indigo-500/40 shadow-[0_0_25px_rgba(0,0,0,0.6)]'
          }`}
          style={
            isPlaying
              ? {
                  animation: `breathe ${pulseDuration}s ease-in-out infinite alternate`,
                }
              : undefined
          }
        >
          {/* Inner subtle SVG ripple & soft texture */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-obsidian-950/95 via-obsidian-900/60 to-indigo-950/30 flex flex-col items-center justify-center p-4">
            
            {/* Status icon / pulse indicator */}
            <div className="mb-1 flex items-center gap-1.5">
              {isPlaying ? (
                <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border backdrop-blur-sm ${band.accentBg}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-ping" />
                  <span className="text-[10px] font-semibold tracking-wider uppercase">
                    {mode === 'speaker' ? '外放單聲道' : '立體雙耳'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400">
                  <Moon className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-medium tracking-wide">點擊入睡</span>
                </div>
              )}
            </div>

            {/* Beat Frequency Display */}
            <div className="text-center my-0.5">
              <div className="text-3xl sm:text-4xl font-light tracking-tight text-white font-mono flex items-baseline justify-center gap-1">
                <span>{beatFreq.toFixed(1)}</span>
                <span className="text-sm font-normal text-slate-400">Hz</span>
              </div>
              <div className={`text-[11px] font-semibold tracking-wide uppercase mt-0.5 ${band.textColor}`}>
                {band.label} {band.name}
              </div>
            </div>

            {/* Play / Pause indicator icon */}
            <div className="mt-1 flex items-center justify-center">
              {isFadingOut ? (
                <span className="text-[10px] text-amber-300 font-mono animate-pulse">漸弱靜音中...</span>
              ) : isPlaying ? (
                <div className="p-2 rounded-full bg-indigo-500/15 text-indigo-300 group-hover:bg-indigo-500/30 transition">
                  <Pause className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-2.5 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/40 group-hover:scale-105 transition">
                  <Play className="w-4 h-4 translate-x-0.5" />
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Subtext info pill */}
      <div className="mt-3 flex flex-col items-center gap-1.5 text-center">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="font-mono text-slate-300">{Math.round(carrierFreq)} Hz</span> 溫潤基底
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span>{mode === 'speaker' ? '床頭免耳機' : '耳機模式'}</span>
          {presetName && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="text-indigo-300 truncate max-w-[120px]">{presetName}</span>
            </>
          )}
        </div>

        {stageName && isPlaying && (
          <div className="text-[11px] text-indigo-300 font-medium px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-700/50 shadow-sm animate-fade-in flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>{stageName}</span>
          </div>
        )}
      </div>
    </div>
  );
};
