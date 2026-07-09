"use client";

import { supabase } from "@/lib/supabaseClient";

const STORAGE_KEY = "examos-data-v1";
const LEGACY_BACKUP_KEY = "examos-legacy-backup-v1";
const SYNC_INTERVAL_MS = 5000;

export type CloudRow = {
  data: unknown;
  updatedAt: string | null;
};

// --- Last-synced tracking (simple subscribable so UI can display it) ---

let lastSyncedAt: string | null = null;
const lastSyncedListeners = new Set<(value: string | null) => void>();

export function getLastSyncedAt(): string | null {
  return lastSyncedAt;
}

export function subscribeLastSyncedAt(listener: (value: string | null) => void): () => void {
  lastSyncedListeners.add(listener);
  return () => {
    lastSyncedListeners.delete(listener);
  };
}

function setLastSyncedAt(value: string | null) {
  lastSyncedAt = value;
  for (const listener of lastSyncedListeners) listener(value);
}

// Raw localStorage string as of the last successful push, so the auto-sync
// poller (and manual "Sync now") share one notion of "already synced".
let lastPushedRaw: string | null = null;

/**
 * Cloud rows written by the old "Y4 Exam Control" page have a different shape
 * (exams/checkedTopics/weekPlan/...). Only ExamOS-shaped data may be loaded
 * into localStorage — anything else must be preserved, never overwritten blind.
 */
export function isExamOSData(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  return (
    Array.isArray(data.subjects) &&
    Array.isArray(data.assessments) &&
    Array.isArray(data.topics) &&
    Array.isArray(data.tasks)
  );
}

export function saveLegacyBackup(value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LEGACY_BACKUP_KEY, JSON.stringify(value));
  } catch {
    // Quota or serialization failure — nothing else we can do client-side.
  }
}

function isEmptyCloudData(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "object" && !Array.isArray(value) && Object.keys(value as object).length === 0) {
    return true;
  }
  return false;
}

/**
 * Fetch this user's saved progress. Returns null when there is no row yet or
 * the stored data is an empty object (nothing meaningful to restore).
 */
export async function pullCloudData(userId: string): Promise<CloudRow | null> {
  const { data: row, error } = await supabase
    .from("user_progress")
    .select("data, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row || isEmptyCloudData(row.data)) return null;
  return { data: row.data, updatedAt: row.updated_at ?? null };
}

/**
 * Push the current localStorage snapshot up to Supabase. Skips (returns false)
 * when there is nothing in localStorage or it cannot be parsed.
 */
export async function pushLocalData(userId: string, email: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return false;
  }
  // Carry any preserved old-format (Y4 Exam Control) data along inside the
  // pushed document so upserting never destroys it.
  const legacyRaw = window.localStorage.getItem(LEGACY_BACKUP_KEY);
  if (legacyRaw && parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const record = parsed as Record<string, unknown>;
    if (record.legacyY4Backup === undefined) {
      try {
        parsed = { ...record, legacyY4Backup: JSON.parse(legacyRaw) };
      } catch {
        // Corrupt backup string — push without it.
      }
    }
  }
  const { error } = await supabase.from("user_progress").upsert({
    user_id: userId,
    email,
    data: parsed,
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(error.message);
  lastPushedRaw = raw;
  setLastSyncedAt(new Date().toISOString());
  return true;
}

/**
 * Poll localStorage every 5 seconds and push whenever the raw string has
 * changed since the last successful push. Also flushes when the tab becomes
 * hidden. Returns a stop() cleanup function.
 */
export function startAutoSync(userId: string, email: string): () => void {
  if (typeof window === "undefined") return () => {};

  // Treat the current snapshot as the baseline: reconciliation (pull or first
  // push) has just finished, so only future edits should trigger a push.
  lastPushedRaw = window.localStorage.getItem(STORAGE_KEY);

  let pushing = false;
  const pushIfChanged = async () => {
    if (pushing) return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw || raw === lastPushedRaw) return;
    pushing = true;
    try {
      await pushLocalData(userId, email);
    } catch {
      // Transient failure (offline, etc.) — the next tick retries.
    } finally {
      pushing = false;
    }
  };

  const intervalId = window.setInterval(() => {
    void pushIfChanged();
  }, SYNC_INTERVAL_MS);

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") void pushIfChanged();
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  return () => {
    window.clearInterval(intervalId);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}
