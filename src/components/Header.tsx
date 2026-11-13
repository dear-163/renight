import React from 'react';
import { Moon, Brain } from 'lucide-react';

interface HeaderProps {
  onOpenIntake: () => void;
  onOpenNightstand: () => void;
  isSpeakerMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenIntake,
  onOpenNightstand,
}) => {
  return (
    <header className="w-full flex items-center justify-between py-4 px-1 mb-2 border-b border-slate-800/60">
      {/* Brand logo & title */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Moon className="w-5 h-5 text-white" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-bold text-white tracking-tight">Renight</h1>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              晝夜音療 PWA
            </span>
          </div>
          <p className="text-[11px] text-slate-400">神經科學睡眠誘導與喚醒</p>
        </div>
      </div>

      {/* Top Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Neuro Intake Check-In */}
        <button
          onClick={onOpenIntake}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-medium transition shadow-md shadow-indigo-600/25"
        >
          <Brain className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">入眠問卷檢測</span>
          <span className="sm:hidden">檢測</span>
        </button>

        {/* OLED Nightstand button */}
        <button
          onClick={onOpenNightstand}
          className="p-2 rounded-xl bg-obsidian-850 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition"
          title="床頭 OLED 極暗純黑模式"
        >
          <Moon className="w-4 h-4 text-amber-400/80" />
        </button>
      </div>
    </header>
  );
};
