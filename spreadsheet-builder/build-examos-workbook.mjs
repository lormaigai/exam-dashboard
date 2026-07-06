import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.resolve("..", "outputs", "examos_spreadsheet");
const outputPath = path.join(outputDir, "ExamOS_Study_Tracker.xlsx");

const today = new Date(2026, 6, 6); // 2026-07-06, Singapore context supplied by user

const subjects = [
  ["english", "English", "language", "A", 3, 90, true, "Argumentation, comprehension, timed writing. Lower revision load if toggled off."],
  ["hcl", "Higher Chinese", "language", "A2", 3, 88, true, "Paper 1, Paper 2, oral fluency, O-Level written papers."],
  ["math1", "Math 1", "math", "A1", 3, 95, true, "Algebra, functions, geometry, probability, calculus."],
  ["math2", "Math 2", "math", "A1", 3, 95, true, "Higher math practice and shared topic bank."],
  ["biology", "Biology", "science", "A1", 3, 92, true, "Concept recall, structured responses, practical assessment."],
  ["chemistry", "Chemistry", "science", "A1", 3, 92, true, "Calculations, redox, electrochemistry, organic, practical planning."],
  ["physics", "Physics", "science", "A1", 3, 92, true, "Formula fluency, explanations, electricity, radioactivity, practicals."],
  ["spanish", "Spanish", "foreign-language", "A", 3, 82, true, "Writing, reading, listening, oral O-Level components."],
  ["geography", "Geography", "humanities", "A", 3, 86, true, "Data response, field inquiry, essays, development and tourism."],
  ["ina", "Inquiry & Advocacy", "project", "A", 3, 80, true, "Research, advocacy, evidence, final submissions."]
];

