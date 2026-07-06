import { addDays, startOfWeekISO, todayISO, weekDates } from "@/lib/date";
import { getRankedTopics } from "@/lib/priority";
import { getPlanningData, isSubjectIncluded } from "@/lib/subjectFilters";
import type { AppData, PlannedBlock, TaskType } from "@/lib/types";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function blockTypeFor(subjectCategory: string, topicName: string): TaskType {
  if (topicName.toLowerCase().includes("oral") || topicName.toLowerCase().includes("conversation")) return "oral";
  if (subjectCategory === "language" || subjectCategory === "foreign-language") return topicName.toLowerCase().includes("reading") ? "revise" : "writing";
  if (topicName.toLowerCase().includes("practical") || topicName.toLowerCase().includes("experimental")) return "practical";
  if (subjectCategory === "math") return "practice";
  return "revise";
}

export function generateWeeklyPlan(data: AppData, weekStart = startOfWeekISO()): PlannedBlock[] {
  const planningData = getPlanningData(data);
  const ranked = getRankedTopics(planningData);
  const dates = weekDates(weekStart);
  const blocks: PlannedBlock[] = [];
  const subjectCounts: Record<string, number> = {};
  let cursor = 0;

  if (!ranked.length) return blocks;

  for (const date of dates) {
    const day = dayNames[new Date(`${date}T12:00:00`).getDay()];
    if (day === planningData.settings.planner.restDay) continue;
    const isWeekend = day === "Saturday" || day === "Sunday";
    const available = isWeekend ? planningData.settings.planner.weekendMinutes : planningData.settings.planner.weekdayMinutes;
    const maxBlocks = Math.max(1, planningData.settings.planner.maxBlocksPerDay);
    const blockMinutes = Math.max(25, Math.floor(available / maxBlocks));
    const daily: PlannedBlock[] = [];

    while (daily.length < maxBlocks && cursor < ranked.length * 2) {
      const candidate = ranked[cursor % ranked.length];
      cursor += 1;
      if (!candidate) break;
      const alreadyToday = daily.some((block) => block.subjectId === candidate.subject.id);
      const overBalanced = (subjectCounts[candidate.subject.id] ?? 0) > 1 && candidate.priority.score < 75;
      if (alreadyToday || overBalanced) continue;
      daily.push({
        id: `plan-${date}-${candidate.topic.id}-${daily.length}`,
        date,
        subjectId: candidate.subject.id,
        topicId: candidate.topic.id,
        title: `${candidate.subject.name}: ${candidate.topic.name}`,
        type: blockTypeFor(candidate.subject.category, candidate.topic.name),
        minutes: Math.min(blockMinutes, isWeekend ? 70 : 55),
        priorityScore: candidate.priority.score
      });
      subjectCounts[candidate.subject.id] = (subjectCounts[candidate.subject.id] ?? 0) + 1;
    }

    blocks.push(...daily);
  }

  ensurePlanVariety(blocks, planningData, weekStart);
  return blocks;
}

function ensurePlanVariety(blocks: PlannedBlock[], data: AppData, weekStart: string) {
  const languageDates = new Set(blocks.filter((block) => ["oral", "writing"].includes(block.type)).map((block) => block.date));
  for (let offset = 0; offset < 7; offset += 2) {
    const date = addDays(weekStart, offset);
    if (languageDates.has(date)) continue;
    const langTopic = data.topics.find((topic) => {
      const subject = data.subjects.find((item) => item.id === topic.subjectId);
      return subject && isSubjectIncluded(subject) && ["language", "foreign-language"].includes(subject.category);
    });
    if (!langTopic) continue;
    const subject = data.subjects.find((item) => item.id === langTopic.subjectId);
    if (!subject) continue;
    blocks.push({
      id: `plan-language-${date}`,
      date,
      subjectId: subject.id,
      topicId: langTopic.id,
      title: `${subject.name}: oral/writing rhythm`,
      type: subject.category === "foreign-language" ? "oral" : "writing",
      minutes: 30,
      priorityScore: 70
    });
  }

  if (!blocks.some((block) => block.type === "practical")) {
    const practical = data.topics.find((topic) => /practical|experimental/i.test(topic.name));
    const subject = practical
      ? data.subjects.find((item) => item.id === practical.subjectId && isSubjectIncluded(item))
      : undefined;
    if (practical && subject) {
      blocks.push({
        id: "plan-weekly-practical",
        date: addDays(weekStart, 5),
        subjectId: subject.id,
        topicId: practical.id,
        title: `${subject.name}: practical reasoning`,
        type: "practical",
        minutes: 40,
        priorityScore: 72
      });
    }
  }

  if (data.mistakes.some((mistake) => !mistake.reviewed) && !blocks.some((block) => block.type === "mistake-review")) {
    const mistake = data.mistakes.find((item) => {
      const subject = data.subjects.find((candidate) => candidate.id === item.subjectId);
      return !item.reviewed && isSubjectIncluded(subject);
    });
    if (mistake) {
      const subject = data.subjects.find((item) => item.id === mistake.subjectId);
      blocks.push({
        id: "plan-mistake-review",
        date: addDays(todayISO(), 1),
        subjectId: mistake.subjectId,
        topicId: mistake.topicId,
        title: `${subject?.name ?? "Subject"}: mistake review`,
        type: "mistake-review",
        minutes: 25,
        priorityScore: 80
      });
    }
  }
}
