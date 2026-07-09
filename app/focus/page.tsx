"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ConfidenceSelector, PageHeader, Panel, ProgressBar } from "@/components/ui";
import { todayISO } from "@/lib/date";
import {
  CUSTOM_LIMITS,
  DEFAULT_CUSTOM_DURATIONS,
  PHASE_LABELS,
  POMODORO_PRESETS,
  clampCustomDurations,
  completedInCurrentCycle,
  formatClock,
  getNextPhase,
  getPresetDurations,
  phaseMinutes
} from "@/lib/pomodoro";
import type { PomodoroDurations, PomodoroPhase, PomodoroPresetId } from "@/lib/pomodoro";
import type { SessionType } from "@/lib/types";
import { useExamData } from "@/lib/useExamData";

const SETTINGS_KEY = "examos-pomodoro-settings-v1";
const TIMER_KEY = "examos-pomodoro-state-v1";

const SESSION_TYPES: SessionType[] = [
  "learn",
  "revise",
  "practice",
  "past-paper",
  "oral",
  "writing",
  "mistake-review",
  "practical",
  "review"
];

const inputClass =
  "focus-ring w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5";

const PHASE_PILL_CLASSES: Record<PomodoroPhase, string> = {
  focus: "bg-pine/15 text-pine",
  shortBreak: "bg-gold/15 text-gold",
  longBreak: "bg-coral/15 text-coral"
};

type ExamStore = NonNullable<ReturnType<typeof useExamData>>;

interface PomodoroSettings {
  presetId: PomodoroPresetId;
  custom: PomodoroDurations;
  soundOn: boolean;
  autoAdvance: boolean;
  subjectId: string;
  sessionType: SessionType;
  focusRating: number;
}

interface TimerState {
  phase: PomodoroPhase;
  running: boolean;
  endsAt: number | null;
  remainingMs: number;
  cyclesDone: number;
  presetId: PomodoroPresetId;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  presetId: "classic",
  custom: DEFAULT_CUSTOM_DURATIONS,
  soundOn: true,
  autoAdvance: false,
  subjectId: "",
  sessionType: "revise",
  focusRating: 3
};

function loadSettings(): PomodoroSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw) as Partial<PomodoroSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      custom: clampCustomDurations({ ...DEFAULT_CUSTOM_DURATIONS, ...(saved.custom ?? {}) })
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function freshTimer(settings: PomodoroSettings): TimerState {
  const durations = getPresetDurations(settings.presetId, settings.custom);
  return {
    phase: "focus",
    running: false,
    endsAt: null,
    remainingMs: durations.focusMinutes * 60000,
    cyclesDone: 0,
    presetId: settings.presetId
  };
}

function loadTimer(settings: PomodoroSettings): TimerState {
  const fresh = freshTimer(settings);
  if (typeof window === "undefined") return fresh;
  try {
    const raw = window.localStorage.getItem(TIMER_KEY);
    if (!raw) return fresh;
    const saved = JSON.parse(raw) as Partial<TimerState>;
    if (saved.phase !== "focus" && saved.phase !== "shortBreak" && saved.phase !== "longBreak") return fresh;
    if (saved.presetId !== settings.presetId) return fresh;
    const cyclesDone = typeof saved.cyclesDone === "number" && saved.cyclesDone >= 0 ? saved.cyclesDone : 0;
    if (saved.running && typeof saved.endsAt === "number") {
      return {
        ...fresh,
        phase: saved.phase,
        running: true,
        endsAt: saved.endsAt,
        remainingMs: Math.max(0, saved.endsAt - Date.now()),
        cyclesDone
      };
    }
    const remainingMs =
      typeof saved.remainingMs === "number" && saved.remainingMs >= 0 ? saved.remainingMs : fresh.remainingMs;
    return { ...fresh, phase: saved.phase, remainingMs, cyclesDone };
  } catch {
    return fresh;
  }
}

function createAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const win = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  const Ctor = win.AudioContext ?? win.webkitAudioContext;
  return Ctor ? new Ctor() : null;
}

function ToggleRow({
  label,
  checked,
  onChange
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="focus-ring flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
      onClick={() => onChange(!checked)}
    >
      <span className="flex items-center gap-2">{label}</span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          checked ? "bg-pine" : "bg-black/15 dark:bg-white/20"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
  onBlur
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  onBlur: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-ink/60 dark:text-white/55">{label}</span>
      <input
        className={inputClass}
        type="number"
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : ""}
        onChange={(event) => onChange(event.target.value === "" ? Number.NaN : Number(event.target.value))}
        onBlur={onBlur}
      />
    </label>
  );
}

