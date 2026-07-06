import { daysBetween, startOfWeekISO, todayISO } from "@/lib/date";
import { getPlanningData, isSubjectIncluded } from "@/lib/subjectFilters";
import type { AppData, Subject, Task } from "@/lib/types";

export function subjectMinutesThisWeek(data: AppData, subjectId: string) {
  const subject = data.subjects.find((item) => item.id === subjectId);
  if (!isSubjectIncluded(subject)) return 0;
  const weekStart = startOfWeekISO();
  return data.sessions
    .filter((session) => session.subjectId === subjectId && daysBetween(weekStart, session.date) >= 0)
    .reduce((sum, session) => sum + session.minutes, 0);
}

export function totalMinutesThisWeek(data: AppData) {
  return getPlanningData(data).subjects.reduce((sum, subject) => sum + subjectMinutesThisWeek(data, subject.id), 0);
}

export function subjectProgress(data: AppData, subject: Subject) {
  const topics = data.topics.filter((topic) => topic.subjectId === subject.id);
  if (!topics.length) return subject.currentConfidence * 20;
  const confidence = topics.reduce((sum, topic) => sum + topic.confidence, 0) / topics.length;
  const accuracy = topics.reduce((sum, topic) => sum + topic.practiceAccuracy, 0) / topics.length;
  return Math.round((confidence / 5) * 55 + accuracy * 0.45);
}

export function upcomingAssessments(data: AppData) {
  const planningData = getPlanningData(data);
  return planningData.assessments
    .filter((assessment) => assessment.status !== "completed")
    .filter((assessment) => !assessment.optionalDate || daysBetween(todayISO(), assessment.optionalDate) >= 0)
    .sort((a, b) => {
      const aDays = a.optionalDate ? daysBetween(todayISO(), a.optionalDate) : 999;
      const bDays = b.optionalDate ? daysBetween(todayISO(), b.optionalDate) : 999;
      return aDays - bDays;
    });
}

export function recommendedTasks(tasks: Task[], data?: AppData) {
  const today = todayISO();
  const includedSubjects = data ? new Set(getPlanningData(data).subjects.map((subject) => subject.id)) : undefined;
  return tasks
    .filter((task) => !task.completed && (!includedSubjects || includedSubjects.has(task.subjectId)))
    .sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority] || daysBetween(today, a.dueDate) - daysBetween(today, b.dueDate);
    });
}

export function overdueTopics(data: AppData) {
  const planningData = getPlanningData(data);
  return planningData.topics
    .filter((topic) => topic.nextReview && daysBetween(todayISO(), topic.nextReview) < 0)
    .sort((a, b) => (a.nextReview ?? "").localeCompare(b.nextReview ?? ""));
}

export function buildWeeklyReview(data: AppData, reflection = "") {
  const planningData = getPlanningData(data);
  const weekStart = startOfWeekISO();
  const subjectMinutes = Object.fromEntries(
    planningData.subjects.map((subject) => [subject.id, subjectMinutesThisWeek(data, subject.id)])
  );
  const sortedSubjects = [...planningData.subjects].sort(
    (a, b) => (subjectMinutes[b.id] ?? 0) - (subjectMinutes[a.id] ?? 0)
  );
  const weakTopic = [...planningData.topics].sort(
    (a, b) => a.confidence - b.confidence || a.practiceAccuracy - b.practiceAccuracy
  )[0];
  const weakSubject = planningData.subjects.find((subject) => subject.id === weakTopic?.subjectId);
  const missedTasks = planningData.tasks.filter((task) => !task.completed && daysBetween(todayISO(), task.dueDate) < 0).length;

  return {
    weekStart,
    totalMinutes: totalMinutesThisWeek(data),
    subjectMinutes,
    completedTasks: planningData.tasks.filter((task) => task.completed).length,
    missedTasks,
    strongestSubject: sortedSubjects[0]?.name ?? "None yet",
    weakestSubject: weakSubject?.name ?? "None yet",
    reflection,
    nextWeekFocus: weakTopic ? `${weakSubject?.name ?? "Subject"}: ${weakTopic.name}` : "Add more study data"
  };
}
