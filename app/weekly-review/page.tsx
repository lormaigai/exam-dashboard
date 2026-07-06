"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Panel, StatCard } from "@/components/ui";
import { buildWeeklyReview } from "@/lib/summaries";
import { useExamData } from "@/lib/useExamData";

export default function WeeklyReviewPage() {
  const store = useExamData();
  const [reflection, setReflection] = useState("");
  if (!store) return <AppShell><div /></AppShell>;
  const { data } = store;
  const review = buildWeeklyReview(data, reflection);

  return (
    <AppShell>
      <PageHeader title="Weekly Review" description="A local summary of completed work, missed work, study balance, weakest topic, and next week focus." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total minutes" value={`${review.totalMinutes} min`} />
        <StatCard label="Completed tasks" value={review.completedTasks} />
        <StatCard label="Missed tasks" value={review.missedTasks} />
        <StatCard label="Next focus" value={review.nextWeekFocus} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_420px]">
        <Panel>
          <h3 className="mb-3 text-lg font-semibold">Auto Summary</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md bg-black/5 p-3 dark:bg-white/10">
              <p className="text-sm text-ink/60 dark:text-white/55">Most studied subject</p>
              <p className="font-medium">{review.strongestSubject}</p>
            </div>
            <div className="rounded-md bg-black/5 p-3 dark:bg-white/10">
              <p className="text-sm text-ink/60 dark:text-white/55">Needs attention</p>
              <p className="font-medium">{review.weakestSubject}</p>
            </div>
          </div>
          <h4 className="mb-2 mt-5 font-semibold">Subject Minutes</h4>
          <div className="grid gap-2 md:grid-cols-2">
            {data.subjects.map((subject) => (
              <div key={subject.id} className="flex justify-between rounded-md border border-black/10 p-3 text-sm dark:border-white/10">
                <span>{subject.name}</span>
                <span>{review.subjectMinutes[subject.id] ?? 0} min</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <h3 className="mb-3 text-lg font-semibold">Reflection</h3>
          <textarea
            className="min-h-[180px] w-full rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5"
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            placeholder="What worked, what needs attention, and what to adjust next week?"
          />
          <button className="focus-ring mt-3 w-full rounded-md bg-pine px-4 py-2 font-medium text-white" onClick={() => store.saveWeeklyReview(review)}>
            Save Weekly Review
          </button>
          <div className="mt-4 space-y-2">
            {data.weeklyReviews.map((item) => (
              <div key={item.weekStart} className="rounded-md border border-black/10 p-3 text-sm dark:border-white/10">
                <p className="font-medium">{item.weekStart}</p>
                <p className="text-ink/60 dark:text-white/55">{item.totalMinutes} min · focus {item.nextWeekFocus}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
