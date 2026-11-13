import React from 'react';
import { Volume2, Headphones, Check, Info } from 'lucide-react';
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
    <div className="w-full bg-obsidian-850/90 border border-slate-800/90 rounded-2xl p-3 sm:p-4 mb-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200 tracking-wider uppercase">
            聲音傳導模式
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            手機外放調校
          </span>
        </div>

        {/* OLED Nightstand button */}
        <button
          onClick={onToggleNightstandOled}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-obsidian-900 border border-indigo-500/30 text-indigo-300 text-xs hover:bg-indigo-950/40 transition"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>床頭 OLED 護眼視圖</span>
        </button>
      </div>

      {/* Pill Toggle Button Container */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-obsidian-950 rounded-xl border border-slate-800">
        {/* Speaker Mode (Default) */}
        <button
          onClick={() => onToggle('speaker')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
            mode === 'speaker'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>床頭揚聲器 (免耳機)</span>
          {mode === 'speaker' && <Check className="w-3.5 h-3.5 ml-0.5 text-indigo-200" />}
        </button>

        {/* Headphone Mode */}
        <button
          onClick={() => onToggle('headphone')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
            mode === 'headphone'
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md shadow-purple-600/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>立體聲耳機模式</span>
          {mode === 'headphone' && <Check className="w-3.5 h-3.5 ml-0.5 text-purple-200" />}
        </button>
      </div>

      {/* Acoustic Explanatory Pill */}
      <div className="mt-2.5 flex items-start gap-2 p-2 rounded-lg bg-obsidian-900/60 border border-slate-800/60 text-[11px] text-slate-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
        {mode === 'speaker' ? (
          <div>
            <strong className="text-slate-200">原生單聲道振幅調製 (Monaural LFO)：</strong> 手機喇叭外放無法提供雙耳耳道隔離。Renight 透過精確調製 150-180 Hz 載波振幅，直接在臥室空氣中形成聲學律動，免戴耳機即可誘導深層放鬆，且音頻避開手機 100 Hz 以下失真區。
          </div>
        ) : (
          <div>
            <strong className="text-slate-200">雙耳立體聲搏動 (Binaural Beats)：</strong> 左右聲道分離給予微小頻率差，經由耳機直接在大腦上橄欖核整合，誘發對應腦電波同步。
          </div>
        )}
      </div>
    </div>
  );
};