function FocusTimer({ store }: { store: ExamStore }) {
  const [settings, setSettings] = useState<PomodoroSettings>(loadSettings);
  const [timer, setTimer] = useState<TimerState>(() => loadTimer(settings));
  const [now, setNow] = useState(() => Date.now());
  const [toast, setToast] = useState<string | null>(null);

  const toastTimeoutRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const completionGuardRef = useRef<number | null>(null);
  const originalTitleRef = useRef<string | null>(null);

  const durations = useMemo(
    () => getPresetDurations(settings.presetId, settings.custom),
    [settings.presetId, settings.custom]
  );
  const phaseTotalMs = phaseMinutes(timer.phase, durations) * 60000;
  const remainingMs = timer.running && timer.endsAt !== null ? Math.max(0, timer.endsAt - now) : timer.remainingMs;
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const completedBlocks = completedInCurrentCycle(timer.phase, timer.cyclesDone, durations.longBreakEvery);
  const subjectId = store.data.subjects.some((subject) => subject.id === settings.subjectId)
    ? settings.subjectId
    : "";
  const today = todayISO();
  const todayMinutes = store.data.sessions
    .filter((session) => session.date === today)
    .reduce((sum, session) => sum + session.minutes, 0);

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    window.localStorage.setItem(TIMER_KEY, JSON.stringify(timer));
  }, [timer]);

  useEffect(() => {
    if (!timer.running) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [timer.running]);

  useEffect(() => {
    originalTitleRef.current = document.title;
    return () => {
      if (originalTitleRef.current !== null) document.title = originalTitleRef.current;
      if (toastTimeoutRef.current !== null) window.clearTimeout(toastTimeoutRef.current);
      if (audioRef.current) void audioRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (timer.running) {
      document.title = `${formatClock(remainingSeconds)} · ${PHASE_LABELS[timer.phase]} · ExamOS`;
    } else if (originalTitleRef.current !== null) {
      document.title = originalTitleRef.current;
    }
  }, [timer.running, timer.phase, remainingSeconds]);

  // Phase completion. Runs after every render; the guard keeps each deadline
  // from completing more than once (also under React strict-mode double effects).
  useEffect(() => {
    if (!timer.running || timer.endsAt === null) return;
    if (now < timer.endsAt) return;
    if (completionGuardRef.current === timer.endsAt) return;
    completionGuardRef.current = timer.endsAt;
    handlePhaseComplete();
  });

  function ensureAudio(): AudioContext | null {
    if (!audioRef.current) audioRef.current = createAudioContext();
    if (audioRef.current?.state === "suspended") void audioRef.current.resume();
    return audioRef.current;
  }

  function playBeep() {
    const context = ensureAudio();
    if (!context) return;
    const tone = (frequency: number, offset: number, duration: number) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startAt = context.currentTime + offset;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.25, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration + 0.05);
    };
    tone(880, 0, 0.25);
    tone(1318.51, 0.3, 0.35);
  }

  function showToast(message: string) {
    setToast(message);
    if (toastTimeoutRef.current !== null) window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 4000);
  }

  function handlePhaseComplete() {
    if (settings.soundOn) playBeep();
    const finished = timer.phase;
    const cyclesDone = finished === "focus" ? timer.cyclesDone + 1 : timer.cyclesDone;
    if (finished === "focus" && subjectId) {
      store.addSession({
        subjectId,
        topicIds: [],
        date: todayISO(),
        minutes: durations.focusMinutes,
        sessionType: settings.sessionType,
        focusRating: settings.focusRating,
        outcomeNotes: "Pomodoro focus block",
        questionsAttempted: 0,
        questionsCorrect: 0
      });
      showToast(`Logged ${durations.focusMinutes} min focus block`);
    }
    const nextPhase = getNextPhase(finished, cyclesDone, durations.longBreakEvery);
    const nextMs = phaseMinutes(nextPhase, durations) * 60000;
    setTimer((current) => ({
      ...current,
      phase: nextPhase,
      cyclesDone,
      running: settings.autoAdvance,
      endsAt: settings.autoAdvance ? Date.now() + nextMs : null,
      remainingMs: nextMs
    }));
  }

  function start() {
    if (settings.soundOn) ensureAudio();
    setNow(Date.now());
    setTimer((current) =>
      current.running
        ? current
        : { ...current, running: true, endsAt: Date.now() + Math.max(0, current.remainingMs) }
    );
  }

  function pause() {
    setTimer((current) => {
      if (!current.running || current.endsAt === null) return current;
      return { ...current, running: false, endsAt: null, remainingMs: Math.max(0, current.endsAt - Date.now()) };
    });
  }

  function reset() {
    completionGuardRef.current = null;
    setTimer(freshTimer(settings));
  }

  function skipPhase() {
    setTimer((current) => {
      const cyclesDone = current.phase === "focus" ? current.cyclesDone + 1 : current.cyclesDone;
      const nextPhase = getNextPhase(current.phase, cyclesDone, durations.longBreakEvery);
      const nextMs = phaseMinutes(nextPhase, durations) * 60000;
      return {
        ...current,
        phase: nextPhase,
        cyclesDone,
        endsAt: current.running ? Date.now() + nextMs : null,
        remainingMs: nextMs
      };
    });
  }

  function selectPreset(presetId: PomodoroPresetId) {
    if (presetId === settings.presetId) return;
    const nextSettings = { ...settings, presetId };
    setSettings(nextSettings);
    completionGuardRef.current = null;
    setTimer(freshTimer(nextSettings));
  }

  function updateCustom(patch: Partial<PomodoroDurations>) {
    const custom = { ...settings.custom, ...patch };
    setSettings((current) => ({ ...current, custom }));
    const effective = clampCustomDurations(custom);
    setTimer((current) =>
      current.running ? current : { ...current, remainingMs: phaseMinutes(current.phase, effective) * 60000 }
    );
  }

  function normalizeCustom() {
    setSettings((current) => ({ ...current, custom: clampCustomDurations(current.custom) }));
  }

  const cycleLabel =
    timer.phase === "focus"
      ? `Focus block ${Math.min(completedBlocks + 1, durations.longBreakEvery)} of ${durations.longBreakEvery}`
      : `${completedBlocks} of ${durations.longBreakEvery} focus blocks done`;

  return (
    <>
      <PageHeader
        title="Focus Timer"
        description="Run Pomodoro-style focus blocks with breaks in between. Completed focus blocks can be logged straight into your study sessions."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Panel className="flex flex-col items-center justify-center gap-6 px-6 py-10 text-center">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${PHASE_PILL_CLASSES[timer.phase]}`}
          >
            {PHASE_LABELS[timer.phase]}
          </span>
          <p className="text-7xl font-semibold tabular-nums tracking-tight md:text-8xl">
            {formatClock(remainingSeconds)}
          </p>
          <div className="w-full max-w-sm">
            <ProgressBar value={phaseTotalMs > 0 ? ((phaseTotalMs - remainingMs) / phaseTotalMs) * 100 : 0} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              {Array.from({ length: durations.longBreakEvery }, (_, index) => {
                const filled = index < completedBlocks;
                const active = timer.phase === "focus" && index === completedBlocks;
                return (
                  <span
                    key={index}
                    className={`h-2.5 w-2.5 rounded-full ${
                      filled ? "bg-pine" : active ? "border-2 border-pine" : "bg-black/15 dark:bg-white/20"
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-sm text-ink/60 dark:text-white/55">{cycleLabel}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {timer.running ? (
              <button className="focus-ring rounded-md bg-pine px-5 py-2.5 text-sm font-medium text-white" onClick={pause}>
                <Pause className="mr-1.5 inline h-4 w-4" />
                Pause
              </button>
            ) : (
              <button className="focus-ring rounded-md bg-pine px-5 py-2.5 text-sm font-medium text-white" onClick={start}>
                <Play className="mr-1.5 inline h-4 w-4" />
                {remainingMs < phaseTotalMs ? "Resume" : "Start"}
              </button>
            )}
            <button className="focus-ring rounded-md border border-black/10 px-4 py-2.5 text-sm dark:border-white/10" onClick={reset}>
              <RotateCcw className="mr-1.5 inline h-4 w-4" />
              Reset
            </button>
            <button className="focus-ring rounded-md border border-black/10 px-4 py-2.5 text-sm dark:border-white/10" onClick={skipPhase}>
              <SkipForward className="mr-1.5 inline h-4 w-4" />
              Skip phase
            </button>
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel>
            <h3 className="mb-3 text-lg font-semibold">Timer Settings</h3>
            <div className="grid grid-cols-2 gap-2">
              {POMODORO_PRESETS.map((preset) => {
                const active = settings.presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`focus-ring rounded-md border p-3 text-left text-sm transition ${
                      active
                        ? "border-pine bg-pine/10"
                        : "border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                    }`}
                    onClick={() => selectPreset(preset.id)}
                  >
                    <span className="block font-medium">{preset.name}</span>
                    <span className="mt-0.5 block text-xs text-ink/60 dark:text-white/55">{preset.description}</span>
                  </button>
                );
              })}
            </div>
            {settings.presetId === "custom" ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <NumberField
                  label={`Focus (${CUSTOM_LIMITS.focusMinutes.min}-${CUSTOM_LIMITS.focusMinutes.max} min)`}
                  value={settings.custom.focusMinutes}
                  min={CUSTOM_LIMITS.focusMinutes.min}
                  max={CUSTOM_LIMITS.focusMinutes.max}
                  onChange={(value) => updateCustom({ focusMinutes: value })}
                  onBlur={normalizeCustom}
                />
                <NumberField
                  label={`Short break (${CUSTOM_LIMITS.shortBreakMinutes.min}-${CUSTOM_LIMITS.shortBreakMinutes.max} min)`}
                  value={settings.custom.shortBreakMinutes}
                  min={CUSTOM_LIMITS.shortBreakMinutes.min}
                  max={CUSTOM_LIMITS.shortBreakMinutes.max}
                  onChange={(value) => updateCustom({ shortBreakMinutes: value })}
                  onBlur={normalizeCustom}
                />
                <NumberField
                  label={`Long break (${CUSTOM_LIMITS.longBreakMinutes.min}-${CUSTOM_LIMITS.longBreakMinutes.max} min)`}
                  value={settings.custom.longBreakMinutes}
                  min={CUSTOM_LIMITS.longBreakMinutes.min}
                  max={CUSTOM_LIMITS.longBreakMinutes.max}
                  onChange={(value) => updateCustom({ longBreakMinutes: value })}
                  onBlur={normalizeCustom}
                />
                <NumberField
                  label={`Long break every (${CUSTOM_LIMITS.longBreakEvery.min}-${CUSTOM_LIMITS.longBreakEvery.max} blocks)`}
                  value={settings.custom.longBreakEvery}
                  min={CUSTOM_LIMITS.longBreakEvery.min}
                  max={CUSTOM_LIMITS.longBreakEvery.max}
                  onChange={(value) => updateCustom({ longBreakEvery: value })}
                  onBlur={normalizeCustom}
                />
              </div>
            ) : null}
            <div className="mt-4 space-y-1 border-t border-black/10 pt-3 dark:border-white/10">
              <ToggleRow
                label="Auto-start next phase"
                checked={settings.autoAdvance}
                onChange={(autoAdvance) => setSettings((current) => ({ ...current, autoAdvance }))}
              />
              <ToggleRow
                label={
                  <>
                    {settings.soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    Sound on phase end
                  </>
                }
                checked={settings.soundOn}
                onChange={(soundOn) => {
                  setSettings((current) => ({ ...current, soundOn }));
                  if (soundOn) ensureAudio();
                }}
              />
            </div>
          </Panel>
          <Panel>
            <h3 className="mb-3 text-lg font-semibold">Log Focus Blocks</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-ink/60 dark:text-white/55" htmlFor="pomodoro-subject">
                  Subject
                </label>
                <select
                  id="pomodoro-subject"
                  className={inputClass}
                  value={subjectId}
                  onChange={(event) => setSettings((current) => ({ ...current, subjectId: event.target.value }))}
                >
                  <option value="">Don&apos;t log</option>
                  {store.data.subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-ink/60 dark:text-white/55" htmlFor="pomodoro-session-type">
                  Session type
                </label>
                <select
                  id="pomodoro-session-type"
                  className={inputClass}
                  value={settings.sessionType}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, sessionType: event.target.value as SessionType }))
                  }
                >
                  {SESSION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="mb-1 text-xs text-ink/60 dark:text-white/55">Focus rating</p>
                <ConfidenceSelector
                  value={settings.focusRating}
                  onChange={(focusRating) => setSettings((current) => ({ ...current, focusRating }))}
                />
              </div>
              <p className="text-xs text-ink/60 dark:text-white/55">
                When a subject is selected, every completed focus block is logged automatically as a study session.
                Breaks are never logged.
              </p>
              <div className="rounded-md bg-pine/10 p-3 text-sm text-ink/80 dark:text-white/75">
                <span className="text-lg font-semibold text-ink dark:text-white">{todayMinutes}</span> focus minutes
                today
              </div>
            </div>
          </Panel>
        </div>
      </div>
      {toast ? (
        <div className="fixed bottom-4 right-4 z-20 rounded-md bg-pine px-4 py-2 text-sm font-medium text-white shadow-soft">
          {toast}
        </div>
      ) : null}
    </>
  );
}

export default function FocusPage() {
  const store = useExamData();
  if (!store) return <AppShell><div /></AppShell>;
  return (
    <AppShell>
      <FocusTimer store={store} />
    </AppShell>
  );
}
