import React from 'react';
import { Volume2, Headphones, Sparkles, Check, Info } from 'lucide-react';
import { AudioMode } from '../types';

interface SpeakerModeToggleProps {
  mode: AudioMode;
  onToggle: (mode: AudioMode) => void;
  onToggleNightstandOled: () => void;
  isNightstandActive: boolean;
}

export const SpeakerModeToggle: React.FC<SpeakerModeToggleProps> = ({
  mode,
  onToggle,
  onToggleNightstandOled,
}) => {
  return (
    <div className="w-full bg-obsidian-900/80 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 mb-4 shadow-md backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-300 tracking-wider uppercase">
            聲音傳導模式
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
            外放調校
          </span>
        </div>

        {/* OLED Nightstand button */}
        <button
          onClick={onToggleNightstandOled}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-obsidian-950 border border-indigo-500/30 text-indigo-300 text-[11px] hover:bg-indigo-950/40 transition"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span>OLED 護眼時鐘</span>
        </button>
      </div>

      {/* Pill Toggle Button Container */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-obsidian-950 rounded-xl border border-slate-800/80">
        {/* Speaker Mode (Default) */}
        <button
          onClick={() => onToggle('speaker')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'speaker'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>床頭揚聲器 (免耳機)</span>
          {mode === 'speaker' && <Check className="w-3 h-3 text-indigo-200" />}
        </button>

        {/* Headphone Mode */}
        <button
          onClick={() => onToggle('headphone')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'headphone'
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>立體聲耳機</span>
          {mode === 'headphone' && <Check className="w-3 h-3 text-purple-200" />}
        </button>
      </div>
    </div>
  );
};
