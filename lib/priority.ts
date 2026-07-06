import { daysBetween, todayISO } from "@/lib/date";
import type { Assessment, MistakeLog, PriorityInput, PriorityResult, Topic } from "@/lib/types";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function nearestAssessment(topic: Topic, assessments: Assessment[]) {
  const today = todayISO();
  return assessments
    .filter((assessment) => assessment.subjectId === topic.subjectId && assessment.status !== "completed")
    .filter((assessment) => !assessment.optionalDate || daysBetween(today, assessment.optionalDate) >= 0)
    .sort((a, b) => {
      const aDays = a.optionalDate ? daysBetween(today, a.optionalDate) : 999;
      const bDays = b.optionalDate ? daysBetween(today, b.optionalDate) : 999;
      return aDays - bDays;
    })[0];
}

export function rankTopic({ topic, subject, assessments, mistakes }: PriorityInput): PriorityResult {
  const target = nearestAssessment(topic, assessments);
  const daysUntil = target?.optionalDate ? Math.max(0, daysBetween(todayISO(), target.optionalDate)) : 90;
  const assessmentWeightScore = clamp(((target?.weighting ?? subject.examWeightPriority / 4) / 60) * 100);
  const urgencyScore = clamp(100 - daysUntil * 2);
  const weaknessScore = clamp(((6 - topic.confidence) / 5) * 55 + ((100 - topic.practiceAccuracy) / 100) * 45);
  const daysSinceReview = topic.lastReviewed ? Math.max(0, daysBetween(topic.lastReviewed, todayISO())) : 30;
  const staleReviewScore = clamp(daysSinceReview * 4);
  const unresolved = mistakes.filter((mistake) => mistake.topicId === topic.id && !mistake.reviewed).length;
  const mistakeScore = clamp(unresolved * 28);
  const difficultyScore = clamp((topic.difficulty / 5) * 100);
  const repeatedPracticeBoost = target && ["oral", "writing", "practical"].includes(target.type) ? 8 : 0;
  const score =
    0.25 * assessmentWeightScore +
    0.25 * urgencyScore +
    0.2 * weaknessScore +
    0.15 * staleReviewScore +
    0.1 * mistakeScore +
    0.05 * difficultyScore +
    repeatedPracticeBoost;

  const reasons = [
    target ? `${target.name} is the nearest assessment` : "No dated assessment yet",
    topic.confidence <= 2 ? "low confidence" : "confidence is steady",
    topic.practiceAccuracy < 70 ? "practice accuracy needs attention" : "practice accuracy is stable",
    unresolved > 0 ? `${unresolved} unresolved mistake${unresolved === 1 ? "" : "s"}` : "no unresolved mistakes"
  ];

  return { score: Math.round(score), reasons };
}

export function getRankedTopics(data: {
  subjects: PriorityInput["subject"][];
  topics: Topic[];
  assessments: Assessment[];
  mistakes: MistakeLog[];
}) {
  return data.topics
    .map((topic) => {
      const subject = data.subjects.find((item) => item.id === topic.subjectId);
      if (!subject) return null;
      return {
        topic,
        subject,
        priority: rankTopic({ topic, subject, assessments: data.assessments, mistakes: data.mistakes })
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.priority.score - a!.priority.score) as Array<{
    topic: Topic;
    subject: PriorityInput["subject"];
    priority: PriorityResult;
  }>;
}
