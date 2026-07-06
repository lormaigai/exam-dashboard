import { addDays, getNextReviewDate, todayISO } from "@/lib/date";
import type { AppData, Assessment, Subject, Task, Topic } from "@/lib/types";

const subjectColors = {
  english: "#1f6f68",
  hcl: "#b95040",
  math1: "#4667a8",
  math2: "#7952a8",
  biology: "#4f8b52",
  chemistry: "#c49a3a",
  physics: "#3b7b8f",
  spanish: "#d6634a"
};

function id(prefix: string, value: string) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return `${prefix}-${slug || "item"}-${hash.toString(36)}`;
}

function topic(
  subjectId: string,
  name: string,
  parentTopic: string | undefined,
  index: number,
  extra: Partial<Topic> = {}
): Topic {
  const confidence = extra.confidence ?? ((index % 5) + 1);
  const reviewed = addDays(todayISO(), -((index + 2) * 3));
  return {
    id: id(`topic-${subjectId}`, name),
    subjectId,
    name,
    parentTopic,
    term: extra.term ?? "Y4",
    confidence,
    difficulty: extra.difficulty ?? (((index + 1) % 5) + 1),
    lastReviewed: reviewed,
    nextReview: getNextReviewDate(confidence, reviewed),
    practiceAccuracy: extra.practiceAccuracy ?? Math.max(45, 92 - index * 3),
    notes: extra.notes ?? "",
    ...extra
  };
}

function assessment(
  subjectId: string,
  name: string,
  type: Assessment["type"],
  termWeek: string,
  dayOffset: number | undefined,
  weighting: number,
  duration: string,
  format: string,
  topics: string[],
  skillsAssessed: string[]
): Assessment {
  return {
    id: id(`assessment-${subjectId}`, name),
    subjectId,
    name,
    type,
    termWeek,
    optionalDate: dayOffset === undefined ? undefined : addDays(todayISO(), dayOffset),
    duration,
    weighting,
    format,
    topics,
    skillsAssessed,
    status: "upcoming"
  };
}

