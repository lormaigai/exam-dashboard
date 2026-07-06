"use client";

import { createSeedData } from "@/lib/seedData";
import { officialAssessments, officialSubjects, officialTopics } from "@/lib/officialData";
import type { AppData } from "@/lib/types";

const STORAGE_KEY = "examos-data-v1";

export function loadAppData(): AppData {
  if (typeof window === "undefined") return createSeedData();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = normalizeAppData(createSeedData());
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    const normalized = normalizeAppData(JSON.parse(raw) as AppData);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    const seed = normalizeAppData(createSeedData());
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

export function saveAppData(data: AppData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetAppData() {
  const seed = normalizeAppData(createSeedData());
  saveAppData(seed);
  return seed;
}

export function parseBackup(value: string): AppData {
  const parsed = JSON.parse(value) as Partial<AppData>;
  if (!parsed.subjects || !parsed.assessments || !parsed.topics || !parsed.tasks) {
    throw new Error("Backup is missing required ExamOS collections.");
  }
  return normalizeAppData(parsed as AppData);
}

function mergeById<T extends { id: string }>(current: T[], additions: T[]) {
  const ids = new Set(current.map((item) => item.id));
  return [...current, ...additions.filter((item) => !ids.has(item.id))];
}

export function normalizeAppData(data: AppData): AppData {
  const subjects = mergeById(data.subjects, officialSubjects).map((subject) => ({
    ...subject,
    includeInPlanning: subject.includeInPlanning ?? true
  }));

  return {
    ...data,
    subjects,
    assessments: mergeById(data.assessments, officialAssessments),
    topics: mergeById(data.topics, officialTopics),
    settings: {
      darkMode: data.settings?.darkMode ?? false,
      planner: {
        weekdayMinutes: data.settings?.planner?.weekdayMinutes ?? 120,
        weekendMinutes: data.settings?.planner?.weekendMinutes ?? 180,
        restDay: data.settings?.planner?.restDay ?? "Sunday",
        maxBlocksPerDay: data.settings?.planner?.maxBlocksPerDay ?? 3
      }
    }
  };
}
