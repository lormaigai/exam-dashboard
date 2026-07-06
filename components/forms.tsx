"use client";

import { useState } from "react";
import { getNextReviewDate, todayISO } from "@/lib/date";
import type { Assessment, MistakeLog, StudySession, Subject, Task, Topic } from "@/lib/types";

const inputClass = "focus-ring w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5";

export function TaskForm({
  subjects,
  topics,
  onAdd
}: {
  subjects: Subject[];
  topics: Topic[];
  onAdd: (task: Omit<Task, "id">) => void;
}) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const subjectTopics = topics.filter((topic) => topic.subjectId === subjectId);

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onAdd({
          subjectId,
          topicId: String(form.get("topicId") || "") || undefined,
          title: String(form.get("title") || "Study block"),
          type: String(form.get("type") || "revise") as Task["type"],
          estimatedMinutes: Number(form.get("estimatedMinutes") || 30),
          dueDate: String(form.get("dueDate") || todayISO()),
          priority: String(form.get("priority") || "medium") as Task["priority"],
          completed: false
        });
        event.currentTarget.reset();
      }}
    >
      <input className={`${inputClass} md:col-span-2`} name="title" placeholder="Task title" required />
      <select className={inputClass} value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
        {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
      </select>
      <select className={inputClass} name="topicId">
        <option value="">No topic</option>
        {subjectTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
      </select>
      <select className={inputClass} name="type">
        {["learn", "revise", "practice", "past-paper", "oral", "writing", "mistake-review", "practical"].map((type) => <option key={type}>{type}</option>)}
      </select>
      <input className={inputClass} name="estimatedMinutes" type="number" min="10" step="5" defaultValue="30" />
      <input className={inputClass} name="dueDate" type="date" defaultValue={todayISO()} />
      <select className={inputClass} name="priority">
        {["low", "medium", "high"].map((priority) => <option key={priority}>{priority}</option>)}
      </select>
      <button className="focus-ring rounded-md bg-pine px-4 py-2 text-sm font-medium text-white md:col-span-2">Add task</button>
    </form>
  );
}

export function StudySessionForm({
  subjects,
  topics,
  onAdd
}: {
  subjects: Subject[];
  topics: Topic[];
  onAdd: (session: Omit<StudySession, "id">) => void;
}) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const subjectTopics = topics.filter((topic) => topic.subjectId === subjectId);

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const topicId = String(form.get("topicId") || "");
        onAdd({
          subjectId,
          topicIds: topicId ? [topicId] : [],
          date: String(form.get("date") || todayISO()),
          minutes: Number(form.get("minutes") || 30),
          sessionType: String(form.get("sessionType") || "review") as StudySession["sessionType"],
          focusRating: Number(form.get("focusRating") || 3),
          outcomeNotes: String(form.get("outcomeNotes") || ""),
          questionsAttempted: Number(form.get("questionsAttempted") || 0),
          questionsCorrect: Number(form.get("questionsCorrect") || 0)
        });
        event.currentTarget.reset();
      }}
    >
      <select className={inputClass} value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
        {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
      </select>
      <select className={inputClass} name="topicId">
        <option value="">No topic</option>
        {subjectTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
      </select>
      <input className={inputClass} name="date" type="date" defaultValue={todayISO()} />
      <input className={inputClass} name="minutes" type="number" min="5" step="5" defaultValue="30" />
      <select className={inputClass} name="sessionType">
        {["learn", "revise", "practice", "past-paper", "oral", "writing", "mistake-review", "practical", "review"].map((type) => <option key={type}>{type}</option>)}
      </select>
      <input className={inputClass} name="focusRating" type="number" min="1" max="5" defaultValue="3" />
      <input className={inputClass} name="questionsAttempted" type="number" min="0" defaultValue="0" />
      <input className={inputClass} name="questionsCorrect" type="number" min="0" defaultValue="0" />
      <textarea className={`${inputClass} md:col-span-2`} name="outcomeNotes" placeholder="Outcome notes" rows={3} />
      <button className="focus-ring rounded-md bg-pine px-4 py-2 text-sm font-medium text-white md:col-span-2">Add study session</button>
    </form>
  );
}

