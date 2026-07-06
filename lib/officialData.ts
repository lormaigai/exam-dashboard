import type { Assessment, Subject, Topic } from "@/lib/types";

function makeId(prefix: string, value: string) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return `${prefix}-${slug || "item"}-${hash.toString(36)}`;
}

function officialAssessment(
  subjectId: string,
  name: string,
  type: Assessment["type"],
  date: string,
  termWeek: string,
  duration = "All day",
  weighting = 0,
  format = "Official timetable entry"
): Assessment {
  return {
    id: makeId(`official-${subjectId}`, `${date}-${name}`),
    subjectId,
    name,
    type,
    termWeek,
    optionalDate: date,
    duration,
    weighting,
    format,
    topics: [],
    skillsAssessed: [],
    status: "upcoming"
  };
}

function officialTopic(subjectId: string, name: string, parentTopic: string, index: number, term = "Y4"): Topic {
  return {
    id: makeId(`official-topic-${subjectId}`, `${parentTopic}-${name}`),
    subjectId,
    name,
    parentTopic,
    term,
    confidence: 3,
    difficulty: 3,
    practiceAccuracy: 70,
    notes: "Added from 2026 Y4 curriculum/assessment PDFs."
  };
}

function topicGroup(subjectId: string, parentTopic: string, term: string, items: string[]) {
  return items.map((name, index) => officialTopic(subjectId, name, parentTopic, index, term));
}

export const officialSubjects: Subject[] = [
  {
    id: "geography",
    name: "Geography",
    category: "humanities",
    colorToken: "#6f5f3f",
    targetGrade: "A",
    currentConfidence: 3,
    examWeightPriority: 86,
    notes: "Geographical investigation, data response, and essay judgement.",
    includeInPlanning: true
  },
  {
    id: "ina",
    name: "Inquiry & Advocacy",
    category: "project",
    colorToken: "#8a5a44",
    targetGrade: "A",
    currentConfidence: 3,
    examWeightPriority: 80,
    notes: "Research, advocacy, argumentation, and final submission deadlines.",
    includeInPlanning: true
  }
];

