import React from 'react';
import { Sliders, Volume2, Timer } from 'lucide-react';
import { AudioEngineParams, NoiseType, WaveformType } from '../types';

interface AudioTuningDrawerProps {
  params: AudioEngineParams;
  timerMinutes: number;
  remainingSeconds: number | null;
  onUpdateParams: (params: Partial<AudioEngineParams>) => void;
  onSetTimer: (minutes: number) => void;
}

export const AudioTuningDrawer: React.FC<AudioTuningDrawerProps> = ({
  params,
  timerMinutes,
  remainingSeconds,
  onUpdateParams,
  onSetTimer,
}) => {
  const formatTimerDisplay = (seconds: number | null) => {
    if (seconds === null) return '持續播放';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分 ${secs.toString().padStart(2, '0')}秒`;
  };

  return (
    <div className="w-full bg-obsidian-850/90 border border-slate-800 rounded-3xl p-4 sm:p-5 mb-8 shadow-xl backdrop-blur-md">
      {/* Drawer Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            聲學微調與睡眠定時器
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {remainingSeconds !== null ? `定時關閉：${formatTimerDisplay(remainingSeconds)}` : '持續播放'}
        </span>
      </div>

      {/* Sleep Timer Quick Selectors */}
      <div className="mb-5 p-3 rounded-2xl bg-obsidian-950 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Timer className="w-3.5 h-3.5 text-indigo-400" />
            <span>睡眠定時器 (自動關閉)</span>
          </div>
          <span className="text-[10px] text-indigo-300 font-medium">
            內建結束前 5 分鐘平滑漸弱
          </span>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {[
            { val: 15, label: '15分' },
            { val: 30, label: '30分' },
            { val: 45, label: '45分' }, // default nightstand
            { val: 60, label: '60分' },
            { val: 90, label: '90分' },
            { val: 0, label: '∞' },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => onSetTimer(item.val)}
              className={`py-2 rounded-xl text-xs font-semibold transition border ${
                timerMinutes === item.val
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-obsidian-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-4">
        {/* Carrier Frequency Slider */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">基底載波頻率 (Carrier Tone)</span>
            <span className="font-mono text-indigo-300 font-semibold">{Math.round(params.carrierFreq)} Hz</span>
          </div>
          <input
            type="range"
            min="130"
            max="220"
            step="1"
            value={params.carrierFreq}
            onChange={(e) => onUpdateParams({ carrierFreq: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>130 Hz (手機揚聲器暖低音極限)</span>
            <span>174 Hz (沉靜頻率)</span>
            <span>220 Hz (柔和正弦)</span>
          </div>
        </div>

        {/* Entrainment Beat Frequency Slider */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">目標腦波搏動頻率 (Entrainment Beat)</span>
            <span className="font-mono text-purple-300 font-semibold">{params.beatFreq.toFixed(1)} Hz</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="7.0"
            step="0.1"
            value={params.beatFreq}
            onChange={(e) => onUpdateParams({ beatFreq: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0.5 Hz (深層慢波)</span>
            <span>2.0 Hz (Delta)</span>
            <span>4.5 Hz (Theta)</span>
            <span>7.0 Hz</span>
          </div>
        </div>

        {/* Amplitude Modulation Depth (LFO depth for speaker pulsing) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">單聲道調幅深度 (Modulation Depth)</span>
            <span className="font-mono text-indigo-300 font-semibold">{Math.round(params.modulationDepth * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.15"
            max="0.60"
            step="0.01"
            value={params.modulationDepth}
            onChange={(e) => onUpdateParams({ modulationDepth: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>溫和微幅 (15%)</span>
            <span>適中平衡 (35%)</span>
            <span>深沉律動 (60%)</span>
          </div>
        </div>

        {/* Waveform Selector */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-300 font-medium">載波波形</span>
          <div className="flex gap-1.5 p-1 bg-obsidian-950 rounded-xl border border-slate-800">
            {(['sine', 'triangle'] as WaveformType[]).map((wave) => (
              <button
                key={wave}
                onClick={() => onUpdateParams({ waveform: wave })}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                  params.waveform === wave
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {wave === 'sine' ? '正弦波' : '三角波'}
              </button>
            ))}
          </div>
        </div>

        {/* Ambient Brown Noise Masking */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-medium">房間遮噪背景音</span>
            <div className="flex gap-1 bg-obsidian-950 p-1 rounded-lg border border-slate-800">
              {(['brown', 'pink', 'off'] as NoiseType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onUpdateParams({ noiseType: t })}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition ${
                    params.noiseType === t
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t === 'brown' ? '棕噪聲' : t === 'pink' ? '粉噪聲' : '關閉'}
                </button>
              ))}
            </div>
          </div>

          {params.noiseType !== 'off' && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400 text-[11px]">噪聲強度 (Noise Floor)</span>
                <span className="font-mono text-slate-300 text-[11px]">{Math.round(params.noiseVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.01"
                value={params.noiseVolume}
                onChange={(e) => onUpdateParams({ noiseVolume: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Master Output Volume */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>主輸出音量 (Master Volume)</span>
            </span>
            <span className="font-mono text-indigo-300 font-semibold">{Math.round(params.masterVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.0"
            step="0.01"
            value={params.masterVolume}
            onChange={(e) => onUpdateParams({ masterVolume: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
