"use client";

import { useEffect, useMemo, useState } from "react";
import { getNextReviewDate, todayISO } from "@/lib/date";
import { loadAppData, parseBackup, resetAppData, saveAppData } from "@/lib/storage";
import type {
  AppData,
  Assessment,
  MistakeLog,
  StudySession,
  Subject,
  Task,
  Topic,
  WeeklyReview
} from "@/lib/types";

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useExamData() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setData(loadAppData());
  }, []);

  useEffect(() => {
    if (!data) return;
    saveAppData(data);
    document.documentElement.classList.toggle("dark", data.settings.darkMode);
  }, [data]);

  const api = useMemo(() => {
    if (!data) return null;

    const commit = (updater: (current: AppData) => AppData) => {
      setData((current) => (current ? updater(current) : current));
    };

    return {
      data,
      setData,
      resetDemoData: () => setData(resetAppData()),
      importBackup: (value: string) => setData(parseBackup(value)),
      updateSubject: (subjectId: string, patch: Partial<Subject>) =>
        commit((current) => ({
          ...current,
          subjects: current.subjects.map((subject) =>
            subject.id === subjectId ? { ...subject, ...patch } : subject
          )
        })),
      updateAssessment: (assessmentId: string, patch: Partial<Assessment>) =>
        commit((current) => ({
          ...current,
          assessments: current.assessments.map((assessment) =>
            assessment.id === assessmentId ? { ...assessment, ...patch } : assessment
          )
        })),
      addAssessment: (assessment: Omit<Assessment, "id" | "status">) =>
        commit((current) => ({
          ...current,
          assessments: [{ ...assessment, id: makeId("assessment"), status: "upcoming" }, ...current.assessments]
        })),
      deleteAssessment: (assessmentId: string) =>
        commit((current) => ({
          ...current,
          assessments: current.assessments.filter((assessment) => assessment.id !== assessmentId),
          tasks: current.tasks.map((task) =>
            task.linkedAssessmentId === assessmentId ? { ...task, linkedAssessmentId: undefined } : task
          )
        })),
      addTask: (task: Omit<Task, "id">) =>
        commit((current) => ({ ...current, tasks: [{ ...task, id: makeId("task") }, ...current.tasks] })),
      updateTask: (taskId: string, patch: Partial<Task>) =>
        commit((current) => ({
          ...current,
          tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, ...patch } : task))
        })),
      deleteTask: (taskId: string) =>
        commit((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== taskId) })),
      addSession: (session: Omit<StudySession, "id">) =>
        commit((current) => ({
          ...current,
          sessions: [{ ...session, id: makeId("session") }, ...current.sessions],
          topics: current.topics.map((topic) =>
            session.topicIds.includes(topic.id)
              ? { ...topic, lastReviewed: session.date, nextReview: getNextReviewDate(topic.confidence, session.date) }
              : topic
          )
        })),
      updateSession: (sessionId: string, patch: Partial<StudySession>) =>
        commit((current) => ({
          ...current,
          sessions: current.sessions.map((session) =>
            session.id === sessionId ? { ...session, ...patch } : session
          )
        })),
      deleteSession: (sessionId: string) =>
        commit((current) => ({
          ...current,
          sessions: current.sessions.filter((session) => session.id !== sessionId)
        })),
      addMistake: (mistake: Omit<MistakeLog, "id" | "createdAt" | "reviewed">) =>
        commit((current) => ({
          ...current,
          mistakes: [
            { ...mistake, id: makeId("mistake"), createdAt: todayISO(), reviewed: false },
            ...current.mistakes
          ]
        })),
      updateMistake: (mistakeId: string, patch: Partial<MistakeLog>) =>
        commit((current) => ({
          ...current,
          mistakes: current.mistakes.map((mistake) =>
            mistake.id === mistakeId ? { ...mistake, ...patch } : mistake
          )
        })),
      deleteMistake: (mistakeId: string) =>
        commit((current) => ({
          ...current,
          mistakes: current.mistakes.filter((mistake) => mistake.id !== mistakeId)
        })),
      updateTopic: (topicId: string, patch: Partial<Topic>) =>
        commit((current) => ({
          ...current,
          topics: current.topics.map((topic) => {
            if (topic.id !== topicId) return topic;
            const next = { ...topic, ...patch };
            if (patch.confidence) next.nextReview = getNextReviewDate(patch.confidence);
            return next;
          })
        })),
      addTopic: (topic: Omit<Topic, "id">) =>
        commit((current) => ({
          ...current,
          topics: [{ ...topic, id: makeId("topic") }, ...current.topics]
        })),
      deleteTopic: (topicId: string) =>
        commit((current) => ({
          ...current,
          topics: current.topics.filter((topic) => topic.id !== topicId),
          tasks: current.tasks.map((task) => (task.topicId === topicId ? { ...task, topicId: undefined } : task)),
          sessions: current.sessions.map((session) => ({
            ...session,
            topicIds: session.topicIds.filter((id) => id !== topicId)
          })),
          mistakes: current.mistakes.filter((mistake) => mistake.topicId !== topicId)
        })),
      toggleDarkMode: () =>
        commit((current) => ({
          ...current,
          settings: { ...current.settings, darkMode: !current.settings.darkMode }
        })),
      updatePlannerSettings: (patch: Partial<AppData["settings"]["planner"]>) =>
        commit((current) => ({
          ...current,
          settings: { ...current.settings, planner: { ...current.settings.planner, ...patch } }
        })),
      saveWeeklyReview: (review: WeeklyReview) =>
        commit((current) => ({
          ...current,
          weeklyReviews: [
            review,
            ...current.weeklyReviews.filter((item) => item.weekStart !== review.weekStart)
          ]
        }))
    };
  }, [data]);

  return api;
}
