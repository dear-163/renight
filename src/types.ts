export type AudioMode = 'speaker' | 'headphone';
export type WaveformType = 'sine' | 'triangle';
export type NoiseType = 'brown' | 'pink' | 'off';

export type MentalStressLevel = 'low' | 'moderate' | 'racing';
export type PhysicalFatigueLevel = 'rested' | 'moderate' | 'exhausted';

export type DynamicScheduleStage = 1 | 2 | 3 | 'completed' | 'idle';

export interface DynamicScheduleInfo {
  enabled: boolean;
  stage: DynamicScheduleStage;
  stageName: string;
  stageDescription: string;
  elapsedSeconds: number;
  totalDurationSeconds: number; // default 45 * 60 = 2700s
  currentBeatFreq: number;
  currentModDepth: number;
  currentNoiseVolume: number;
  progressPercent: number;
  isDemoSpeed: boolean; // if true, runs 45-minute journey in 45 seconds for testing
}

export interface SleepIntakeState {
  mentalStress: MentalStressLevel;
  physicalFatigue: PhysicalFatigueLevel;
  targetDurationHours: number; // e.g. 7.5
  completedAt?: number;
}

export interface AudioEngineParams {
  carrierFreq: number; // 130 Hz - 220 Hz
  beatFreq: number;    // 0.5 Hz - 7.0 Hz
  mode: AudioMode;     // speaker (monaural LFO) or headphone (stereo binaural)
  waveform: WaveformType;
  modulationDepth: number; // 0.1 - 0.7 (default 0.35)
  noiseType: NoiseType;
  noiseVolume: number; // 0.0 - 1.0
  masterVolume: number; // 0.0 - 1.0
  isNightstandMode: boolean;
}

export interface SoundPreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  carrierFreq: number;
  beatFreq: number;
  waveform: WaveformType;
  modulationDepth: number;
  noiseType: NoiseType;
  noiseVolume: number;
  targetBand: 'Delta' | 'Theta' | 'Sub-Delta';
  isDynamicSchedule?: boolean;
}

export interface WakeSlot {
  cycles: number;
  durationMinutes: number;
  wakeTime: Date;
  label: string;
  tag: string;
  isOptimal: boolean;
}

export interface AlarmConfig {
  enabled: boolean;
  targetTime: string; // "HH:MM"
  targetTimestamp: number | null;
  chimeVolume: number;
  gradualRampMinutes: number;
}

export interface SleepSessionLog {
  id: string;
  startTime: number;
  endTime?: number;
  durationMinutes: number;
  intake?: SleepIntakeState;
  carrierFreq: number;
  beatFreq: number;
  mode: AudioMode;
  dynamicScheduleCompleted?: boolean;
}
