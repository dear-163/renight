import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Clock, Sparkles, BellOff } from 'lucide-react';
import { WakeSlot } from '../types';

interface CircadianAlarmModuleProps {
  onTestChime: () => void;
  isAlarmTesting: boolean;
}

export const CircadianAlarmModule: React.FC<CircadianAlarmModuleProps> = ({
  onTestChime,
  isAlarmTesting,
}) => {
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(false);
  const [targetWakeTimeString, setTargetWakeTimeString] = useState<string>('07:30');
  const [selectedCycle, setSelectedCycle] = useState<number>(5); // 5 cycles (7.5h) default
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update clock every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Compute 90-minute circadian wake slots based on current time + 14 min latency
  const wakeSlots: WakeSlot[] = useMemo(() => {
    const latencyMinutes = 14;
    const baseDate = new Date(currentTime.getTime() + latencyMinutes * 60 * 1000);

    const cyclesData = [
      { cycles: 3, hours: 4.5, label: '4.5 小時', tag: '短暫急救', isOptimal: false },
      { cycles: 4, hours: 6.0, label: '6.0 小時', tag: '日常維護', isOptimal: false },
      { cycles: 5, hours: 7.5, label: '7.5 小時', tag: '身心黃金平衡點', isOptimal: true },
      { cycles: 6, hours: 9.0, label: '9.0 小時', tag: '深層體力重建', isOptimal: false },
    ];

    return cyclesData.map((c) => {
      const wakeDate = new Date(baseDate.getTime() + c.hours * 60 * 60 * 1000);
      return {
        cycles: c.cycles,
        durationMinutes: c.hours * 60,
        wakeTime: wakeDate,
        label: c.label,
        tag: c.tag,
        isOptimal: c.isOptimal,
      };
    });
  }, [currentTime]);

  const formatHoursMinutes = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${mins}`;
  };

  const handleSelectSlot = (slot: WakeSlot) => {
    setSelectedCycle(slot.cycles);
    const timeStr = formatHoursMinutes(slot.wakeTime);
    setTargetWakeTimeString(timeStr);
    setAlarmEnabled(true);
  };

  return (
    <div className="w-full bg-obsidian-850/90 border border-slate-800 rounded-3xl p-4 sm:p-5 mb-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>90分鐘生理節律計算器 & 智能鬧鐘</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              計算 REM/NREM 週期交界（已包含 14 分鐘入睡潛伏期）
            </p>
          </div>
        </div>

        {/* Alarm On/Off Toggle */}
        <button
          onClick={() => setAlarmEnabled(!alarmEnabled)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
            alarmEnabled
              ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/40'
              : 'bg-obsidian-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {alarmEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          <span>{alarmEnabled ? '鬧鐘已啟用' : '已關閉'}</span>
        </button>
      </div>

      {/* Suggested 90-Minute Circadian Wake Slots */}
      <div className="my-3">
        <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center justify-between">
          <span>若現在就寢，建議以下時間起床：</span>
          <span className="text-[10px] text-indigo-400 font-mono">含14分鐘入睡時間</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {wakeSlots.map((slot) => {
            const isSelected = selectedCycle === slot.cycles && alarmEnabled;
            return (
              <button
                key={slot.cycles}
                onClick={() => handleSelectSlot(slot)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-950 to-obsidian-850 border-indigo-500 text-white shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500'
                    : 'bg-obsidian-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold font-mono text-white">
                    {formatHoursMinutes(slot.wakeTime)}
                  </span>
                  {slot.isOptimal && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ★ 最佳
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-medium text-slate-300">
                  {slot.cycles} 週期 ({slot.label})
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">{slot.tag}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Alarm Banner & Sound Test */}
      <div className="mt-3 p-3 rounded-2xl bg-obsidian-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-950/60 text-indigo-300 border border-indigo-900/60">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400">已排定喚醒鬧鐘</div>
            <div className="text-base font-bold font-mono text-white flex items-center gap-2">
              <span>{targetWakeTimeString}</span>
              {alarmEnabled && (
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  純合成漸進式溫柔鐘聲
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chime preview button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTestChime}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition border ${
              isAlarmTesting
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                : 'bg-obsidian-850 hover:bg-obsidian-800 border-slate-700 text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAlarmTesting ? '溫柔鐘聲播放中...' : '試聽喚醒鐘聲'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
