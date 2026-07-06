"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Panel } from "@/components/ui";
import { daysBetween, todayISO } from "@/lib/date";
import { isSubjectIncluded } from "@/lib/subjectFilters";
import { getTermInfo, isInTimelineScope, type TimelineScope } from "@/lib/terms";
import type { Assessment } from "@/lib/types";
import { useExamData } from "@/lib/useExamData";

const scopes: Array<{ id: TimelineScope; label: string }> = [
  { id: "sem2", label: "Sem 2" },
  { id: "t3", label: "T3" },
  { id: "t4", label: "T4" },
  { id: "olevel", label: "O-Level / Prelim" },
  { id: "all", label: "All" }
];

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthKey(date: string) {
  return date.slice(0, 7);
}

function monthTitle(key: string) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(`${key}-01T12:00:00`));
}

function calendarDaysForMonth(key: string) {
  const first = new Date(`${key}-01T12:00:00`);
  const firstDay = first.getDay() === 0 ? 7 : first.getDay();
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const leading = Array.from({ length: firstDay - 1 }, () => "");
  const days = Array.from({ length: daysInMonth }, (_, index) => `${key}-${String(index + 1).padStart(2, "0")}`);
  return [...leading, ...days];
}

function sortAssessments(a: Assessment, b: Assessment) {
  const aInfo = getTermInfo(a);
  const bInfo = getTermInfo(b);
  if (aInfo.sortKey !== bInfo.sortKey) return aInfo.sortKey - bInfo.sortKey;
  return (a.optionalDate ?? "9999-99-99").localeCompare(b.optionalDate ?? "9999-99-99");
}

export default function TimelinePage() {
  const store = useExamData();
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [scope, setScope] = useState<TimelineScope>("sem2");
  const [showExcluded, setShowExcluded] = useState(false);
  if (!store) return <AppShell><div /></AppShell>;
  const { data } = store;

  const selectableSubjects = data.subjects.filter((subject) => showExcluded || isSubjectIncluded(subject));
  const assessments = data.assessments
    .filter((assessment) => {
      const subject = data.subjects.find((item) => item.id === assessment.subjectId);
      return showExcluded || isSubjectIncluded(subject);
    })
    .filter((assessment) => subjectFilter === "all" || assessment.subjectId === subjectFilter)
    .filter((assessment) => typeFilter === "all" || assessment.type === typeFilter)
    .filter((assessment) => isInTimelineScope(assessment, scope))
    .sort(sortAssessments);

  const datedAssessments = assessments.filter((assessment) => assessment.optionalDate);
  const undatedAssessments = assessments.filter((assessment) => !assessment.optionalDate);
  const monthKeys = Array.from(new Set(datedAssessments.map((assessment) => monthKey(assessment.optionalDate!)))).sort();
  const groupedTerms = assessments.reduce<Record<string, Assessment[]>>((acc, assessment) => {
    const label = getTermInfo(assessment).label;
    acc[label] = [...(acc[label] ?? []), assessment];
    return acc;
  }, {});

  return (
    <AppShell>
      <PageHeader
        title="Assessment Calendar"
        description="Sem 2 groups T3, T4, prelims, O-Levels, and EYA/EOY-style exams. Term codes like T4W1 mean Term 4, Week 1."
      />
      <Panel className="mb-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {scopes.map((item) => (
            <button
              key={item.id}
              className={`focus-ring rounded-md px-3 py-2 text-sm ${
                scope === item.id ? "bg-pine text-white" : "border border-black/10 bg-white dark:border-white/10 dark:bg-white/5"
              }`}
              onClick={() => setScope(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <select className="rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>
            <option value="all">All active subjects</option>
            {selectableSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <select className="rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="all">All assessment types</option>
            {Array.from(new Set(data.assessments.map((assessment) => assessment.type))).map((type) => <option key={type}>{type}</option>)}
          </select>
          <label className="flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10">
            <input type="checkbox" checked={showExcluded} onChange={(event) => setShowExcluded(event.target.checked)} />
            Show excluded
          </label>
        </div>
      </Panel>

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(groupedTerms).map(([label, items]) => (
          <Panel key={label}>
            <p className="text-sm text-ink/55 dark:text-white/50">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{items.length}</p>
            <p className="text-sm text-ink/60 dark:text-white/55">assessment{items.length === 1 ? "" : "s"}</p>
          </Panel>
        ))}
      </div>

      <div className="space-y-6">
        {monthKeys.map((key) => {
          const cells = calendarDaysForMonth(key);
          return (
            <Panel key={key}>
              <h3 className="mb-3 text-lg font-semibold">{monthTitle(key)}</h3>
              <div className="grid grid-cols-7 gap-2 text-center text-xs text-ink/50 dark:text-white/45">
                {weekdayLabels.map((day) => <div key={day}>{day}</div>)}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-2">
                {cells.map((date, index) => {
                  const dayAssessments = date ? datedAssessments.filter((assessment) => assessment.optionalDate === date) : [];
                  return (
                    <div key={`${key}-${index}`} className="min-h-[118px] rounded-md border border-black/10 bg-black/[0.02] p-2 dark:border-white/10 dark:bg-white/[0.03]">
                      {date ? <p className="mb-2 text-xs font-medium text-ink/60 dark:text-white/55">{Number(date.slice(-2))}</p> : null}
                      <div className="space-y-2">
                        {dayAssessments.map((assessment) => {
                          const subject = data.subjects.find((item) => item.id === assessment.subjectId);
                          const term = getTermInfo(assessment);
                          const countdown = assessment.optionalDate ? Math.max(0, daysBetween(todayISO(), assessment.optionalDate)) : undefined;
                          return (
                            <div key={assessment.id} className="rounded-md bg-white p-2 text-left text-xs shadow-sm dark:bg-[#18211f]">
                              <div className="mb-1 h-1 rounded-full" style={{ backgroundColor: subject?.colorToken ?? "#1f6f68" }} />
                              <p className="font-medium leading-snug">{assessment.name}</p>
                              <p className="text-ink/60 dark:text-white/55">{subject?.name} · {term.label}</p>
                              <p className="text-ink/60 dark:text-white/55">{countdown}d · {assessment.weighting}%</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </div>

      {undatedAssessments.length ? (
        <Panel className="mt-6">
          <h3 className="mb-3 text-lg font-semibold">Flexible Dates</h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {undatedAssessments.map((assessment) => {
              const subject = data.subjects.find((item) => item.id === assessment.subjectId);
              const term = getTermInfo(assessment);
              return (
                <div key={assessment.id} className="rounded-md border border-black/10 p-3 dark:border-white/10">
                  <p className="font-medium">{assessment.name}</p>
                  <p className="text-sm text-ink/60 dark:text-white/55">{subject?.name} · {term.label} · {assessment.type}</p>
                </div>
              );
            })}
          </div>
        </Panel>
      ) : null}
    </AppShell>
  );
}