const assessments = [
  ["official-spanish-oral-prelim", "Spanish Oral Prelim 2:30 PM", "2026-07-08", "2:30 PM", "spanish", "oral", "T3W2", "Sem 2", 0, "Prelim oral"],
  ["official-ina-aa-due", "INA AA Due", "2026-07-09", "All day", "ina", "project", "T3W2", "Sem 2", 0, "Advocacy assignment due"],
  ["official-math1-cba2", "Math 1 CBA2", "2026-07-09", "All day", "math1", "paper", "T3W2", "Sem 2", 0, "CBA2"],
  ["official-el-aanr-due", "EL AANR Due 3 PM", "2026-07-16", "3:00 PM", "english", "writing", "T3W3", "Sem 2", 0, "AANR submission due"],
  ["official-hcl-oral-o-level", "HCL Oral O-Level", "2026-07-16", "All day", "hcl", "oral", "T3W3", "Sem 2", 0, "O-Level oral"],
  ["official-spanish-o-level-oral", "Spanish O-Level Oral", "2026-07-31", "All day", "spanish", "oral", "T3W5", "Sem 2", 0, "O-Level oral window"],
  ["official-spanish-oral-day-1", "Spanish Oral O-Levels Day 1/2", "2026-08-03", "All day", "spanish", "oral", "T3W6", "Sem 2", 0, "O-Level oral"],
  ["official-geog-cba2", "Geography CBA2", "2026-08-03", "All day", "geography", "paper", "T3W6", "Sem 2", 0, "CBA2"],
  ["official-spanish-oral-day-2", "Spanish Oral O-Levels Day 2/2", "2026-08-04", "All day", "spanish", "oral", "T3W6", "Sem 2", 0, "O-Level oral"],
  ["official-math2-cba2", "Math 2 CBA2", "2026-08-11", "All day", "math2", "paper", "T3W7", "Sem 2", 0, "CBA2"],
  ["official-spanish-prelim-writing", "Spanish Prelim Writing", "2026-09-01", "All day", "spanish", "writing", "T3W10", "Sem 2", 0, "Prelim writing"],
  ["official-spanish-prelim-lc-reading", "Spanish Prelim LC and Reading", "2026-09-02", "All day", "spanish", "listening", "T3W10", "Sem 2", 0, "Prelim listening and reading"],
  ["official-chem-aapr", "Chemistry AAPR", "2026-09-15", "All day", "chemistry", "practical", "T4W1", "Sem 2", 15, "Practical assessment"],
  ["official-bio-aapr", "Biology AAPR", "2026-09-18", "All day", "biology", "practical", "T4W1", "Sem 2", 15, "Practical assessment"],
  ["official-phys-aapr", "Physics AAPR", "2026-09-29", "All day", "physics", "practical", "T4W3", "Sem 2", 15, "Practical assessment"],
  ["official-el-eya", "EL EYA", "2026-09-30", "All day", "english", "paper", "T4W3", "Sem 2", 55, "End-year assessment"],
  ["official-hcl-eya", "HCL EYA", "2026-10-01", "All day", "hcl", "paper", "T4W3", "Sem 2", 45, "End-year assessment"],
  ["official-ina-eya", "INA EYA", "2026-10-02", "All day", "ina", "project", "T4W3", "Sem 2", 0, "End-year assessment"],
  ["official-math2-eya", "Math 2 EYA", "2026-10-06", "All day", "math2", "paper", "T4W4", "Sem 2", 60, "End-year assessment"],
  ["official-geog-eya", "Geography EYA", "2026-10-07", "All day", "geography", "paper", "T4W4", "Sem 2", 55, "End-year assessment"],
  ["official-math1-eya", "Math 1 EYA", "2026-10-07", "All day", "math1", "paper", "T4W4", "Sem 2", 60, "End-year assessment"],
  ["official-chem-eya", "Chemistry EYA", "2026-10-08", "All day", "chemistry", "paper", "T4W4", "Sem 2", 55, "End-year assessment"],
  ["official-bio-eya", "Biology EYA", "2026-10-09", "All day", "biology", "paper", "T4W4", "Sem 2", 55, "End-year assessment"],
  ["official-spanish-paper-1", "8 AM Spanish O-Levels Paper 1", "2026-10-12", "8:00 AM", "spanish", "writing", "T4W5", "Sem 2", 0, "O-Level Paper 1"],
  ["official-physics-eya", "Physics EYA", "2026-10-12", "All day", "physics", "paper", "T4W5", "Sem 2", 55, "End-year assessment"],
  ["official-spanish-paper-2", "Spanish O-Levels Paper 2 Main + LC", "2026-10-14", "All day", "spanish", "listening", "T4W5", "Sem 2", 0, "O-Level Paper 2"],
  ["official-hcl-written-day-1", "HCL O-Levels Written Day 1/2", "2026-11-04", "All day", "hcl", "paper", "T4W8", "Sem 2", 0, "O-Level written paper"],
  ["official-hcl-written-day-2", "HCL O-Levels Written Day 2/2", "2026-11-05", "All day", "hcl", "paper", "T4W8", "Sem 2", 0, "O-Level written paper"]
];