export function MistakeForm({
  subjects,
  topics,
  onAdd
}: {
  subjects: Subject[];
  topics: Topic[];
  onAdd: (mistake: Omit<MistakeLog, "id" | "createdAt" | "reviewed">) => void;
}) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const subjectTopics = topics.filter((topic) => topic.subjectId === subjectId);

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onAdd({
          subjectId,
          topicId: String(form.get("topicId") || subjectTopics[0]?.id || ""),
          source: String(form.get("source") || "other") as MistakeLog["source"],
          questionRef: String(form.get("questionRef") || ""),
          mistakeType: String(form.get("mistakeType") || "concept-gap") as MistakeLog["mistakeType"],
          whatWentWrong: String(form.get("whatWentWrong") || ""),
          correctMethod: String(form.get("correctMethod") || ""),
          nextAction: String(form.get("nextAction") || "")
        });
        event.currentTarget.reset();
      }}
    >
      <select className={inputClass} value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
        {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
      </select>
      <select className={inputClass} name="topicId" required>
        {subjectTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
      </select>
      <select className={inputClass} name="source">
        {["worksheet", "practice-paper", "quiz", "mock", "oral", "essay", "other"].map((source) => <option key={source}>{source}</option>)}
      </select>
      <select className={inputClass} name="mistakeType">
        {["concept-gap", "careless", "misread-question", "weak-explanation", "calculation", "memory", "time-management", "language-expression", "experimental-skill"].map((type) => <option key={type}>{type}</option>)}
      </select>
      <input className={`${inputClass} md:col-span-2`} name="questionRef" placeholder="Question reference" />
      <textarea className={`${inputClass} md:col-span-2`} name="whatWentWrong" placeholder="What needs attention?" rows={3} required />
      <textarea className={`${inputClass} md:col-span-2`} name="correctMethod" placeholder="Correct method" rows={3} />
      <input className={`${inputClass} md:col-span-2`} name="nextAction" placeholder="Next action" />
      <button className="focus-ring rounded-md bg-pine px-4 py-2 text-sm font-medium text-white md:col-span-2">Add mistake</button>
    </form>
  );
}

export function TopicForm({
  subject,
  onAdd
}: {
  subject: Subject;
  onAdd: (topic: Omit<Topic, "id">) => void;
}) {
  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const confidence = Number(form.get("confidence") || 3);
        onAdd({
          subjectId: subject.id,
          name: String(form.get("name") || "New syllabus item"),
          parentTopic: String(form.get("parentTopic") || "") || undefined,
          term: String(form.get("term") || "Y4"),
          applicableTo: subject.id === "math1" ? "Math1" : subject.id === "math2" ? "Math2" : undefined,
          confidence,
          difficulty: Number(form.get("difficulty") || 3),
          lastReviewed: undefined,
          nextReview: getNextReviewDate(confidence),
          practiceAccuracy: Number(form.get("practiceAccuracy") || 70),
          notes: String(form.get("notes") || "")
        });
        event.currentTarget.reset();
      }}
    >
      <input className={`${inputClass} md:col-span-2`} name="name" placeholder="Syllabus item / topic" required />
      <input className={inputClass} name="parentTopic" placeholder="Section, e.g. Algebra" />
      <input className={inputClass} name="term" placeholder="Term, e.g. T3/T4/Y4" defaultValue="Y4" />
      <input className={inputClass} name="confidence" type="number" min="1" max="5" defaultValue="3" />
      <input className={inputClass} name="difficulty" type="number" min="1" max="5" defaultValue="3" />
      <input className={inputClass} name="practiceAccuracy" type="number" min="0" max="100" defaultValue="70" />
      <textarea className={`${inputClass} md:col-span-2`} name="notes" rows={2} placeholder="Notes" />
      <button className="focus-ring rounded-md bg-pine px-4 py-2 text-sm font-medium text-white md:col-span-2">Add syllabus item</button>
    </form>
  );
}

export function AssessmentForm({
  subjects,
  defaultSubjectId,
  onAdd
}: {
  subjects: Subject[];
  defaultSubjectId?: string;
  onAdd: (assessment: Omit<Assessment, "id" | "status">) => void;
}) {
  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onAdd({
          subjectId: String(form.get("subjectId") || defaultSubjectId || subjects[0]?.id || ""),
          name: String(form.get("name") || "New assessment"),
          type: String(form.get("type") || "paper") as Assessment["type"],
          termWeek: String(form.get("termWeek") || "T4"),
          optionalDate: String(form.get("optionalDate") || "") || undefined,
          duration: String(form.get("duration") || "All day"),
          weighting: Number(form.get("weighting") || 0),
          format: String(form.get("format") || "Manually added assessment"),
          topics: [],
          skillsAssessed: []
        });
        event.currentTarget.reset();
      }}
    >
      <input className={`${inputClass} md:col-span-2`} name="name" placeholder="Exam / deadline name" required />
      <select className={inputClass} name="subjectId" defaultValue={defaultSubjectId ?? subjects[0]?.id}>
        {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
      </select>
      <select className={inputClass} name="type" defaultValue="paper">
        {["oral", "writing", "paper", "practical", "listening", "reading", "project"].map((type) => <option key={type}>{type}</option>)}
      </select>
      <input className={inputClass} name="optionalDate" type="date" required />
      <input className={inputClass} name="termWeek" placeholder="T4W1, T3W6, O-Level" defaultValue="T4" />
      <input className={inputClass} name="duration" placeholder="All day / 8:00 AM / 2h" defaultValue="All day" />
      <input className={inputClass} name="weighting" type="number" min="0" max="100" defaultValue="0" />
      <input className={inputClass} name="format" placeholder="Format / notes" />
      <button className="focus-ring rounded-md bg-pine px-4 py-2 text-sm font-medium text-white md:col-span-2">Add exam / date</button>
    </form>
  );
}
