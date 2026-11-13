import React from 'react';
import { Waves } from 'lucide-react';
import { SOUND_PRESETS } from '../audio/presets';
import { SoundPreset } from '../types';

interface SoundPresetSelectorProps {
  activePresetId: string;
  onSelectPreset: (preset: SoundPreset) => void;
}

export const SoundPresetSelector: React.FC<SoundPresetSelectorProps> = ({
  activePresetId,
  onSelectPreset,
}) => {
  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
          <Waves className="w-3.5 h-3.5 text-indigo-400" />
          <span>神經科學聲學預設</span>
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">手機外放調校</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SOUND_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                isActive
                  ? 'bg-gradient-to-r from-obsidian-850 via-indigo-950/40 to-obsidian-850 border-indigo-500/80 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                  : 'bg-obsidian-850/80 border-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              {preset.isDynamicSchedule && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                  專利漸進排程
                </div>
              )}

              <div className="flex items-start justify-between mb-1.5">
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-indigo-200 transition">
                    {preset.name}
                  </div>
                  <div className="text-[11px] text-indigo-300 font-medium">{preset.subtitle}</div>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    preset.targetBand === 'Delta'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : preset.targetBand === 'Theta'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {preset.beatFreq.toFixed(1)} Hz {preset.targetBand}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-1">
                {preset.description}
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>載波：{preset.carrierFreq} Hz ({preset.waveform === 'sine' ? '正弦波' : '三角波'})</span>
                <span>遮蔽噪聲：{preset.noiseType === 'brown' ? '棕噪聲' : preset.noiseType === 'pink' ? '粉噪聲' : '無'} {Math.round(preset.noiseVolume * 100)}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
