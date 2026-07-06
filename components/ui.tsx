"use client";

import Link from "next/link";
import { AlertCircle, Check, Pencil, Trash2 } from "lucide-react";
import { daysBetween, formatShortDate, todayISO } from "@/lib/date";
import type { Assessment, MistakeLog, Subject, Task, Topic } from "@/lib/types";

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-1 max-w-3xl text-sm text-ink/65 dark:text-white/60">{description}</p>
    </div>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-black/10 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/5 ${className}`}>
      {children}
    </section>
  );
}

export function StatCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <Panel>
      <p className="text-xs uppercase tracking-wide text-ink/50 dark:text-white/45">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-sm text-ink/60 dark:text-white/55">{detail}</p> : null}
    </Panel>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label ? <div className="mb-1 text-xs text-ink/60 dark:text-white/55">{label}</div> : null}
      <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div className="h-full rounded-full bg-pine" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function ConfidenceSelector({
  value,
  onChange
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-1" aria-label="Confidence selector">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          className={`focus-ring h-8 w-8 rounded-md border text-sm ${
            rating <= value
              ? "border-pine bg-pine text-white"
              : "border-black/10 bg-white text-ink/60 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
          }`}
          onClick={() => onChange(rating)}
          title={`Set confidence to ${rating}`}
        >
          {rating}
        </button>
      ))}
    </div>
  );
}

export function AssessmentBadge({ assessment, subject }: { assessment: Assessment; subject?: Subject }) {
  return (
    <div className="rounded-md border border-black/10 p-3 dark:border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{assessment.name}</p>
          <p className="text-sm text-ink/60 dark:text-white/55">
            {subject?.name ?? "Subject"} · {assessment.termWeek} · {assessment.duration}
          </p>
        </div>
        <span className="rounded-full px-2 py-1 text-xs text-white" style={{ backgroundColor: subject?.colorToken ?? "#1f6f68" }}>
          {assessment.weighting}%</span>
      </div>
      <p className="mt-2 text-sm text-ink/70 dark:text-white/65">{assessment.format}</p>
    </div>
  );
}

export function CountdownCard({ assessment, subject }: { assessment: Assessment; subject?: Subject }) {
  const days = assessment.optionalDate ? daysBetween(todayISO(), assessment.optionalDate) : undefined;
  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-ink/55 dark:text-white/50">{subject?.name}</p>
          <h3 className="font-semibold">{assessment.name}</h3>
        </div>
        <span className="rounded-full bg-black/5 px-2 py-1 text-xs dark:bg-white/10">{assessment.type}</span>
      </div>
      <p className="mt-4 text-3xl font-semibold">{days === undefined ? "Flexible" : `${Math.max(0, days)}d`}</p>
      <p className="text-sm text-ink/60 dark:text-white/55">{formatShortDate(assessment.optionalDate)} · {assessment.weighting}%</p>
    </Panel>
  );
}

export function SubjectCard({
  subject,
  progress,
  minutes,
  upcomingCount
}: {
  subject: Subject;
  progress: number;
  minutes: number;
  upcomingCount: number;
}) {
  return (
    <Link href={`/subjects/${subject.id}`} className="block rounded-lg border border-black/10 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink/55 dark:text-white/50">{subject.category}</p>
          <h3 className="text-lg font-semibold">{subject.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          {subject.includeInPlanning === false ? (
            <span className="rounded-full bg-black/5 px-2 py-1 text-xs text-ink/55 dark:bg-white/10 dark:text-white/55">
              excluded
            </span>
          ) : null}
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.colorToken }} />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <ProgressBar value={progress} label={`Confidence ${subject.currentConfidence}/5`} />
        <div className="flex justify-between text-sm text-ink/60 dark:text-white/55">
          <span>{minutes} min this week</span>
          <span>{upcomingCount} upcoming</span>
        </div>
      </div>
    </Link>
  );
}

export function TaskCard({
  task,
  subject,
  topic,
  onComplete,
  onEdit,
  onDelete
}: {
  task: Task;
  subject?: Subject;
  topic?: Topic;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`rounded-md border p-3 ${task.completed ? "border-pine/30 bg-pine/5" : "border-black/10 dark:border-white/10"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{task.title}</p>
          <p className="text-sm text-ink/60 dark:text-white/55">
            {subject?.name} {topic ? `· ${topic.name}` : ""} · {task.estimatedMinutes} min · due {formatShortDate(task.dueDate)}
          </p>
        </div>
        <span className="rounded-full bg-black/5 px-2 py-1 text-xs dark:bg-white/10">{task.priority}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="focus-ring rounded-md bg-pine px-3 py-2 text-sm text-white" onClick={onComplete}>
          <Check className="mr-1 inline h-4 w-4" />
          {task.completed ? "Reopen" : "Complete"}
        </button>
        <button className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10" onClick={onEdit}>
          <Pencil className="mr-1 inline h-4 w-4" />
          Edit
        </button>
        <button className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10" onClick={onDelete}>
          <Trash2 className="mr-1 inline h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
}

export function MistakeCard({
  mistake,
  subject,
  topic,
  onReview,
  onEdit,
  onDelete
}: {
  mistake: MistakeLog;
  subject?: Subject;
  topic?: Topic;
  onReview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-md border border-black/10 p-3 dark:border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{mistake.questionRef || "Mistake entry"}</p>
          <p className="text-sm text-ink/60 dark:text-white/55">
            {subject?.name} · {topic?.name} · {mistake.mistakeType}
          </p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs ${mistake.reviewed ? "bg-pine/15 text-pine" : "bg-coral/15 text-coral"}`}>
          {mistake.reviewed ? "reviewed" : "needs attention"}
        </span>
      </div>
      <p className="mt-2 text-sm text-ink/70 dark:text-white/65">{mistake.whatWentWrong}</p>
      <p className="mt-1 text-sm text-ink/60 dark:text-white/55">Next: {mistake.nextAction}</p>
      <div className="mt-3 flex gap-2">
        <button className="focus-ring rounded-md bg-pine px-3 py-2 text-sm text-white" onClick={onReview}>
          Review mistake
        </button>
        <button className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10" onClick={onEdit}>Edit</button>
        <button className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-md border border-dashed border-black/20 p-6 text-center dark:border-white/20">
      <AlertCircle className="mx-auto h-6 w-6 text-ink/45 dark:text-white/45" />
      <p className="mt-2 font-medium">{title}</p>
      <p className="mt-1 text-sm text-ink/60 dark:text-white/55">{detail}</p>
    </div>
  );
}