export const officialAssessments: Assessment[] = [
  officialAssessment("spanish", "Spanish Oral Prelim 2:30 PM", "oral", "2026-07-08", "T3W2", "2:30 PM", 0, "Prelim oral"),
  officialAssessment("ina", "INA AA Due", "project", "2026-07-09", "T3W2", "All day", 0, "Advocacy assignment due"),
  officialAssessment("math1", "Math 1 CBA2", "paper", "2026-07-09", "T3W2", "All day", 0, "CBA2"),
  officialAssessment("english", "EL AANR Due 3 PM", "writing", "2026-07-16", "T3W3", "3:00 PM", 0, "AANR submission due"),
  officialAssessment("hcl", "HCL Oral O-Level", "oral", "2026-07-16", "T3W3", "All day", 0, "O-Level oral"),
  officialAssessment("spanish", "Spanish O-Level Oral", "oral", "2026-07-31", "T3W5", "All day", 0, "O-Level oral window"),
  officialAssessment("spanish", "Spanish Oral O-Levels Day 1/2", "oral", "2026-08-03", "T3W6", "All day", 0, "O-Level oral"),
  officialAssessment("geography", "Geography CBA2", "paper", "2026-08-03", "T3W6", "All day", 0, "CBA2"),
  officialAssessment("spanish", "Spanish Oral O-Levels Day 2/2", "oral", "2026-08-04", "T3W6", "All day", 0, "O-Level oral"),
  officialAssessment("math2", "Math 2 CBA2", "paper", "2026-08-11", "T3W7", "All day", 0, "CBA2"),
  officialAssessment("spanish", "Spanish Prelim Writing", "writing", "2026-09-01", "T3W10", "All day", 0, "Prelim writing"),
  officialAssessment("spanish", "Spanish Prelim LC and Reading", "listening", "2026-09-02", "T3W10", "All day", 0, "Prelim listening and reading"),
  officialAssessment("chemistry", "Chemistry AAPR", "practical", "2026-09-15", "T4W1", "All day", 15, "Practical assessment"),
  officialAssessment("biology", "Biology AAPR", "practical", "2026-09-18", "T4W1", "All day", 15, "Practical assessment"),
  officialAssessment("physics", "Physics AAPR", "practical", "2026-09-29", "T4W3", "All day", 15, "Practical assessment"),
  officialAssessment("english", "EL EYA", "paper", "2026-09-30", "T4W3", "All day", 55, "End-year assessment"),
  officialAssessment("hcl", "HCL EYA", "paper", "2026-10-01", "T4W3", "All day", 45, "End-year assessment"),
  officialAssessment("ina", "INA EYA", "project", "2026-10-02", "T4W3", "All day", 0, "End-year assessment"),
  officialAssessment("math2", "Math 2 EYA", "paper", "2026-10-06", "T4W4", "All day", 60, "End-year assessment"),
  officialAssessment("geography", "Geography EYA", "paper", "2026-10-07", "T4W4", "All day", 55, "End-year assessment"),
  officialAssessment("math1", "Math 1 EYA", "paper", "2026-10-07", "T4W4", "All day", 60, "End-year assessment"),
  officialAssessment("chemistry", "Chemistry EYA", "paper", "2026-10-08", "T4W4", "All day", 55, "End-year assessment"),
  officialAssessment("biology", "Biology EYA", "paper", "2026-10-09", "T4W4", "All day", 55, "End-year assessment"),
  officialAssessment("spanish", "8 AM Spanish O-Levels Paper 1", "writing", "2026-10-12", "T4W5", "8:00 AM", 0, "O-Level Paper 1"),
  officialAssessment("physics", "Physics EYA", "paper", "2026-10-12", "T4W5", "All day", 55, "End-year assessment"),
  officialAssessment("spanish", "Spanish O-Levels Paper 2 Main + LC", "listening", "2026-10-14", "T4W5", "All day", 0, "O-Level Paper 2"),
  officialAssessment("hcl", "HCL O-Levels Written Day 1/2", "paper", "2026-11-04", "T4W8", "All day", 0, "O-Level written paper"),
  officialAssessment("hcl", "HCL O-Levels Written Day 2/2", "paper", "2026-11-05", "T4W8", "All day", 0, "O-Level written paper")
];

