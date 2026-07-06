import type { AppData, Subject } from "@/lib/types";

export function isSubjectIncluded(subject?: Subject) {
  return subject?.includeInPlanning !== false;
}

export function getIncludedSubjects(data: AppData) {
  return data.subjects.filter(isSubjectIncluded);
}

export function getPlanningData(data: AppData): AppData {
  const subjectIds = new Set(getIncludedSubjects(data).map((subject) => subject.id));
  return {
    ...data,
    subjects: data.subjects.filter((subject) => subjectIds.has(subject.id)),
    assessments: data.assessments.filter((assessment) => subjectIds.has(assessment.subjectId)),
    topics: data.topics.filter((topic) => subjectIds.has(topic.subjectId)),
    tasks: data.tasks.filter((task) => subjectIds.has(task.subjectId)),
    sessions: data.sessions.filter((session) => subjectIds.has(session.subjectId)),
    mistakes: data.mistakes.filter((mistake) => subjectIds.has(mistake.subjectId))
  };
}
