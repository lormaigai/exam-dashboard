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

function officialWeightedAssessment(
  subjectId: string,
  name: string,
  type: Assessment["type"],
  termWeek: string,
  duration: string,
  weighting: number,
  format: string,
  topics: string[],
  skillsAssessed: string[],
  status: Assessment["status"] = "upcoming"
): Assessment {
  return {
    id: makeId(`official-${subjectId}`, `${termWeek}-${name}`),
    subjectId,
    name,
    type,
    termWeek,
    duration,
    weighting,
    format,
    topics,
    skillsAssessed,
    status
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
  officialWeightedAssessment(
    "english",
    "EL WA1 AAOL1 Response to Stimulus",
    "oral",
    "T1W8",
    "1 week (1 min per response)",
    15,
    "Craft an argument in response to a given stimulus, delivered verbally (12 marks)",
    ["Spoken Discourse: Dialogic Argument"],
    [
      "AO4 Justify opinions with explanation and evidence",
      "AO7 Select relevant details and examples",
      "AO8 Employ coherent organisational structures",
      "AO9 Employ standard English"
    ],
    "completed"
  ),
  officialWeightedAssessment(
    "hcl",
    "HCL PPA1 Paper 2",
    "paper",
    "T1W9",
    "1 h 45 min",
    20,
    "试卷二：短文填空（10分）、病句改正（10分）、阅读理解一（10分）、阅读理解二（38分）、片段缩写约80字（12分）",
    ["语文应用与阅读理解（试卷二）"],
    ["四大类型病句的识别与修改", "说明文与议论文手法", "阅读理解六大层次", "片段缩写原则"],
    "completed"
  ),
  {
    ...officialAssessment(
      "geography",
      "Geography WA1 AA-NR Field Inquiry Report",
      "project",
      "2026-04-02",
      "T2W2",
      "All day",
      15,
      "Geographical field inquiry report on an SDG in Singapore; issued T1W8 (23 Feb), submitted T2W2 (2 Apr)"
    ),
    topics: ["Spatial Variations in Development", "Geographical Field Inquiry"],
    skillsAssessed: [
      "Formulate hypothesis and design methodology",
      "Present and analyse data",
      "Evaluate inquiry design and execution",
      "Suggest actions to improve development at the site"
    ],
    status: "completed"
  },
  officialWeightedAssessment(
    "english",
    "EL WA2 AAOL2 Dialogic Argument",
    "oral",
    "T2W4",
    "10 min per group of 5",
    15,
    "Small-group dialogic argument: integrate perspectives and take a stand with real-world evidence; speaking and listening assessed (16 marks)",
    ["Spoken Discourse: Dialogic Argument"],
    [
      "AO4 Justify opinions with explanation and evidence",
      "AO7 Select relevant details and examples",
      "AO8 Employ coherent organisational structures",
      "AO9 Employ standard English"
    ],
    "completed"
  ),
  officialWeightedAssessment(
    "hcl",
    "HCL AA-OL Oral",
    "oral",
    "T2W5",
    "10 min",
    20,
    "口试：看录像短片并拟写报告稿，2分钟口头报告（20分），之后根据提问进行讨论（20分）",
    ["口试：口头报告与讨论"],
    ["结合短片内容呈献口头报告", "根据主考员提问进行讨论"],
    "completed"
  ),
  officialWeightedAssessment(
    "geography",
    "Geography WA2 PPA1 CBA",
    "paper",
    "T2W7",
    "50 min",
    15,
    "Essay on Development and Natural Resources",
    ["Spatial Variations in Development", "Natural Resources and Energy"],
    ["Essay writing", "Account for and evaluate development and resource issues"],
    "completed"
  ),
  officialWeightedAssessment(
    "hcl",
    "HCL PPA2 Paper 1 Essay",
    "writing",
    "T2W9",
    "80 min",
    15,
    "试卷一作文三选一：演讲词、议论文、情境作文",
    ["作文：议论文、演讲词与情境作文（试卷一）"],
    ["审题与拟订内容要点", "议论文写作与论证方法", "语言修改"],
    "completed"
  ),
  officialAssessment("spanish", "Spanish Oral Prelim 2:30 PM", "oral", "2026-07-08", "T3W2", "2:30 PM", 0, "Prelim oral"),
  officialAssessment("ina", "INA AA Due", "project", "2026-07-09", "T3W2", "All day", 0, "Advocacy assignment due"),
  officialAssessment("math1", "Math 1 CBA2", "paper", "2026-07-09", "T3W2", "All day", 0, "CBA2"),
  {
    ...officialAssessment(
      "english",
      "EL AANR Due 3 PM",
      "writing",
      "2026-07-16",
      "T3W3",
      "3:00 PM",
      15,
      "WA3 AARF personal essay of no more than 800 words, developed over 6 weeks (18 marks); final submission due"
    ),
    topics: ["Personal Essay"],
    skillsAssessed: [
      "AO5 Produce texts with insight, imagination and sensitivity",
      "AO6 Make stylistic choices aware of audience impact",
      "AO7 Select relevant details and examples",
      "AO8 Employ coherent organisational structures",
      "AO9 Employ standard English",
      "AO10 Reflect critically on learning and strategies"
    ]
  },
  {
    ...officialAssessment("hcl", "HCL Oral O-Level", "oral", "2026-07-16", "T3W3", "All day", 0, "O-Level oral: 口头报告与讨论"),
    topics: ["口试：口头报告与讨论"],
    skillsAssessed: ["口头报告", "讨论"]
  },
  officialAssessment("spanish", "Spanish O-Level Oral", "oral", "2026-07-31", "T3W5", "All day", 0, "O-Level oral window"),
  officialAssessment("spanish", "Spanish Oral O-Levels Day 1/2", "oral", "2026-08-03", "T3W6", "All day", 0, "O-Level oral"),
  {
    ...officialAssessment(
      "geography",
      "Geography CBA2",
      "paper",
      "2026-08-03",
      "T3W6",
      "40 min",
      15,
      "WA3 PPA2 CBA2: data response questions on tourism field inquiry"
    ),
    topics: ["Tourism in a Globalised World", "Geographical Field Inquiry"],
    skillsAssessed: ["Data response questions", "Evaluate data collection methods in tourism field inquiry"]
  },
  officialAssessment("spanish", "Spanish Oral O-Levels Day 2/2", "oral", "2026-08-04", "T3W6", "All day", 0, "O-Level oral"),
  officialAssessment("math2", "Math 2 CBA2", "paper", "2026-08-11", "T3W7", "All day", 0, "CBA2"),
  officialAssessment("spanish", "Spanish Prelim Writing", "writing", "2026-09-01", "T3W10", "All day", 0, "Prelim writing"),
  officialAssessment("spanish", "Spanish Prelim LC and Reading", "listening", "2026-09-02", "T3W10", "All day", 0, "Prelim listening and reading"),
  officialAssessment("chemistry", "Chemistry AAPR", "practical", "2026-09-15", "T4W1", "All day", 15, "Practical assessment"),
  officialAssessment("biology", "Biology AAPR", "practical", "2026-09-18", "T4W1", "All day", 15, "Practical assessment"),
  officialAssessment("physics", "Physics AAPR", "practical", "2026-09-29", "T4W3", "All day", 15, "Practical assessment"),
  {
    ...officialAssessment(
      "english",
      "EL EYA",
      "paper",
      "2026-09-30",
      "T4W3",
      "1 h 15 min + 1 h 30 min",
      55,
      "EYA1 argumentative essay of 400-600 words with writing process assessed (25%); EYA2 reading comprehension 25 marks + summary writing 15 marks (30%)"
    ),
    topics: ["Argumentation: Reading and Critical Literacy", "Argumentation: Persuasive Writing"],
    skillsAssessed: [
      "AO1 Analyse content, context, language, structure and style",
      "AO2 Analyse effects of creator's choices on audience",
      "AO3 Evaluate relationships among texts",
      "AO4 Justify opinions with explanation and evidence",
      "AO5 Produce texts with insight, imagination and sensitivity",
      "AO6 Make stylistic choices aware of audience impact",
      "AO7 Select relevant details and examples",
      "AO8 Employ coherent organisational structures",
      "AO9 Employ standard English"
    ]
  },
  {
    ...officialAssessment(
      "hcl",
      "HCL EYA",
      "paper",
      "2026-10-01",
      "T4W3",
      "2 h + 1 h 45 min",
      45,
      "EYA1 试卷一：实用文（私人电邮/公务电邮/网上论坛二选一）与作文三选一（25%）；EYA2 试卷二：短文填空、病句改正、阅读理解、片段缩写（20%）"
    ),
    topics: [
      "实用文：电子邮件与网上论坛（试卷一）",
      "作文：议论文、演讲词与情境作文（试卷一）",
      "语文应用与阅读理解（试卷二）"
    ],
    skillsAssessed: ["电子实用文格式与目的", "作文审题与论证方法", "阅读理解六大层次", "片段缩写", "病句改正"]
  },
  officialAssessment("ina", "INA EYA", "project", "2026-10-02", "T4W3", "All day", 0, "End-year assessment"),
  officialAssessment("math2", "Math 2 EYA", "paper", "2026-10-06", "T4W4", "All day", 60, "End-year assessment"),
  {
    ...officialAssessment(
      "geography",
      "Geography EYA",
      "paper",
      "2026-10-07",
      "T4W4",
      "2 h",
      55,
      "Data response structured questions and essay: development, tourism and sustainability"
    ),
    topics: [
      "Spatial Variations in Development",
      "Natural Resources and Energy",
      "Tourism in a Globalised World",
      "The Price of Development and Sustainable Development"
    ],
    skillsAssessed: ["Data response structured questions", "Essay with evaluation and judgement"]
  },
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
    "Present facts, ideas and opinions coherently, varying register to the rhetorical situation",
    "Apply vocal strategies: tone, pace, pitch and volume with sensitivity to audience",
    "Use non-verbal cues: facial expressions, gestures and eye contact to convey meaning",
    "Delineate a speaker's central idea and claims, evaluating the argument as it unfolds",
    "Show active listening: paraphrase, ask clarifying questions and take notes",
    "Build arguments with claims, reasons, evidence, counterclaims and rebuttals",
    "Distinguish valid, sound and strong arguments",
    "Assess evidence by relevance, scope and reliability",
    "Use concessions and rebuttals to engage opposing views constructively",
    "Signpost reasons and conclusions with argument markers; communicate assertively",
    "Synthesise comments, claims and evidence from all sides to resolve contradictions"
  ]),
  ...topicGroup("english", "Argumentation: Reading and Critical Literacy", "T3-T4", [
    "Distinguish explicit and implicit meanings in texts",
    "Read at code-breaking, meaning-making, text-using and text-analysis levels",
    "Determine figurative, connotative and technical meanings and their impact on tone",
    "Deconstruct text structure and explain how central ideas develop",
    "Integrate and evaluate information from multiple media and formats",
    "Analyse visual and multimodal texts across semiotic systems",
    "Identify rhetorical devices and analyse author's purpose and style",
    "Trace and evaluate arguments, assessing sound reasoning and sufficient evidence",
    "Distinguish fact from beliefs and values; identify perspective and bias",
    "Evaluate a text's accuracy, reasonableness and supporting references",
    "Summarise by deleting trivia and redundancy and creating superordinate terms"
  ]),
  ...topicGroup("english", "Argumentation: Persuasive Writing", "T3-T4", [
    "Introduce claims and distinguish them from alternate or opposing claims",
    "Develop claims and counterclaims fairly with well-chosen evidence",
    "Create cohesion among claims, counterclaims, reasons and evidence",
    "Establish and maintain a formal style with a supported conclusion",
    "Write with nuance, anticipating varying and conflicting audience perspectives",
    "Develop rhythm in prose; eliminate redundancy, convolutedness and jargon",
    "Establish voice suited to form, audience, context and purpose",
    "Sustain coherence with conjunctions, controlled tense and transitions",
    "Use context and word roots to deduce meaning; distinguish connotations",
    "Strengthen writing through planning, revising, editing and rewriting"
  ]),
  ...topicGroup("english", "Personal Essay", "T2-T3", [
    "Treat the self as evidence while handling the topic logically",
    "Balance intimacy and distance in personal writing",
    "Engage the reader with a significant problem, situation or observation",
    "Use narrative techniques: dialogue, pacing, description and reflection",
    "Use precise words, telling details and sensory language",
    "Sequence events to build tone and outcome such as growth or resolution",
    "Conclude by reflecting on what is experienced, observed or resolved",
    "Reflect on drafts against personal goals and revise with feedback"
  ]),
  ...topicGroup("hcl", "语文应用与阅读理解（试卷二）", "T1-T4", [
    "短文填空：根据语境选择贴切词语",
    "病句改正：根据四大类型语病找出并修改病句",
    "说明文的顺序和说明方法",
    "议论文的论证方法：举例、引用、对比、比喻论证",
    "记叙文相关的语文技能",
    "各种人物描写手法",
    "各种修辞手法",
    "阅读理解六大层次：复述、解释、重整、伸展、评鉴、创新",
    "片段缩写：按原则将段落缩写成约80字"
  ]),
  ...topicGroup("hcl", "作文：议论文、演讲词与情境作文（试卷一）", "T2-T4", [
    "审题：找出关键词语，拟订写作范围和内容要点",
    "议论文三要素：论点、论据、论证",
    "运用举例、引用、对比、比喻论证法写作",
    "演讲词的写作与说服元素",
    "情境作文：运用心理描写等技巧深化主题",
    "情境作文：运用修辞手法，写借景抒情的散文",
    "材料作文：根据题目要求选择典型材料",
    "修改文章语言"
  ]),
  ...topicGroup("hcl", "实用文：电子邮件与网上论坛（试卷一）", "T3-T4", [
    "审定电子实用文的内容要求与写作目的",
    "掌握私人电邮的格式与语气",
    "掌握公务电邮的格式与语言",
    "掌握网上论坛的格式与会考要求"
  ]),
  ...topicGroup("hcl", "口试：口头报告与讨论", "T2-T3", [
    "观看录像短片并拟写报告稿",
    "结合话题与短片内容呈献不超过2分钟的口头报告",
    "根据主考员的提问进行讨论",
    "在讨论中延伸观点并使用准确华语"
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
    "Define development, standard of living and quality of life",
    "Describe inequalities in development at local, national and global scales",
    "Explain the North-South Divide and the development gap",
    "Explain influencing factors of development: governance, opportunities, resources, gender",
    "Evaluate economic and non-economic indicators: GDP/GNP, HDI, Happiness Index, SDGs",
    "Compare and assess the development status of selected countries",
    "Describe Singapore development policies: Green Plan, Smart Nation"
  ]),
  ...topicGroup("geography", "Natural Resources and Energy", "T1-T2", [
    "Define resources, renewable and non-renewable",
    "Account for variations in distribution, access and use of energy resources",
    "Analyse links between resource endowment, use and development",
    "Evaluate resource optimism versus resource curse (Sierra Leone vs Botswana)",
    "Explain demand and supply of energy resources and impacts of exploitation",
    "Explain causes and effects of the energy crisis",
    "Apply energy mix, energy trilemma and energy security concepts",
    "Assess alternative and green energy with Singapore's Energy Story"
  ]),
  ...topicGroup("geography", "Tourism in a Globalised World", "T2-T3", [
    "Describe and explain trends and patterns of global tourism",
    "Explain tourism as a system: generating regions, transit routes, destinations",
    "Apply the 6As to account for a destination's tourism potential",
    "Explain reasons for tourism growth and Plog's tourist typology",
    "Apply tourism carrying capacity and the six-stage Butler model",
    "Compare and contrast mass tourism and ecotourism, including heritage tourism",
    "Assess socio-cultural, economic and environmental impacts of tourism",
    "Assess sustainability of mass and honeypot tourism using the sustainable tourism framework",
    "Evaluate stakeholder roles (public, private, people) in sustainable tourism"
  ]),
  ...topicGroup("geography", "The Price of Development and Sustainable Development", "T3-T4", [
    "Define poverty, absolute poverty and relative poverty",
    "Account for global trends and patterns of income disparity",
    "Describe manifestations of poverty in society",
    "Explain causes and effects of spatial inequalities in income",
    "Describe forms of aid and the role of international aid in poverty reduction",
    "Evaluate poverty-reduction strategies: technology, aid, CSR, women's empowerment",
    "Compare development challenges faced by different global economies"
  ]),
  ...topicGroup("geography", "Geographical Field Inquiry", "T1-T4", [
    "Formulate a relevant hypothesis",
    "Design data collection and sampling methods",
    "Present data with appropriate techniques such as histograms and line graphs",
    "Analyse data in response to the hypothesis",
    "Evaluate inquiry design and execution",
    "Suggest actions and advocacy from findings"
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