export function createSeedData(): AppData {
  const subjects: Subject[] = [
    {
      id: "english",
      name: "English",
      category: "language",
      colorToken: subjectColors.english,
      targetGrade: "A",
      currentConfidence: 3,
      examWeightPriority: 90,
      notes: "Argumentation, comprehension, and timed writing."
    },
    {
      id: "hcl",
      name: "Higher Chinese",
      category: "language",
      colorToken: subjectColors.hcl,
      targetGrade: "A2",
      currentConfidence: 3,
      examWeightPriority: 88,
      notes: "Paper 1, Paper 2, and oral fluency."
    },
    {
      id: "math1",
      name: "Math 1",
      category: "math",
      colorToken: subjectColors.math1,
      targetGrade: "A1",
      currentConfidence: 3,
      examWeightPriority: 95,
      notes: "Core algebra, functions, geometry, and calculus practice."
    },
    {
      id: "math2",
      name: "Math 2",
      category: "math",
      colorToken: subjectColors.math2,
      targetGrade: "A1",
      currentConfidence: 3,
      examWeightPriority: 95,
      notes: "Shared topic bank with separate tracking."
    },
    {
      id: "biology",
      name: "Biology",
      category: "science",
      colorToken: subjectColors.biology,
      targetGrade: "A1",
      currentConfidence: 3,
      examWeightPriority: 92,
      notes: "Concept recall, experimental skills, and structured responses."
    },
    {
      id: "chemistry",
      name: "Chemistry",
      category: "science",
      colorToken: subjectColors.chemistry,
      targetGrade: "A1",
      currentConfidence: 3,
      examWeightPriority: 92,
      notes: "Calculations, practical planning, and concept links."
    },
    {
      id: "physics",
      name: "Physics",
      category: "science",
      colorToken: subjectColors.physics,
      targetGrade: "A1",
      currentConfidence: 3,
      examWeightPriority: 92,
      notes: "Formula fluency, explanations, and practical investigations."
    },
    {
      id: "spanish",
      name: "Spanish",
      category: "foreign-language",
      colorToken: subjectColors.spanish,
      targetGrade: "A",
      currentConfidence: 3,
      examWeightPriority: 82,
      notes: "O-Level components: writing, reading, listening, oral."
    }
  ];

  const assessments: Assessment[] = [
    assessment("english", "WA1 AAOL1 Argumentation", "oral", "T1W8", -120, 15, "1 min per response", "Oral argument response to stimulus.", ["Argumentation"], ["Speaking", "Evidence and rebuttal"]),
    assessment("english", "WA2 AAOL2 Dialogic Argument", "oral", "T2W4", -75, 15, "Group discussion", "Dialogic argument, speaking, and listening.", ["Dialogic Argument"], ["Listening", "Speaking"]),
    assessment("english", "WA3 AARF Personal Essay", "writing", "T3W3", 18, 15, "Up to 800 words", "Personal essay.", ["Personal Essay"], ["Voice and Style", "Grammar and Mechanics"]),
    assessment("english", "EYA1 Argumentative Essay", "writing", "T4W3", 105, 25, "1h 15min", "400-600 word argumentative essay.", ["Argumentative Essay"], ["Argumentation", "Evidence and Rebuttal"]),
    assessment("english", "EYA2 Reading Comprehension", "reading", "T4W3", 105, 30, "1h 30min", "Written response, MCQ, and summary.", ["Reading Comprehension", "Summary Writing"], ["Inference", "Summary Writing"]),
    assessment("hcl", "PPA1 Paper 2", "paper", "T1W9", -110, 20, "1h 45min", "Cloze, 病句改正, 阅读理解, 片段缩写.", ["短文填空", "病句改正", "阅读理解", "片段缩写"], ["Comprehension", "Language accuracy"]),
    assessment("hcl", "AA-OL Oral", "oral", "T2W5", -60, 20, "10 min", "口头报告 20 marks + 讨论 20 marks.", ["口头报告", "讨论"], ["Fluency", "Argumentation"]),
    assessment("hcl", "PPA2 Paper 1 Writing", "writing", "T2W9", -25, 15, "80 min", "演讲词 / 议论文 / 情境作文.", ["演讲词", "议论文", "情境作文"], ["Writing"]),
    assessment("hcl", "EYA1 Paper 1", "writing", "T4W3", 104, 25, "2h", "实用文 + 作文.", ["实用文", "作文"], ["Writing", "Expression"]),
    assessment("hcl", "EYA2 Paper 2", "paper", "T4W3", 105, 20, "1h 45min", "短文填空, 病句改正, 阅读理解, 片段缩写.", ["短文填空", "病句改正", "阅读理解"], ["Comprehension", "Editing"]),
    assessment("math1", "PPA/CBA", "paper", "Editable", 32, 15, "Editable", "Editable weighted assessment.", ["Shared Math Topics"], ["Accuracy", "Method"]),
    assessment("math1", "AA-PT", "project", "Editable", 62, 10, "Editable", "Editable performance task.", ["Shared Math Topics"], ["Reasoning", "Communication"]),
    assessment("math1", "EYA", "paper", "Editable", 110, 60, "Editable", "End-year assessment.", ["Algebra", "Geometry", "Probability", "Calculus"], ["Problem solving"]),
    assessment("math2", "PPA/CBA", "paper", "Editable", 34, 15, "Editable", "Editable weighted assessment.", ["Shared Math Topics"], ["Accuracy", "Method"]),
    assessment("math2", "AA-PT", "project", "Editable", 64, 10, "Editable", "Editable performance task.", ["Shared Math Topics"], ["Reasoning", "Communication"]),
    assessment("math2", "EYA", "paper", "Editable", 111, 60, "Editable", "End-year assessment.", ["Algebra", "Geometry", "Probability", "Calculus"], ["Problem solving"]),
    assessment("biology", "CBA-1", "paper", "T1W9", -108, 15, "45 min", "MCQ + structured questions.", ["Cells & Chemistry of Life", "Natural Selection", "Reproduction"], ["Recall", "Structured response"]),
    assessment("biology", "CBA-2", "paper", "T2W6", -53, 15, "45 min", "Cells, reproduction, DNA, division.", ["DNA Structure and Function", "Mitosis", "Meiosis"], ["Application"]),
    assessment("biology", "AA-PR", "practical", "T4W3", 102, 15, "90 min", "Practical, research, and planning style assessment.", ["Experimental Skills"], ["Planning", "Data evaluation"]),
    assessment("biology", "EYA", "paper", "T4W5", 118, 55, "2h", "Full Y4 biology assessment.", ["Inheritance", "Infectious Diseases", "Molecular Genetics"], ["Integration", "Explanation"]),
    assessment("chemistry", "PPA1-CBA1", "paper", "T1W8", -116, 15, "45 min", "MCQ + structured questions.", ["Patterns in the Periodic Table", "Atomic Structure"], ["Concepts"]),
    assessment("chemistry", "PPA2-CBA2", "paper", "T2W6", -52, 15, "45 min", "Redox, electrochemistry, and calculations.", ["Redox Chemistry", "Electrochemistry", "Chemical Calculations"], ["Calculation", "Application"]),
    assessment("chemistry", "AA-PR", "practical", "T4W1", 92, 15, "1h 30min", "Practical assessment on Y3 and Y4 topics.", ["Experimental Chemistry", "Practical Planning"], ["Technique", "Planning"]),
    assessment("chemistry", "EYA", "paper", "T4W4", 112, 55, "2h", "All Y3 and Y4 topics.", ["Organic Chemistry", "Polymers", "Air Quality"], ["Analysis", "Structured response"]),
    assessment("physics", "CBA1", "paper", "Term 1", -112, 15, "45 min", "Mechanics, KPM, thermal.", ["Mechanics", "Kinetic Particle Model of Matter", "Thermal Properties of Matter"], ["Formula use", "Explanation"]),
    assessment("physics", "CBA2", "paper", "Term 2", -50, 15, "45 min", "Static electricity, current electricity, waves.", ["Static Electricity", "Current of Electricity", "General Wave Properties"], ["Application"]),
    assessment("physics", "AA-PR", "practical", "Term 4", 100, 15, "90 min", "Hands-on data gathering.", ["Mechanics", "Light", "Practical Skills and Investigations"], ["Data gathering", "Evaluation"]),
    assessment("physics", "EYA", "paper", "Term 4", 116, 55, "120 min", "Full physics assessment.", ["DC Circuits", "Magnetism", "Radioactivity", "General Wave Properties"], ["Problem solving"]),
    assessment("spanish", "Prelim Oral", "oral", "Prelim", 10, 0, "Two 5 min sections", "Presentation/discussion and general conversation.", ["Topic Presentation", "General Conversation"], ["Fluency", "Pronunciation"]),
    assessment("spanish", "GCE O-Level Oral", "oral", "31 Jul-4 Aug", 33, 0, "Two 5 min sections", "Presentation/discussion and general conversation.", ["Topic Presentation", "General Conversation"], ["Communication", "Language Accuracy"]),
    assessment("spanish", "Prelim Written", "paper", "1-3 Sep", 65, 0, "Variable", "Writing, reading, and listening preparation.", ["Writing", "Reading", "Listening"], ["Vocabulary", "Accuracy"]),
    assessment("spanish", "O-Level Writing", "writing", "GCE", 120, 0, "Editable", "Writing component.", ["Writing"], ["Language Accuracy"]),
    assessment("spanish", "O-Level Reading", "reading", "GCE", 122, 0, "Editable", "Reading component.", ["Reading"], ["Comprehension"]),
    assessment("spanish", "O-Level Listening", "listening", "GCE", 124, 0, "Editable", "Listening component.", ["Listening"], ["Listening"])
  ];

  const englishTopics = ["Argumentation", "Dialogic Argument", "Personal Essay", "Argumentative Essay", "Reading Comprehension", "Summary Writing", "Rhetorical Devices", "Evidence and Rebuttal", "Voice and Style", "Grammar and Mechanics"];
  const hclTopics = ["议论文", "演讲词", "情境作文", "材料作文", "实用文: 私人电邮、公务电邮、网上论坛", "病句改正", "短文填空", "阅读理解六大层次", "片段缩写", "口头报告", "讨论", "修辞手法", "人物描写", "论证方法"];
  const mathGroups: Record<string, string[]> = {
    "Algebra and Functions": ["Partial Fractions", "Binomial Theorem", "Linear Law", "Matrices"],
    "Geometry and Trigonometry": ["Coordinate Geometry", "Trigonometry 3", "Vectors", "Proofs in Plane Geometry"],
    "Statistics and Probability": ["Probability", "Tree Diagrams", "Independent and Dependent Events", "Complementary and Mutually Exclusive Events"],
    Calculus: ["Techniques of Differentiation", "Applications of Differentiation", "Techniques of Integration", "Applications of Integration"]
  };
  const scienceTopics: Record<string, string[]> = {
    biology: ["Cells & Chemistry of Life", "Natural Selection", "Reproduction", "Menstrual Cycle", "Conception and IVF", "DNA Structure and Function", "Cell Cycle", "Mitosis", "Meiosis", "Chromosomal Mutations", "Inheritance", "Genetic Diagrams", "Pedigree Charts", "Infectious Diseases", "Molecular Genetics", "Recombinant DNA Technology", "Experimental Skills"],
    chemistry: ["Patterns in the Periodic Table", "Atomic Structure", "Metals and Reactivity Series", "Redox Chemistry", "Electrochemistry", "Chemical Calculations", "Chemical Energetics", "Rate of Reactions", "Chemical Equilibrium", "Experimental Chemistry", "Organic Chemistry", "Polymers", "Air Quality", "Practical Planning", "Data Analysis and Evaluation"],
    physics: ["Mechanics", "Kinematics", "Dynamics", "Work, Energy, Power", "Turning Effect of Forces", "Kinetic Particle Model of Matter", "Thermal Properties of Matter", "Static Electricity", "Current of Electricity", "DC Circuits", "Practical Electricity", "General Wave Properties", "Light", "Magnetism", "Electromagnetism", "Electromagnetic Induction", "Radioactivity", "Practical Skills and Investigations"]
  };
  const spanishTopics = ["Educación", "Vacaciones", "Ocio / Tiempo libre", "Tecnología", "Redes sociales", "Cultura / actividades culturales", "Medioambiente", "Writing", "Reading", "Listening", "Topic Presentation", "General Conversation", "Communication", "Language Accuracy", "Vocabulary", "Pronunciation", "Fluency"];

  const topics: Topic[] = [
    ...englishTopics.map((name, i) => topic("english", name, undefined, i)),
    ...hclTopics.map((name, i) => topic("hcl", name, undefined, i, { practiceAccuracy: Math.max(42, 86 - i * 2) })),
    ...Object.entries(mathGroups).flatMap(([parent, names]) =>
      ["math1", "math2"].flatMap((subjectId) =>
        names.map((name, i) =>
          topic(subjectId, name, parent, i + parent.length, {
            applicableTo: "both",
            formulaConfidence: ((i + 2) % 5) + 1,
            methodConfidence: ((i + 3) % 5) + 1,
            carelessMistakeCount: (i + parent.length) % 4,
            timePressureRating: ((i + 1) % 5) + 1
          })
        )
      )
    ),
    ...Object.entries(scienceTopics).flatMap(([subjectId, names]) =>
      names.map((name, i) => topic(subjectId, name, name.includes("Practical") || name.includes("Experimental") ? "Practical Skills" : undefined, i))
    ),
    ...spanishTopics.map((name, i) => topic("spanish", name, undefined, i, { practiceAccuracy: Math.max(50, 90 - i * 2) }))
  ];

  const firstTopic = (subjectId: string) => topics.find((item) => item.subjectId === subjectId)?.id;
  const tasks: Task[] = [
    { id: "task-english-argument", subjectId: "english", topicId: firstTopic("english"), title: "Draft one argument plan with rebuttal", type: "writing", estimatedMinutes: 45, dueDate: addDays(todayISO(), 1), priority: "high", completed: false },
    { id: "task-hcl-oral", subjectId: "hcl", topicId: firstTopic("hcl"), title: "Record one 口头报告 and review fluency", type: "oral", estimatedMinutes: 35, dueDate: addDays(todayISO(), 2), priority: "medium", completed: false },
    { id: "task-math1-practice", subjectId: "math1", topicId: topics.find((item) => item.subjectId === "math1" && item.name === "Partial Fractions")?.id, title: "Timed partial fractions drill", type: "practice", estimatedMinutes: 40, dueDate: todayISO(), priority: "high", completed: false },
    { id: "task-bio-mistakes", subjectId: "biology", topicId: firstTopic("biology"), title: "Review unresolved biology mistakes", type: "mistake-review", estimatedMinutes: 25, dueDate: todayISO(), priority: "medium", completed: false },
    { id: "task-chem-practical", subjectId: "chemistry", topicId: topics.find((item) => item.subjectId === "chemistry" && item.name === "Practical Planning")?.id, title: "Write one practical planning outline", type: "practical", estimatedMinutes: 35, dueDate: addDays(todayISO(), 3), priority: "medium", completed: false },
    { id: "task-spanish-oral", subjectId: "spanish", topicId: topics.find((item) => item.subjectId === "spanish" && item.name === "Topic Presentation")?.id, title: "Spanish oral topic presentation practice", type: "oral", estimatedMinutes: 30, dueDate: addDays(todayISO(), 1), priority: "high", completed: false }
  ];

  return {
    subjects,
    assessments,
    topics,
    tasks,
    sessions: [
      { id: "session-1", subjectId: "math1", topicIds: [topics.find((item) => item.subjectId === "math1" && item.name === "Matrices")?.id ?? ""], date: addDays(todayISO(), -2), minutes: 45, sessionType: "practice", focusRating: 4, outcomeNotes: "Improved row operation accuracy.", questionsAttempted: 12, questionsCorrect: 9 },
      { id: "session-2", subjectId: "english", topicIds: [firstTopic("english") ?? ""], date: addDays(todayISO(), -1), minutes: 35, sessionType: "writing", focusRating: 3, outcomeNotes: "Need clearer counterargument examples.", questionsAttempted: 1, questionsCorrect: 1 }
    ],
    mistakes: [
      { id: "mistake-1", subjectId: "math1", topicId: topics.find((item) => item.subjectId === "math1" && item.name === "Binomial Theorem")?.id ?? "", source: "worksheet", questionRef: "Binomial set Q8", mistakeType: "careless", whatWentWrong: "Dropped the negative sign in the second term.", correctMethod: "Write the general term before substituting values.", nextAction: "Redo three sign-sensitive examples.", reviewed: false, createdAt: addDays(todayISO(), -3) },
      { id: "mistake-2", subjectId: "physics", topicId: topics.find((item) => item.subjectId === "physics" && item.name === "Current of Electricity")?.id ?? "", source: "quiz", questionRef: "Electricity quiz Q5", mistakeType: "concept-gap", whatWentWrong: "Confused potential difference with current.", correctMethod: "Use charge-flow definitions and units to separate concepts.", nextAction: "Create a one-page comparison table.", reviewed: false, createdAt: addDays(todayISO(), -5) }
    ],
    goals: [
      { id: "goal-1", title: "Keep study blocks sustainable", description: "No more than three blocks on normal school days unless manually planned.", targetDate: addDays(todayISO(), 30), metric: "Weekly plan follows default block limit", status: "in-progress" },
      { id: "goal-2", subjectId: "spanish", title: "Oral confidence lift", description: "Practise Spanish speaking every two days before oral windows.", targetDate: addDays(todayISO(), 33), metric: "At least 10 oral blocks", status: "in-progress" }
    ],
    weeklyReviews: [],
    settings: {
      darkMode: false,
      planner: {
        weekdayMinutes: 120,
        weekendMinutes: 180,
        restDay: "Sunday",
        maxBlocksPerDay: 3
      }
    }
  };
}
