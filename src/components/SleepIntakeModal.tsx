import React, { useState } from 'react';
import { X, Sparkles, Brain, ArrowRight, Check } from 'lucide-react';
import { MentalStressLevel, PhysicalFatigueLevel, SoundPreset, WaveformType } from '../types';

interface SleepIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyIntakePreset: (preset: SoundPreset, targetHours: number) => void;
}

export const SleepIntakeModal: React.FC<SleepIntakeModalProps> = ({
  isOpen,
  onClose,
  onApplyIntakePreset,
}) => {
  const [step, setStep] = useState<number>(1);
  const [mentalStress, setMentalStress] = useState<MentalStressLevel>('moderate');
  const [physicalFatigue, setPhysicalFatigue] = useState<PhysicalFatigueLevel>('moderate');
  const [targetHours, setTargetHours] = useState<number>(7.5);

  if (!isOpen) return null;

  // Generate sound parameters based on neuroscience formulas in Chinese
  const calculatePrescription = (): SoundPreset => {
    let carrierFreq = 164;
    let beatFreq = 1.2;
    let waveform: WaveformType = 'sine';
    let modulationDepth = 0.35;
    let noiseVolume = 0.35;
    let noiseType: 'brown' | 'pink' = 'brown';
    let targetBand: 'Delta' | 'Theta' | 'Sub-Delta' = 'Delta';
    let name = '個人化專屬神經入眠處方';
    let subtitle = '';

    // Step 1 mapping: Mental stress
    if (mentalStress === 'racing') {
      beatFreq = 5.0; // Theta to first match racing brain cadence
      waveform = 'triangle'; // softer harmonics
      modulationDepth = 0.42;
      noiseVolume = 0.45;
      noiseType = 'brown';
      targetBand = 'Theta';
      subtitle = 'Theta 減壓：安撫過度活躍思緒';
    } else if (mentalStress === 'moderate') {
      beatFreq = 2.0;
      waveform = 'sine';
      modulationDepth = 0.36;
      noiseVolume = 0.32;
      targetBand = 'Delta';
      subtitle = 'Delta 導引：適度日常思緒安撫';
    } else {
      beatFreq = 1.0;
      waveform = 'sine';
      modulationDepth = 0.30;
      noiseVolume = 0.25;
      targetBand = 'Delta';
      subtitle = '深層慢波：平靜心境直接過渡';
    }

    // Step 2 mapping: Physical fatigue
    if (physicalFatigue === 'exhausted') {
      carrierFreq = 152;
      noiseVolume = Math.min(0.55, noiseVolume + 0.1);
      if (mentalStress !== 'racing') {
        beatFreq = 0.8;
        targetBand = 'Sub-Delta';
      }
    } else if (physicalFatigue === 'rested') {
      carrierFreq = 172;
    }

    return {
      id: 'custom-intake-prescription',
      name,
      subtitle,
      description: `專為「${mentalStress === 'racing' ? '思緒飛旋' : mentalStress === 'moderate' ? '一般作息' : '平靜放鬆'}」精神狀態與「${physicalFatigue === 'exhausted' ? '極度疲勞' : physicalFatigue === 'moderate' ? '適度疲勞' : '輕鬆'}」體能狀態量身客製，目標睡眠長度 ${targetHours} 小時。`,
      carrierFreq,
      beatFreq,
      waveform,
      modulationDepth,
      noiseType,
      noiseVolume,
      targetBand,
    };
  };

  const prescription = calculatePrescription();

  const handleFinish = () => {
    onApplyIntakePreset(prescription, targetHours);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md bg-obsidian-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-indigo-950/60 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-300">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">入眠前神經檢測 (Intake)</h2>
              <p className="text-[11px] text-slate-400">步驟 {step} / 3 • 狀態驅動聲學處方產生器</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress indicator dots */}
        <div className="flex gap-1.5 mb-5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-indigo-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Stress & Mental Activity */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">您目前的大腦思緒狀態如何？</h3>
              <p className="text-xs text-slate-400 mt-0.5">決定起始引導頻差與腦波頻段。</p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'low', label: '平靜放鬆', desc: '思緒安靜，準備立即進入夢鄉', band: '0.8 - 1.2 Hz Delta' },
                { id: 'moderate', label: '一般忙碌', desc: '常態白天作息，帶有些微白天殘留想法', band: '2.0 Hz Mid-Delta' },
                { id: 'racing', label: '思緒飛旋 / 緊繃焦慮', desc: '腦中持續對話、思考停不下來、難以靜心', band: '4.8 - 6.0 Hz Theta' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMentalStress(item.id as MentalStressLevel)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all ${
                    mentalStress === item.id
                      ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-950/40'
                      : 'bg-obsidian-850 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                      <span>{item.label}</span>
                      <span className="text-[10px] font-normal text-indigo-400 font-mono">({item.band})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                  {mentalStress === item.id && (
                    <div className="p-1 rounded-full bg-indigo-500 text-white mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
            >
              <span>下一步：評估身體疲勞</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Step 2: Physical Fatigue */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">您感受到的身體肌肉疲勞程度？</h3>
              <p className="text-xs text-slate-400 mt-0.5">校準載波溫潤度與環境遮蔽噪聲底層。</p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'rested', label: '輕鬆 / 輕度活動', desc: '無重度體力消耗，尚有餘裕精力' },
                { id: 'moderate', label: '適度作息疲勞', desc: '標準日常生活移動，舒適的自然睏意' },
                { id: 'exhausted', label: '極度體能透支', desc: '四肢沉重、運動或勞動後肌肉緊繃、高生理疲累' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPhysicalFatigue(item.id as PhysicalFatigueLevel)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all ${
                    physicalFatigue === item.id
                      ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-950/40'
                      : 'bg-obsidian-850 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-100">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                  {physicalFatigue === item.id && (
                    <div className="p-1 rounded-full bg-indigo-500 text-white mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                返回
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
              >
                <span>下一步：設定目標睡眠時間</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Desired Wake Window & Prescription Preview */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">目標睡眠長度 / 起床時間窗</h3>
              <p className="text-xs text-slate-400 mt-0.5">嚴格對齊 90 分鐘 REM/NREM 晝夜人體睡眠週期。</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { hours: 0.5, label: '30分 快速充電', desc: 'Theta 輕快甦醒' },
                { hours: 4.5, label: '4.5小時 (3週期)', desc: '短暫急救修復' },
                { hours: 6.0, label: '6.0小時 (4週期)', desc: '日常基礎維持' },
                { hours: 7.5, label: '7.5小時 (5週期)', desc: '黃金身心平衡點', badge: '最佳推薦' },
                { hours: 9.0, label: '9.0小時 (6週期)', desc: '深層體力重建' },
              ].map((slot) => (
                <button
                  key={slot.hours}
                  onClick={() => setTargetHours(slot.hours)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    targetHours === slot.hours
                      ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md shadow-indigo-950/40'
                      : 'bg-obsidian-850 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{slot.label}</span>
                    {slot.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {slot.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{slot.desc}</span>
                </button>
              ))}
            </div>

            {/* Generated Prescription Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-obsidian-850 to-purple-950/30 border border-indigo-500/30 mt-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>即時計算之 Web Audio 聲學處方：</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-obsidian-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">載波基底</div>
                  <div className="font-mono font-bold text-white mt-0.5">{prescription.carrierFreq} Hz</div>
                </div>
                <div className="p-2 rounded-lg bg-obsidian-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">目標頻差</div>
                  <div className="font-mono font-bold text-purple-300 mt-0.5">{prescription.beatFreq.toFixed(1)} Hz</div>
                </div>
                <div className="p-2 rounded-lg bg-obsidian-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">遮蔽噪聲</div>
                  <div className="font-mono font-bold text-slate-300 mt-0.5">{Math.round(prescription.noiseVolume * 100)}%</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-4 bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                返回
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>套用專屬處方並開始播放</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