export const officialTopics: Topic[] = [
  ...topicGroup("english", "Spoken Discourse: Dialogic Argument", "T1-T2", [
    "Present facts, ideas and opinions coherently with suitable register",
    "Use tone, pace, pitch, volume and non-verbal cues intentionally",
    "Delineate central ideas and evaluate a speaker's argument",
    "Paraphrase before responding and ask clarifying questions",
    "Use claims, reasons, evidence, counterclaims and rebuttals",
    "Assess evidence by relevance, scope and reliability",
    "Use concessions and rebuttals to strengthen argumentation",
    "Practise assertive communication in rational discussion"
  ]),
  ...topicGroup("english", "Argumentation: Reading and Critical Literacy", "T3-T4", [
    "Distinguish explicit and implicit meanings in texts",
    "Read through code-breaking, meaning-making, text-using and text-analysis levels",
    "Determine word, phrase, figurative and connotative meaning",
    "Deconstruct text structure and explain how ideas develop",
    "Integrate and evaluate information from multiple media and formats",
    "Identify rhetorical devices and analyse author purpose",
    "Trace and evaluate arguments and specific claims",
    "Distinguish facts from beliefs and values",
    "Write concise summaries by deleting trivia and redundancy"
  ]),
  ...topicGroup("english", "Writing: Personal and Argumentative Essays", "T3-T4", [
    "Plan personal essays with clear voice, reflection and purpose",
    "Write argumentative essays with thesis, supporting reasons and rebuttal",
    "Select relevant examples and evidence for audience and purpose",
    "Use content, form and craft to shape meaning",
    "Revise grammar, mechanics, paragraphing and style for clarity"
  ]),
  ...topicGroup("hcl", "议论文与演讲词", "T1-T4", [
    "议论文三要素：论点、论据、论证",
    "议论文结构：引论、本论、结论",
    "运用举例论证、引用论证、对比论证、比喻论证",
    "使用过渡句增强文章严密性",
    "审清题目并确定中心论点",
    "设计有吸引力的演讲词开头和结尾",
    "在演讲词中加入互动和说服元素"
  ]),
  ...topicGroup("hcl", "语文应用与阅读理解", "T1-T4", [
    "短文填空：根据语境选择贴切词语",
    "病句改正：识别常见语病并对症修改",
    "阅读理解六大层次：复述、解释、重整、伸展、评鉴、创新",
    "识别题型关键词与题眼",
    "片段缩写：提炼要点并准确表达",
    "运用语法知识改善表达与沟通"
  ]),
  ...topicGroup("hcl", "实用文与材料作文", "T3-T4", [
    "私人电邮、公务电邮、网上论坛的格式与语气",
    "根据不同机构和情境确定实用文目的",
    "公务电邮内容结构、格式与语言",
    "材料作文审题与观点提炼",
    "试卷一作文与实用文限时审题训练"
  ]),
  ...topicGroup("hcl", "口试与讨论", "T3", [
    "口头报告内容组织",
    "讨论回应与观点延伸",
    "使用准确华语表达观点",
    "全国高华口试周准备与模拟练习"
  ]),
  ...topicGroup("math1", "Algebra and Functions", "T1-T3", [
    "Partial fractions for rational functions",
    "Binomial expansion of (a+b)^n and (1+x)^n",
    "Find terms in products of binomial expansions",
    "Represent non-linear relationships in linear form",
    "Solve modelling problems using linear law",
    "Display and interpret matrices of any order",
    "Add, multiply and scalar multiply matrices",
    "Use 2 by 2 zero and identity matrices"
  ]),
  ...topicGroup("math2", "Algebra and Functions", "T1-T3", [
    "Partial fractions for rational functions",
    "Binomial expansion of (a+b)^n and (1+x)^n",
    "Find terms in products of binomial expansions",
    "Represent non-linear relationships in linear form",
    "Solve modelling problems using linear law",
    "Display and interpret matrices of any order",
    "Add, multiply and scalar multiply matrices",
    "Use 2 by 2 zero and identity matrices"
  ]),
  ...topicGroup("math1", "Geometry and Trigonometry", "T1-T3", [
    "Gradient, midpoint and distance in coordinate geometry",
    "Parallel and perpendicular line conditions",
    "Equation of a line in general, gradient-intercept and double-intercept forms",
    "Equation of a circle and completing the square",
    "Line-circle intersection problems",
    "Addition, double-angle and R-formula trigonometric identities",
    "Vector addition, subtraction and scalar multiplication",
    "Parallel vectors and collinearity proofs",
    "Midpoint theorem and tangent-chord theorem proofs"
  ]),
  ...topicGroup("math2", "Geometry and Trigonometry", "T1-T3", [
    "Gradient, midpoint and distance in coordinate geometry",
    "Parallel and perpendicular line conditions",
    "Equation of a line in general, gradient-intercept and double-intercept forms",
    "Equation of a circle and completing the square",
    "Line-circle intersection problems",
    "Addition, double-angle and R-formula trigonometric identities",
    "Vector addition, subtraction and scalar multiplication",
    "Parallel vectors and collinearity proofs",
    "Midpoint theorem and tangent-chord theorem proofs"
  ]),
  ...topicGroup("math1", "Statistics and Probability", "T1", [
    "Experiment, event, outcome and sample space",
    "Experimental probability and law of large numbers",
    "Complementary and mutually exclusive events",
    "Tree diagrams and probability diagrams",
    "Independent and dependent events",
    "Combined event probability calculations",
    "Conditional probability and Bayes theorem enrichment"
  ]),
  ...topicGroup("math2", "Statistics and Probability", "T1", [
    "Experiment, event, outcome and sample space",
    "Experimental probability and law of large numbers",
    "Complementary and mutually exclusive events",
    "Tree diagrams and probability diagrams",
    "Independent and dependent events",
    "Combined event probability calculations",
    "Conditional probability and Bayes theorem enrichment"
  ]),
  ...topicGroup("math1", "Calculus", "T2-T3", [
    "Standard derivative notation and derived functions",
    "Differentiate standard functions, products and quotients",
    "Chain rule for function of a function",
    "Tangents and normals",
    "Increasing/decreasing functions and stationary points",
    "Maximum, minimum and stationary inflexion points",
    "Kinematics and related rates",
    "Indefinite integration as reverse differentiation",
    "Integrate algebraic, trigonometric and exponential functions",
    "Area bounded by curves"
  ]),
  ...topicGroup("math2", "Calculus", "T2-T3", [
    "Standard derivative notation and derived functions",
    "Differentiate standard functions, products and quotients",
    "Chain rule for function of a function",
    "Tangents and normals",
    "Increasing/decreasing functions and stationary points",
    "Maximum, minimum and stationary inflexion points",
    "Kinematics and related rates",
    "Indefinite integration as reverse differentiation",
    "Integrate algebraic, trigonometric and exponential functions",
    "Area bounded by curves"
  ]),
  ...topicGroup("geography", "Spatial Variations in Development", "T1", [
    "Define and compare indicators of development",
    "Interpret spatial and temporal development data",
    "Analyse cause-effect relationships behind development gaps",
    "Compare development of selected countries",
    "Judge progress using sustainability and multiple perspectives"
  ]),
  ...topicGroup("geography", "Natural Resources and Energy", "T1-T2", [
    "Define renewable and non-renewable resources",
    "Explain resource endowment and spatial distribution",
    "Analyse links between resource endowment, use and development",
    "Evaluate resource optimism and resource curse perspectives",
    "Assess energy crisis causes and effects",
    "Evaluate alternative and green energy resources",
    "Use Singapore Energy Story and other case studies"
  ]),
  ...topicGroup("geography", "Tourism Studies", "T2-T3", [
    "Describe trends and patterns of global tourism",
    "Explain tourist-generating, transit and destination regions",
    "Apply 6As of a tourist destination",
    "Use Butler model of tourist destination life cycle",
    "Compare mass tourism, ecotourism and heritage tourism",
    "Assess socio-cultural, economic and environmental tourism impacts",
    "Evaluate sustainable tourism using field inquiry data",
    "Assess stakeholder roles in tourism management"
  ]),
  ...topicGroup("geography", "Development, Poverty and Sustainability", "T3-T4", [
    "Define poverty, absolute poverty and relative poverty",
    "Account for trends and patterns of income disparity",
    "Describe manifestations of poverty in society",
    "Explain causes and effects of poverty",
    "Describe forms of international aid",
    "Evaluate aid and poverty-reduction strategies",
    "Assess sustainable development through stakeholder collaboration"
  ]),
  ...topicGroup("geography", "Geography Command Words and Field Inquiry", "T1-T4", [
    "Account for: describe and explain",
    "Assess/Evaluate: weigh evidence and reach judgement",
    "Compare/Contrast using explicit criteria",
    "Justify a supported position",
    "Discuss multiple viewpoints with a conclusion",
    "Evaluate usefulness and reliability of geographical data"
  ]),
  ...topicGroup("ina", "Economy and Society in a Globalised World", "T1-T2", [
    "Globalisation intensifies and accelerates flows and interactions",
    "Technology, MNCs, consumers and governments drive global interconnections",
    "Arguments for trade and protectionism",
    "Singapore and the imperative of free trade",
    "Uneven impacts of globalisation and free trade",
    "Social justice through fair distribution of resources",
    "Gather and evaluate sources for substantiated conclusions"
  ]),
  ...topicGroup("ina", "Advocacy in a Globalised World", "T2-T3", [
    "Advocacy represents interests to achieve change and empowerment",
    "Build evidence on what needs to change and how change can happen",
    "Influence people with power while staying culturally aware",
    "Global citizenship and local-global interconnections",
    "Consequentialism, deontology and virtue ethics",
    "Perspective-taking and ethical decision-making",
    "Create an advocacy product with evidence and reflection"
  ]),
  ...topicGroup("ina", "Politics in a Globalised World", "T2-T3", [
    "Diplomacy among state and non-state actors",
    "National interest, sovereignty and vulnerability",
    "Soft power and hard power",
    "International rule of law and stability",
    "Singapore diplomacy with ASEAN",
    "South China Sea conflict",
    "Foreign policy in US-China rivalry"
  ])
];
