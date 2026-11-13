import React from 'react';
import { Sparkles, Clock, Zap } from 'lucide-react';
import { DynamicScheduleInfo } from '../types';

interface DynamicSchedulerBannerProps {
  info: DynamicScheduleInfo;
  isPlaying: boolean;
  onStartSchedule: (demoSpeed: boolean) => void;
  onToggleDemoSpeed: (isDemo: boolean) => void;
}

export const DynamicSchedulerBanner: React.FC<DynamicSchedulerBannerProps> = ({
  info,
  isPlaying,
  onStartSchedule,
  onToggleDemoSpeed,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-gradient-to-r from-obsidian-850 via-obsidian-800 to-obsidian-850 border border-indigo-500/25 rounded-2xl p-4 sm:p-5 shadow-lg shadow-indigo-950/20 backdrop-blur-md mb-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header with Title and Mode Switch */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
              <span>動態神經律動排程</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                45分鐘旅程
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">專利級三階段腦波自主誘導技術</p>
          </div>
        </div>

        {/* Demo Fast Speed Toggle */}
        <button
          onClick={() => onToggleDemoSpeed(!info.isDemoSpeed)}
          title="切換 45 秒快速體驗測試 vs 45 分鐘真實就寢模式"
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition border ${
            info.isDemoSpeed
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'bg-obsidian-700/60 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>{info.isDemoSpeed ? '⚡ 45秒快速體驗' : '🌙 45分鐘正式入眠'}</span>
        </button>
      </div>

      {/* Progress Bar & Stages Visualizer */}
      <div className="space-y-2 my-3">
        {/* Progress track */}
        <div className="relative w-full h-2.5 bg-obsidian-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 transition-all duration-300 rounded-full"
            style={{ width: `${info.progressPercent}%` }}
          />
          {/* Stage Dividers (at 10m = 22.2% and 40m = 88.8%) */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10 opacity-70"
            style={{ left: '22.2%' }}
            title="階段一結束 (10 分鐘)"
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10 opacity-70"
            style={{ left: '88.8%' }}
            title="階段二結束 (40 分鐘)"
          />
        </div>

        {/* 3 Stage Step Cards */}
        <div className="grid grid-cols-3 gap-1.5 text-center pt-1">
          {/* Stage 1 */}
          <div
            className={`p-2 rounded-xl border text-left transition ${
              info.stage === 1
                ? 'bg-indigo-950/60 border-indigo-500/60 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                : 'bg-obsidian-900/60 border-slate-800/80 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">0 - 10分</span>
              {info.stage === 1 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />}
            </div>
            <div className="text-[11px] font-medium text-slate-200">思緒降溫</div>
            <div className="text-[10px] text-slate-400">6.0 → 4.0 Hz (Theta)</div>
          </div>

          {/* Stage 2 */}
          <div
            className={`p-2 rounded-xl border text-left transition ${
              info.stage === 2
                ? 'bg-purple-950/60 border-purple-500/60 text-white shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'bg-obsidian-900/60 border-slate-800/80 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">10 - 40分</span>
              {info.stage === 2 && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />}
            </div>
            <div className="text-[11px] font-medium text-slate-200">深層慢波誘導</div>
            <div className="text-[10px] text-slate-400">4.0 → 0.8 Hz (Delta)</div>
          </div>

          {/* Stage 3 */}
          <div
            className={`p-2 rounded-xl border text-left transition ${
              info.stage === 3
                ? 'bg-blue-950/60 border-blue-500/60 text-white shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                : 'bg-obsidian-900/60 border-slate-800/80 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">40 - 45分</span>
              {info.stage === 3 && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />}
            </div>
            <div className="text-[11px] font-medium text-slate-200">無縫靜音退出</div>
            <div className="text-[10px] text-slate-400">平滑淡出至 0</div>
          </div>
        </div>
      </div>

      {/* Real-time status readout */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {isPlaying && info.stage !== 'idle'
              ? `已進行：${formatTime(info.elapsedSeconds)} / ${formatTime(info.totalDurationSeconds)}`
              : '長度：45:00 完整就寢引導'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isPlaying && (
            <span className="font-mono text-[11px] text-purple-300">
              噪聲: {Math.round(info.currentNoiseVolume * 100)}% | 調幅: {Math.round(info.currentModDepth * 100)}%
            </span>
          )}
          {!isPlaying && (
            <button
              onClick={() => onStartSchedule(info.isDemoSpeed)}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition shadow-md shadow-indigo-600/30"
            >
              啟動 45 分鐘睡眠旅程
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
