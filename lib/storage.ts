"use client";

import { createSeedData } from "@/lib/seedData";
import { officialAssessments, officialSubjects, officialTopics } from "@/lib/officialData";
import type { AppData } from "@/lib/types";

const STORAGE_KEY = "examos-data-v1";
const CURRICULUM_REVISION = "2026-07-07-pdf-curriculum-v2";

const legacySeedData = createSeedData();
const legacyAssessmentIds = new Set(legacySeedData.assessments.map((assessment) => assessment.id));
const officialTopicSubjectIds = new Set(officialTopics.map((topic) => topic.subjectId));
const legacyTopicIdsToReplace = new Set(
  legacySeedData.topics
    .filter((topic) => officialTopicSubjectIds.has(topic.subjectId))
    .map((topic) => topic.id)
);

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

function mergeOfficialSubjects(current: AppData["subjects"]) {
  const byId = new Map(current.map((subject) => [subject.id, subject]));
  for (const official of officialSubjects) {
    const existing = byId.get(official.id);
    byId.set(official.id, {
      ...official,
      targetGrade: existing?.targetGrade ?? official.targetGrade,
      currentConfidence: existing?.currentConfidence ?? official.currentConfidence,
      includeInPlanning: existing?.includeInPlanning ?? official.includeInPlanning ?? true
    });
  }
  return Array.from(byId.values()).map((subject) => ({
    ...subject,
    includeInPlanning: subject.includeInPlanning ?? true
  }));
}

function mergeOfficialAssessments(current: AppData["assessments"]) {
  const manualAndCurrent = current.filter((assessment) => !legacyAssessmentIds.has(assessment.id));
  const byId = new Map(manualAndCurrent.map((assessment) => [assessment.id, assessment]));
  for (const official of officialAssessments) {
    const existing = byId.get(official.id);
    byId.set(official.id, {
      ...official,
      status: existing?.status ?? official.status
    });
  }
  return Array.from(byId.values());
}

function mergeOfficialTopics(current: AppData["topics"]) {
  const manualAndCurrent = current.filter((topic) => !legacyTopicIdsToReplace.has(topic.id));
  const byId = new Map(manualAndCurrent.map((topic) => [topic.id, topic]));
  for (const official of officialTopics) {
    const existing = byId.get(official.id);
    byId.set(official.id, {
      ...official,
      confidence: existing?.confidence ?? official.confidence,
      difficulty: existing?.difficulty ?? official.difficulty,
      lastReviewed: existing?.lastReviewed,
      nextReview: existing?.nextReview,
      practiceAccuracy: existing?.practiceAccuracy ?? official.practiceAccuracy,
      notes: existing?.notes || official.notes,
      formulaConfidence: existing?.formulaConfidence ?? official.formulaConfidence,
      methodConfidence: existing?.methodConfidence ?? official.methodConfidence,
      carelessMistakeCount: existing?.carelessMistakeCount ?? official.carelessMistakeCount,
      timePressureRating: existing?.timePressureRating ?? official.timePressureRating
    });
  }
  return Array.from(byId.values());
}

export function normalizeAppData(data: AppData): AppData {
  const subjects = mergeOfficialSubjects(data.subjects);

  return {
    ...data,
    subjects,
    assessments: mergeOfficialAssessments(data.assessments),
    topics: mergeOfficialTopics(data.topics),
    settings: {
      darkMode: data.settings?.darkMode ?? false,
      curriculumRevision: CURRICULUM_REVISION,
      planner: {
        weekdayMinutes: data.settings?.planner?.weekdayMinutes ?? 120,
        weekendMinutes: data.settings?.planner?.weekendMinutes ?? 180,
        restDay: data.settings?.planner?.restDay ?? "Sunday",
        maxBlocksPerDay: data.settings?.planner?.maxBlocksPerDay ?? 3
      }
    }
  };
}