const topicGroups = {
  english: {
    "Argumentation & Writing": ["Argumentation", "Dialogic Argument", "Personal Essay", "Argumentative Essay", "Evidence and Rebuttal", "Voice and Style", "Grammar and Mechanics"],
    "Reading": ["Reading Comprehension", "Summary Writing", "Rhetorical Devices"]
  },
  hcl: {
    "Writing": ["议论文", "演讲词", "情境作文", "材料作文", "实用文"],
    "Paper 2": ["病句改正", "短文填空", "阅读理解六大层次", "片段缩写"],
    "Oral": ["口头报告", "讨论", "修辞手法", "论证方法"]
  },
  math1: {
    "Algebra and Functions": ["Partial Fractions", "Binomial Theorem", "Linear Law", "Matrices"],
    "Geometry and Trigonometry": ["Coordinate Geometry", "Trigonometry 3", "Vectors", "Proofs in Plane Geometry"],
    "Statistics and Probability": ["Probability", "Tree Diagrams", "Independent and Dependent Events", "Complementary and Mutually Exclusive Events"],
    "Calculus": ["Techniques of Differentiation", "Applications of Differentiation", "Techniques of Integration", "Applications of Integration"]
  },
  math2: {
    "Algebra and Functions": ["Partial Fractions", "Binomial Theorem", "Linear Law", "Matrices"],
    "Geometry and Trigonometry": ["Coordinate Geometry", "Trigonometry 3", "Vectors", "Proofs in Plane Geometry"],
    "Statistics and Probability": ["Probability", "Tree Diagrams", "Independent and Dependent Events", "Complementary and Mutually Exclusive Events"],
    "Calculus": ["Techniques of Differentiation", "Applications of Differentiation", "Techniques of Integration", "Applications of Integration"]
  },
  biology: {
    "Natural Selection & Reproduction": ["Natural selection", "Environmental selection factors", "Asexual vs sexual reproduction", "Flower reproduction", "Human reproductive systems", "Menstrual cycle", "Fertilisation and implantation", "HIV transmission"],
    "DNA & Cell Division": ["DNA genes chromosomes", "DNA structure", "Complementary base pairing", "Mitosis", "Meiosis", "Cancerous growth", "Chromosomal mutations"],
    "Inheritance & Molecular Genetics": ["Inheritance", "Genetic diagrams", "Pedigree charts", "Infectious diseases", "Molecular genetics", "Recombinant DNA technology"],
    "Practical": ["Experimental skills", "Planning", "Data analysis and evaluation"]
  },
  chemistry: {
    "Atomic & Periodic": ["Patterns in the Periodic Table", "Atomic Structure", "Metals and Reactivity Series"],
    "Reactions & Calculations": ["Redox Chemistry", "Electrochemistry", "Chemical Calculations", "Chemical Energetics", "Rate of Reactions", "Chemical Equilibrium"],
    "Organic & Environment": ["Organic Chemistry", "Polymers", "Air Quality"],
    "Practical": ["Experimental Chemistry", "Practical Planning", "Data Analysis and Evaluation"]
  },
  physics: {
    "Mechanics": ["Mechanics", "Kinematics", "Dynamics", "Work Energy Power", "Turning Effect of Forces"],
    "Thermal & Waves": ["Kinetic Particle Model", "Thermal Properties", "General Wave Properties", "Light"],
    "Electricity & Magnetism": ["Static Electricity", "Current of Electricity", "DC Circuits", "Practical Electricity", "Magnetism", "Electromagnetism", "Electromagnetic Induction"],
    "Modern & Practical": ["Radioactivity", "Practical Skills and Investigations"]
  },
  spanish: {
    "Topics": ["Educacion", "Vacaciones", "Ocio / Tiempo libre", "Tecnologia", "Redes sociales", "Cultura", "Medioambiente"],
    "Skills": ["Writing", "Reading", "Listening", "Topic Presentation", "General Conversation", "Communication", "Language Accuracy", "Vocabulary", "Pronunciation", "Fluency"]
  },
  geography: {
    "Natural Resources & Development": ["Explain geographical concepts", "Infer data from maps and graphs", "Analyse cause-effect relationships", "Account for trends and spatial patterns", "Judge sustainability trade-offs"],
    "Tourism Studies": ["Tourism field inquiry", "Structured data response", "Costs and benefits of tourism", "Stakeholder viewpoints"],
    "Development & Poverty": ["Indicators of development", "Spatial variations in development", "Poverty cycle", "Types and effectiveness of aid", "Sustainable development strategies"],
    "Command Words": ["Account for", "Assess / Evaluate", "Compare / Contrast", "Justify", "Discuss"]
  },
  ina: {
    "Inquiry & Advocacy": ["Research question and scope", "Source reliability", "Evidence selection", "Advocacy message clarity", "Counterargument and rebuttal", "Final reflection and submission readiness"]
  }
};

function excelDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function subjectName(id) {
  return subjects.find((row) => row[0] === id)?.[1] ?? id;
}

function buildSyllabusRows() {
  const rows = [];
  let index = 1;
  for (const [subjectId, sections] of Object.entries(topicGroups)) {
    for (const [section, topics] of Object.entries(sections)) {
      for (const topic of topics) {
        rows.push([
          `topic-${index}`,
          subjectId,
          section,
          topic,
          "core",
          3,
          3,
          70,
          false,
          "",
          ""
        ]);
        index += 1;
      }
    }
  }
  return rows;
}

function dateRange(startIso, days) {
  const start = excelDate(startIso);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function addTitle(sheet, title, subtitle, lastCol = "H") {
  sheet.getRange(`A1:${lastCol}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A2:${lastCol}2`).merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A1:${lastCol}2`).format = {
    fill: "#1A2332",
    font: { color: "#F7F4ED", bold: true },
    wrapText: true
  };
  sheet.getRange("A1").format.font.size = 18;
}

function styleHeader(range) {
  range.format = {
    fill: "#1F6F68",
    font: { color: "#FFFFFF", bold: true },
    wrapText: true
  };
}

function setWidths(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 220, 1).format.columnWidth = width;
  });
}

function addTable(sheet, address, name) {
  const table = sheet.tables.add(address, true, name);
  table.showFilterButton = true;
  table.showBandedRows = true;
  return table;
}

const workbook = Workbook.create();
const futureAssessments = assessments
  .map((row) => ({ row, date: excelDate(row[2]) }))
  .filter((item) => item.date >= today)
  .sort((a, b) => a.date.getTime() - b.date.getTime());

const dashboard = workbook.worksheets.add("Dashboard");
const assessmentsSheet = workbook.worksheets.add("Assessments");
const subjectsSheet = workbook.worksheets.add("Subjects");
const syllabusSheet = workbook.worksheets.add("Syllabus");
const calendarSheet = workbook.worksheets.add("Calendar");
const plannerSheet = workbook.worksheets.add("Weekly Planner");
const studySheet = workbook.worksheets.add("Study Log");
const mistakesSheet = workbook.worksheets.add("Mistake Log");
const settingsSheet = workbook.worksheets.add("Settings");

for (const sheet of workbook.worksheets.items) {
  sheet.showGridLines = false;
}

// Subjects
addTitle(subjectsSheet, "Subjects", "Toggle Include in Planning to FALSE when a subject should not affect planning totals.", "H");
const subjectHeaders = [["Subject ID", "Subject", "Category", "Target Grade", "Confidence 1-5", "Exam Priority", "Include in Planning", "Notes"]];
subjectsSheet.getRange("A4:H4").values = subjectHeaders;
subjectsSheet.getRange(`A5:H${4 + subjects.length}`).values = subjects;
styleHeader(subjectsSheet.getRange("A4:H4"));
addTable(subjectsSheet, `A4:H${4 + subjects.length}`, "SubjectsTable");
subjectsSheet.getRange(`E5:E${4 + subjects.length}`).format.numberFormat = "0";
subjectsSheet.getRange(`F5:F${4 + subjects.length}`).format.numberFormat = "0";
subjectsSheet.getRange(`G5:G${4 + subjects.length}`).dataValidation = { rule: { type: "list", values: ["TRUE", "FALSE"] } };
subjectsSheet.freezePanes.freezeRows(4);
setWidths(subjectsSheet, [16, 22, 18, 12, 14, 14, 18, 50]);

// Assessments
addTitle(assessmentsSheet, "Assessments & Countdown Source", "Add exams/deadlines here. Dashboard and calendar formulas use this sheet.", "N");
const assessmentHeaders = [["Assessment ID", "Assessment", "Date", "Time", "Subject ID", "Type", "TermWeek", "Semester", "Weighting", "Format", "Include", "Days From Today", "Status", "Countdown"]];
const assessmentRows = assessments.map((row) => [
  row[0],
  row[1],
  excelDate(row[2]),
  row[3],
  row[4],
  row[5],
  row[6],
  row[7],
  row[8],
  row[9],
  true,
  null,
  null,
  null
]);
assessmentsSheet.getRange("A4:N4").values = assessmentHeaders;
assessmentsSheet.getRange(`A5:N${4 + assessmentRows.length}`).values = assessmentRows;
for (let r = 5; r <= 200; r += 1) {
  assessmentsSheet.getRange(`L${r}`).formulas = [[`=IF(C${r}="","",C${r}-Dashboard!$B$4)`]];
  assessmentsSheet.getRange(`M${r}`).formulas = [[`=IF(C${r}="","",IF(C${r}<Dashboard!$B$4,"Done",IF(C${r}=Dashboard!$B$4,"Today","Upcoming")))`]];
  assessmentsSheet.getRange(`N${r}`).formulas = [[`=IF(L${r}="","",IF(L${r}<0,"Done","T-"&L${r}))`]];
}
styleHeader(assessmentsSheet.getRange("A4:N4"));
addTable(assessmentsSheet, "A4:N200", "AssessmentsTable");
assessmentsSheet.getRange("C5:C200").format.numberFormat = "yyyy-mm-dd";
assessmentsSheet.getRange("I5:I200").format.numberFormat = "0";
assessmentsSheet.getRange("L5:L200").format.numberFormat = "0";
assessmentsSheet.getRange("E5:E200").dataValidation = { rule: { type: "list", formula1: "Subjects!$A$5:$A$14" } };
assessmentsSheet.getRange("F5:F200").dataValidation = { rule: { type: "list", values: ["oral", "writing", "paper", "practical", "listening", "reading", "project"] } };
assessmentsSheet.getRange("H5:H200").dataValidation = { rule: { type: "list", values: ["Sem 1", "Sem 2"] } };
assessmentsSheet.getRange("K5:K200").dataValidation = { rule: { type: "list", values: ["TRUE", "FALSE"] } };
assessmentsSheet.freezePanes.freezeRows(4);
setWidths(assessmentsSheet, [24, 36, 13, 12, 14, 14, 12, 12, 10, 30, 10, 14, 12, 12]);

// Syllabus
addTitle(syllabusSheet, "Editable Syllabus Tracker", "Add any Math, English, Chinese, Science, Spanish, Geography, or INA topic as a new row.", "K");
const syllabusHeaders = [["Topic ID", "Subject ID", "Section", "Topic", "Tag", "Confidence 1-5", "Difficulty 1-5", "Accuracy %", "Done", "Next Action", "Notes"]];
const syllabusRows = buildSyllabusRows();
syllabusSheet.getRange("A4:K4").values = syllabusHeaders;
syllabusSheet.getRange(`A5:K${4 + syllabusRows.length}`).values = syllabusRows;
styleHeader(syllabusSheet.getRange("A4:K4"));
addTable(syllabusSheet, "A4:K300", "SyllabusTable");
syllabusSheet.getRange("B5:B300").dataValidation = { rule: { type: "list", formula1: "Subjects!$A$5:$A$14" } };
syllabusSheet.getRange("E5:E300").dataValidation = { rule: { type: "list", values: ["core", "enrich", "skill", "exam"] } };
syllabusSheet.getRange("F5:G300").dataValidation = { rule: { type: "whole", operator: "between", formula1: 1, formula2: 5 } };
syllabusSheet.getRange("I5:I300").dataValidation = { rule: { type: "list", values: ["TRUE", "FALSE"] } };
syllabusSheet.getRange("H5:H300").format.numberFormat = "0";
syllabusSheet.freezePanes.freezeRows(4);
setWidths(syllabusSheet, [15, 14, 28, 38, 10, 14, 14, 12, 10, 30, 40]);

// Dashboard
addTitle(dashboard, "ExamOS Spreadsheet Dashboard", "Private local-first exam tracker. Edit source tabs to update this workbook.", "H");
dashboard.getRange("A4:A10").values = [["Today"], ["Next Exam"], ["Next Date"], ["Days Left"], ["Remaining Assessments"], ["Sem 2 Assessments"], ["Active Subjects"]];
dashboard.getRange("B4").values = [[today]];
dashboard.getRange("B5").values = [[futureAssessments[0]?.row[1] ?? "No upcoming exams"]];
dashboard.getRange("B6").values = [[futureAssessments[0]?.date ?? null]];
dashboard.getRange("B7").formulas = [["=IF(B6=\"\",\"\",B6-B4)"]];
dashboard.getRange("B8").values = [[futureAssessments.length]];
dashboard.getRange("B9").values = [[assessments.filter((row) => row[7] === "Sem 2").length]];
dashboard.getRange("B10").values = [[subjects.filter((row) => row[6] === true).length]];
dashboard.getRange("B4:B10").format.numberFormat = [["yyyy-mm-dd"], ["@"], ["yyyy-mm-dd"], ["0"], ["0"], ["0"], ["0"]];
dashboard.getRange("A4:B10").format = {
  fill: "#F7F4ED",
  borders: { preset: "all", style: "thin", color: "#D8D2C4" },
  wrapText: true
};
dashboard.getRange("A4:A10").format.font.bold = true;
dashboard.getRange("D4:H4").values = [["Upcoming", "Date", "Subject", "Term", "Countdown"]];
styleHeader(dashboard.getRange("D4:H4"));
for (let i = 0; i < 12; i += 1) {
  const row = 5 + i;
  const item = futureAssessments[i];
  dashboard.getRange(`D${row}:H${row}`).values = [[
    item?.row[1] ?? "",
    item?.date ?? null,
    item?.row[4] ?? "",
    item?.row[6] ?? "",
    item ? `T-${Math.round((item.date.getTime() - today.getTime()) / 86400000)}` : ""
  ]];
}
dashboard.getRange("E5:E16").format.numberFormat = "yyyy-mm-dd";
dashboard.getRange("D4:H16").format.borders = { preset: "all", style: "thin", color: "#D8D2C4" };
dashboard.freezePanes.freezeRows(3);
setWidths(dashboard, [22, 24, 4, 36, 13, 16, 12, 12]);

// Calendar
addTitle(calendarSheet, "Calendar View", "Visual month blocks for all official Sem 2 assessments.", "H");
const months = [
  ["July 2026", 2026, 6],
  ["August 2026", 2026, 7],
  ["September 2026", 2026, 8],
  ["October 2026", 2026, 9],
  ["November 2026", 2026, 10]
];
let startRow = 4;
for (const [label, year, month] of months) {
  calendarSheet.getRange(`A${startRow}:G${startRow}`).merge();
  calendarSheet.getRange(`A${startRow}`).values = [[label]];
  calendarSheet.getRange(`A${startRow}:G${startRow}`).format = { fill: "#C1432E", font: { color: "#FFFFFF", bold: true } };
  calendarSheet.getRange(`A${startRow + 1}:G${startRow + 1}`).values = [["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]];
  styleHeader(calendarSheet.getRange(`A${startRow + 1}:G${startRow + 1}`));
  const first = new Date(year, month, 1);
  const firstDow = first.getDay() === 0 ? 7 : first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, () => "");
  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = new Date(year, month, d);
    const iso = date.toISOString().slice(0, 10);
    const dayEvents = assessments.filter((row) => row[2] === iso).map((row) => `${d} ${subjectName(row[4])}: ${row[1]}`);
    cells[firstDow - 1 + d - 1] = dayEvents.length ? dayEvents.join("\n") : String(d);
  }
  const matrix = [];
  for (let r = 0; r < 6; r += 1) matrix.push(cells.slice(r * 7, r * 7 + 7));
  calendarSheet.getRange(`A${startRow + 2}:G${startRow + 7}`).values = matrix;
  calendarSheet.getRange(`A${startRow + 2}:G${startRow + 7}`).format = {
    wrapText: true,
    borders: { preset: "all", style: "thin", color: "#D8D2C4" }
  };
  calendarSheet.getRange(`A${startRow + 2}:G${startRow + 7}`).format.rowHeight = 64;
  startRow += 10;
}
setWidths(calendarSheet, [24, 24, 24, 24, 24, 24, 24]);

// Weekly Planner
addTitle(plannerSheet, "Weekly Planner", "Editable planning grid. Add rows as needed; keep no more than 3 blocks on school days unless intentional.", "I");
plannerSheet.getRange("A4:I4").values = [["Date", "Day", "Block", "Subject ID", "Topic", "Minutes", "Priority", "Done", "Notes"]];
const planDates = dateRange("2026-07-01", 28);
const planRows = planDates.flatMap((date) => {
  const day = date.toLocaleDateString("en", { weekday: "short" });
  return [1, 2, 3].map((block) => [date, day, block, "", "", 35, "medium", false, ""]);
});
plannerSheet.getRange(`A5:I${4 + planRows.length}`).values = planRows;
styleHeader(plannerSheet.getRange("A4:I4"));
addTable(plannerSheet, "A4:I200", "PlannerTable");
plannerSheet.getRange("A5:A200").format.numberFormat = "yyyy-mm-dd";
plannerSheet.getRange("D5:D200").dataValidation = { rule: { type: "list", formula1: "Subjects!$A$5:$A$14" } };
plannerSheet.getRange("G5:G200").dataValidation = { rule: { type: "list", values: ["low", "medium", "high"] } };
plannerSheet.getRange("H5:H200").dataValidation = { rule: { type: "list", values: ["TRUE", "FALSE"] } };
plannerSheet.freezePanes.freezeRows(4);
setWidths(plannerSheet, [13, 10, 9, 14, 34, 10, 12, 10, 40]);

// Study Log
addTitle(studySheet, "Study Log", "Record sessions here. Dashboard summaries can be extended from this table.", "J");
studySheet.getRange("A4:J4").values = [["Date", "Subject ID", "Topic", "Session Type", "Minutes", "Focus 1-5", "Questions Attempted", "Questions Correct", "Accuracy", "Notes"]];
studySheet.getRange("A5:J5").values = [[today, "math1", "Partial Fractions", "practice", 40, 4, 12, 9, null, "Example row - edit or delete"]];
for (let r = 5; r <= 200; r += 1) {
  studySheet.getRange(`I${r}`).formulas = [[`=IF(G${r}=0,"",H${r}/G${r})`]];
}
styleHeader(studySheet.getRange("A4:J4"));
addTable(studySheet, "A4:J200", "StudyLogTable");
studySheet.getRange("A5:A200").format.numberFormat = "yyyy-mm-dd";
studySheet.getRange("I5:I200").format.numberFormat = "0%";
studySheet.getRange("B5:B200").dataValidation = { rule: { type: "list", formula1: "Subjects!$A$5:$A$14" } };
studySheet.getRange("D5:D200").dataValidation = { rule: { type: "list", values: ["learn", "revise", "practice", "past-paper", "oral", "writing", "mistake-review", "practical"] } };
studySheet.freezePanes.freezeRows(4);
setWidths(studySheet, [13, 14, 26, 16, 10, 12, 18, 16, 10, 44]);

// Mistake Log
addTitle(mistakesSheet, "Mistake Log", "Searchable bank of what needs attention. Mark Reviewed TRUE after redoing.", "J");
mistakesSheet.getRange("A4:J4").values = [["Date", "Subject ID", "Topic", "Source", "Question Ref", "Mistake Type", "What Went Wrong", "Correct Method", "Next Action", "Reviewed"]];
mistakesSheet.getRange("A5:J6").values = [
  [new Date(2026, 5, 28), "math1", "Binomial Theorem", "worksheet", "Q8", "careless", "Dropped negative sign", "Write general term before substituting", "Redo three sign-sensitive examples", false],
  [new Date(2026, 5, 26), "physics", "Current of Electricity", "quiz", "Q5", "concept-gap", "Mixed up potential difference and current", "Separate charge-flow definitions and units", "Make comparison table", false]
];
styleHeader(mistakesSheet.getRange("A4:J4"));
addTable(mistakesSheet, "A4:J200", "MistakeLogTable");
mistakesSheet.getRange("A5:A200").format.numberFormat = "yyyy-mm-dd";
mistakesSheet.getRange("B5:B200").dataValidation = { rule: { type: "list", formula1: "Subjects!$A$5:$A$14" } };
mistakesSheet.getRange("F5:F200").dataValidation = { rule: { type: "list", values: ["concept-gap", "careless", "misread-question", "weak-explanation", "calculation", "memory", "time-management", "language-expression", "experimental-skill"] } };
mistakesSheet.getRange("J5:J200").dataValidation = { rule: { type: "list", values: ["TRUE", "FALSE"] } };
mistakesSheet.freezePanes.freezeRows(4);
setWidths(mistakesSheet, [13, 14, 24, 16, 18, 20, 36, 36, 32, 12]);

// Settings
addTitle(settingsSheet, "How to Use This Workbook", "Keep source-of-truth data in Subjects, Assessments, and Syllabus.", "G");
settingsSheet.getRange("A4:C11").values = [
  ["Area", "How to edit", "What updates"],
  ["Subjects", "Set Include in Planning to FALSE for subjects you do not want counted.", "Dashboard active subject count and planning decisions."],
  ["Assessments", "Add rows with Date, Subject ID, TermWeek, Semester, Include=TRUE.", "Dashboard countdown and Calendar."],
  ["Syllabus", "Add any topic manually under a subject/section.", "Coverage tracking and planning reference."],
  ["Weekly Planner", "Type study blocks directly. Keep school days to 3 blocks by default.", "Your personal weekly plan."],
  ["Study Log", "Record completed sessions.", "Session totals and accuracy can be extended from this table."],
  ["Mistake Log", "Record errors and mark Reviewed TRUE after redoing.", "Mistake review workflow."],
  ["Hosting note", "Spreadsheet progress is stored in this file. Save it in OneDrive/iCloud/Google Drive for cross-device access.", "Persistent file-based tracking."]
];
styleHeader(settingsSheet.getRange("A4:C4"));
settingsSheet.getRange("A4:C12").format = {
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#D8D2C4" }
};
setWidths(settingsSheet, [22, 64, 50]);

// Final formatting pass
for (const sheet of workbook.worksheets.items) {
  const used = sheet.getUsedRange();
  if (used) {
    used.format.font.name = "Aptos";
    used.format.font.size = 10;
  }
}

await fs.mkdir(outputDir, { recursive: true });

const dashboardPreview = await workbook.render({ sheetName: "Dashboard", range: "A1:H16", scale: 1, format: "png" });
await fs.writeFile(path.join(outputDir, "dashboard-preview.png"), new Uint8Array(await dashboardPreview.arrayBuffer()));
const calendarPreview = await workbook.render({ sheetName: "Calendar", range: "A1:G53", scale: 1, format: "png" });
await fs.writeFile(path.join(outputDir, "calendar-preview.png"), new Uint8Array(await calendarPreview.arrayBuffer()));
const syllabusPreview = await workbook.render({ sheetName: "Syllabus", range: "A1:K24", scale: 1, format: "png" });
await fs.writeFile(path.join(outputDir, "syllabus-preview.png"), new Uint8Array(await syllabusPreview.arrayBuffer()));

const dashCheck = await workbook.inspect({
  kind: "table",
  range: "Dashboard!A1:H16",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 10
});
console.log(dashCheck.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan"
});
console.log(errors.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`Saved ${outputPath}`);
