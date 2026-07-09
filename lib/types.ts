export type SubjectCategory = "language" | "math" | "science" | "foreign-language" | "humanities" | "project";
export type AssessmentType =
  | "oral"
  | "writing"
  | "paper"
  | "practical"
  | "listening"
  | "reading"
  | "project";
export type AssessmentStatus = "upcoming" | "completed" | "needs-attention";
export type TaskType =
  | "learn"
  | "revise"
  | "practice"
  | "past-paper"
  | "oral"
  | "writing"
  | "mistake-review"
  | "practical";
export type TaskPriority = "low" | "medium" | "high";
export type SessionType = TaskType | "review";
export type MistakeSource =
  | "worksheet"
  | "practice-paper"
  | "quiz"
  | "mock"
  | "oral"
  | "essay"
  | "other";
export type MistakeType =
  | "concept-gap"
  | "careless"
  | "misread-question"
  | "weak-explanation"
  | "calculation"
  | "memory"
  | "time-management"
  | "language-expression"
  | "experimental-skill";
export type GoalStatus = "not-started" | "in-progress" | "done" | "paused";

export interface Subject {
  id: string;
  name: string;
  category: SubjectCategory;
  colorToken: string;
  targetGrade: string;
  currentConfidence: number;
  examWeightPriority: number;
  notes: string;
  includeInPlanning?: boolean;
}

export interface Assessment {
  id: string;
  subjectId: string;
  name: string;
  type: AssessmentType;
  termWeek: string;
  optionalDate?: string;
  duration: string;
  weighting: number;
  format: string;
  topics: string[];
  skillsAssessed: string[];
  status: AssessmentStatus;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  parentTopic?: string;
  term: string;
  applicableTo?: "Math1" | "Math2" | "both";
  confidence: number;
  difficulty: number;
  lastReviewed?: string;
  nextReview?: string;
  practiceAccuracy: number;
  notes: string;
  formulaConfidence?: number;
  methodConfidence?: number;
  carelessMistakeCount?: number;
  timePressureRating?: number;
}

export interface Task {
  id: string;
  subjectId: string;
  topicId?: string;
  title: string;
  type: TaskType;
  estimatedMinutes: number;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
  linkedAssessmentId?: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  topicIds: string[];
  date: string;
  minutes: number;
  sessionType: SessionType;
  focusRating: number;
  outcomeNotes: string;
  questionsAttempted: number;
  questionsCorrect: number;
}

export interface MistakeLog {
  id: string;
  subjectId: string;
  topicId: string;
  source: MistakeSource;
  questionRef: string;
  mistakeType: MistakeType;
  whatWentWrong: string;
  correctMethod: string;
  nextAction: string;
  reviewed: boolean;
  createdAt: string;
}

export interface Goal {
  id: string;
  subjectId?: string;
  title: string;
  description: string;
  targetDate: string;
  metric: string;
  status: GoalStatus;
}

export interface WeeklyReview {
  weekStart: string;
  totalMinutes: number;
  subjectMinutes: Record<string, number>;
  completedTasks: number;
  missedTasks: number;
  strongestSubject: string;
  weakestSubject: string;
  reflection: string;
  nextWeekFocus: string;
}

export interface PlannerSettings {
  weekdayMinutes: number;
  weekendMinutes: number;
  restDay: string;
  maxBlocksPerDay: number;
}

export interface AppSettings {
  darkMode: boolean;
  planner: PlannerSettings;
  curriculumRevision?: string;
}

export interface AppData {
  subjects: Subject[];
  assessments: Assessment[];
  topics: Topic[];
  tasks: Task[];
  sessions: StudySession[];
  mistakes: MistakeLog[];
  goals: Goal[];
  weeklyReviews: WeeklyReview[];
  settings: AppSettings;
}

export interface PriorityInput {
  topic: Topic;
  subject: Subject;
  assessments: Assessment[];
  mistakes: MistakeLog[];
}

export interface PriorityResult {
  score: number;
  reasons: string[];
}

export interface PlannedBlock {
  id: string;
  date: string;
  subjectId: string;
  topicId?: string;
  title: string;
  type: TaskType;
  minutes: number;
  priorityScore: number;
}
