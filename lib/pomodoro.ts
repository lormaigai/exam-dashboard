export type PomodoroPhase = "focus" | "shortBreak" | "longBreak";

export type PomodoroPresetId = "classic" | "deep-work" | "quick-sprint" | "custom";

export interface PomodoroDurations {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** Take a long break after this many completed focus blocks. */
  longBreakEvery: number;
}

export interface PomodoroPreset {
  id: PomodoroPresetId;
  name: string;
  description: string;
  durations: PomodoroDurations;
}

export const DEFAULT_CUSTOM_DURATIONS: PomodoroDurations = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEvery: 4
};

export const POMODORO_PRESETS: PomodoroPreset[] = [
  {
    id: "classic",
    name: "Classic",
    description: "25 min focus · 5 min break",
    durations: { focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, longBreakEvery: 4 }
  },
  {
    id: "deep-work",
    name: "Deep Work",
    description: "50 min focus · 10 min break",
    durations: { focusMinutes: 50, shortBreakMinutes: 10, longBreakMinutes: 20, longBreakEvery: 3 }
  },
  {
    id: "quick-sprint",
    name: "Quick Sprint",
    description: "15 min focus · 3 min break",
    durations: { focusMinutes: 15, shortBreakMinutes: 3, longBreakMinutes: 10, longBreakEvery: 4 }
  },
  {
    id: "custom",
    name: "Custom",
    description: "Pick your own durations",
    durations: DEFAULT_CUSTOM_DURATIONS
  }
];

export const CUSTOM_LIMITS = {
  focusMinutes: { min: 5, max: 120 },
  shortBreakMinutes: { min: 1, max: 30 },
  longBreakMinutes: { min: 1, max: 30 },
  longBreakEvery: { min: 2, max: 8 }
} as const;

export const PHASE_LABELS: Record<PomodoroPhase, string> = {
  focus: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break"
};

function clampValue(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function clampCustomDurations(durations: PomodoroDurations): PomodoroDurations {
  return {
    focusMinutes: clampValue(
      durations.focusMinutes,
      CUSTOM_LIMITS.focusMinutes.min,
      CUSTOM_LIMITS.focusMinutes.max,
      DEFAULT_CUSTOM_DURATIONS.focusMinutes
    ),
    shortBreakMinutes: clampValue(
      durations.shortBreakMinutes,
      CUSTOM_LIMITS.shortBreakMinutes.min,
      CUSTOM_LIMITS.shortBreakMinutes.max,
      DEFAULT_CUSTOM_DURATIONS.shortBreakMinutes
    ),
    longBreakMinutes: clampValue(
      durations.longBreakMinutes,
      CUSTOM_LIMITS.longBreakMinutes.min,
      CUSTOM_LIMITS.longBreakMinutes.max,
      DEFAULT_CUSTOM_DURATIONS.longBreakMinutes
    ),
    longBreakEvery: clampValue(
      durations.longBreakEvery,
      CUSTOM_LIMITS.longBreakEvery.min,
      CUSTOM_LIMITS.longBreakEvery.max,
      DEFAULT_CUSTOM_DURATIONS.longBreakEvery
    )
  };
}

export function getPresetDurations(presetId: PomodoroPresetId, custom: PomodoroDurations): PomodoroDurations {
  if (presetId === "custom") return clampCustomDurations(custom);
  const preset = POMODORO_PRESETS.find((item) => item.id === presetId);
  return preset ? preset.durations : POMODORO_PRESETS[0].durations;
}

export function phaseMinutes(phase: PomodoroPhase, durations: PomodoroDurations): number {
  if (phase === "focus") return durations.focusMinutes;
  if (phase === "shortBreak") return durations.shortBreakMinutes;
  return durations.longBreakMinutes;
}

/** Formats a second count as mm:ss, e.g. 1500 -> "25:00". */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * The phase that follows a finished phase. `completedFocusBlocks` counts focus
 * blocks finished so far, including the one that just ended.
 */
export function getNextPhase(
  finished: PomodoroPhase,
  completedFocusBlocks: number,
  longBreakEvery: number
): PomodoroPhase {
  if (finished !== "focus") return "focus";
  return completedFocusBlocks > 0 && completedFocusBlocks % longBreakEvery === 0 ? "longBreak" : "shortBreak";
}

/** One full cycle, e.g. every 4 -> focus, short, focus, short, focus, short, focus, long. */
export function buildCyclePhases(longBreakEvery: number): PomodoroPhase[] {
  const phases: PomodoroPhase[] = [];
  for (let block = 1; block <= longBreakEvery; block += 1) {
    phases.push("focus");
    phases.push(block === longBreakEvery ? "longBreak" : "shortBreak");
  }
  return phases;
}

/** Focus blocks completed within the current cycle, for progress dots. */
export function completedInCurrentCycle(
  phase: PomodoroPhase,
  completedFocusBlocks: number,
  longBreakEvery: number
): number {
  const remainder = completedFocusBlocks % longBreakEvery;
  if (remainder === 0 && completedFocusBlocks > 0 && phase === "longBreak") return longBreakEvery;
  return remainder;
}
