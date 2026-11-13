import React, { useState, useEffect } from 'react';
import { Moon, Play, Pause, X, Sun, Shield, Lock } from 'lucide-react';
import { DynamicScheduleInfo } from '../types';

interface NightstandOledViewProps {
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  beatFreq: number;
  remainingSeconds: number | null;
  dynamicInfo: DynamicScheduleInfo;
  wakeLockEnabled?: boolean;
  onToggleWakeLock?: () => void;
}

export const NightstandOledView: React.FC<NightstandOledViewProps> = ({
  isOpen,
  onClose,
  isPlaying,
  onTogglePlay,
  beatFreq,
  remainingSeconds,
  dynamicInfo,
  wakeLockEnabled = true,
  onToggleWakeLock,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [luminanceMode, setLuminanceMode] = useState<'ultra-dim' | 'dim'>('ultra-dim');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const formatTimer = (seconds: number | null) => {
    if (seconds === null) return '持續播放';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}分 ${s.toString().padStart(2, '0')}秒`;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 select-none transition-colors duration-700 bg-black ${
        luminanceMode === 'ultra-dim' ? 'opacity-90' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#000000' }}
    >
      {/* Top Header Status */}
      <div className="flex items-center justify-between text-slate-600 text-xs">
        <div className="flex items-center gap-2">
          <Moon className="w-3.5 h-3.5 text-amber-500/60" />
          <span className="tracking-widest uppercase font-mono text-[10px] text-amber-500/70">
            床頭 OLED 極暗純黑 • 極低藍光護眼
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wake Lock Screen Awake Toggle */}
          {onToggleWakeLock && (
            <button
              onClick={onToggleWakeLock}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono border transition ${
                wakeLockEnabled
                  ? 'border-amber-500/40 text-amber-400/80 bg-amber-950/20'
                  : 'border-slate-800 text-slate-600'
              }`}
              title="切換是否保持螢幕常亮（防止手機自動休眠鎖屏）"
            >
              <Shield className="w-3 h-3" />
              <span>{wakeLockEnabled ? '螢幕防休眠：開啟' : '允許自動鎖屏'}</span>
            </button>
          )}

          <button
            onClick={() => setLuminanceMode(luminanceMode === 'ultra-dim' ? 'dim' : 'ultra-dim')}
            className="p-1.5 rounded-full text-slate-600 hover:text-slate-400 transition"
            title="切換極暗 / 柔和微光"
          >
            <Sun className="w-4 h-4 text-amber-600/40" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-600 hover:text-slate-300 transition"
            title="退出床頭模式"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Central Ultra-Dim Clock & Sleep Entrainment */}
      <div className="flex flex-col items-center justify-center my-auto text-center space-y-4">
        {/* Soft Amber / Deep Indigo Glow Clock */}
        <div className="font-mono text-6xl sm:text-8xl font-extralight tracking-tighter text-amber-500/60 select-none drop-shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          {currentTime}
        </div>

        {/* Dynamic Entrainment Stage Info */}
        <div className="flex flex-col items-center gap-1.5 max-w-xs">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800/60 text-slate-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-500/60 animate-ping" />
            <span className="font-mono text-indigo-400/80">{beatFreq.toFixed(1)} Hz</span>
            <span>•</span>
            <span className="text-[11px] text-slate-400">
              {dynamicInfo.stage !== 'idle' ? dynamicInfo.stageName : '單聲道揚聲器外放'}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            {remainingSeconds !== null ? `定時關閉：${formatTimer(remainingSeconds)}` : '持續播放'}
          </div>
        </div>

        {/* Central 1-Tap Play/Pause */}
        <div className="pt-3">
          <button
            onClick={onTogglePlay}
            className="p-4 rounded-full bg-slate-950 border border-slate-900 text-slate-500 hover:text-amber-400 hover:border-slate-800 transition shadow-inner"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 translate-x-0.5" />}
          </button>
        </div>

        {/* Background audio reassurance notice */}
        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-600 max-w-xs leading-relaxed pt-2">
          <Lock className="w-3 h-3 text-slate-500 shrink-0" />
          <span>支援鎖定螢幕背景播放，按下電源鍵關閉螢幕仍持續引導</span>
        </div>
      </div>

      {/* Bottom Gentle Dismiss helper */}
      <div className="text-center text-[10px] text-slate-700 tracking-wider">
        點擊右上叉號返回主介面 • 具備結束前 5 分鐘平滑漸弱至靜音
      </div>
    </div>
  );
};
