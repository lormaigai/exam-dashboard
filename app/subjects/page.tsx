"use client";

import { AppShell } from "@/components/AppShell";
import { PageHeader, SubjectCard } from "@/components/ui";
import { subjectMinutesThisWeek, subjectProgress } from "@/lib/summaries";
import { useExamData } from "@/lib/useExamData";

export default function SubjectsPage() {
  const store = useExamData();
  if (!store) return <AppShell><div /></AppShell>;
  const { data } = store;

  return (
    <AppShell>
      <PageHeader title="Subjects" description="Confidence, recent study time, topic progress, and upcoming assessment load." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.subjects.map((subject) => (
          <div key={subject.id} className="space-y-2">
            <SubjectCard
              subject={subject}
              progress={subjectProgress(data, subject)}
              minutes={subjectMinutesThisWeek(data, subject.id)}
              upcomingCount={data.assessments.filter((assessment) => assessment.subjectId === subject.id && assessment.status !== "completed").length}
            />
            <button
              className={`focus-ring w-full rounded-md border px-3 py-2 text-sm ${
                subject.includeInPlanning === false
                  ? "border-coral text-coral"
                  : "border-pine bg-pine text-white"
              }`}
              onClick={() => store.updateSubject(subject.id, { includeInPlanning: subject.includeInPlanning === false })}
            >
              {subject.includeInPlanning === false ? "Excluded from planning/timeline" : "Included in planning/timeline"}
            </button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
