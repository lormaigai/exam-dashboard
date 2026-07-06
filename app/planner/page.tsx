"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Panel } from "@/components/ui";
import { startOfWeekISO, weekDates } from "@/lib/date";
import { generateWeeklyPlan } from "@/lib/planner";
import type { PlannedBlock } from "@/lib/types";
import { useExamData } from "@/lib/useExamData";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function PlannerPage() {
  const store = useExamData();
  const [plan, setPlan] = useState<PlannedBlock[]>([]);
  if (!store) return <AppShell><div /></AppShell>;
  const { data } = store;
  const dates = weekDates(startOfWeekISO());

  return (
    <AppShell>
      <PageHeader title="Weekly Planner" description="Generate a balanced rule-based plan using assessment urgency, confidence, accuracy, review age, mistakes, and difficulty." />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Panel>
          <h3 className="mb-3 text-lg font-semibold">Constraints</h3>
          <div className="space-y-3">
            <label className="block text-sm">
              Weekday minutes
              <input className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" type="number" value={data.settings.planner.weekdayMinutes} onChange={(event) => store.updatePlannerSettings({ weekdayMinutes: Number(event.target.value) })} />
            </label>
            <label className="block text-sm">
              Weekend minutes
              <input className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" type="number" value={data.settings.planner.weekendMinutes} onChange={(event) => store.updatePlannerSettings({ weekendMinutes: Number(event.target.value) })} />
            </label>
            <label className="block text-sm">
              Rest day
              <select className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={data.settings.planner.restDay} onChange={(event) => store.updatePlannerSettings({ restDay: event.target.value })}>
                {days.map((day) => <option key={day}>{day}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              Max blocks per day
              <input className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" type="number" min="1" max="5" value={data.settings.planner.maxBlocksPerDay} onChange={(event) => store.updatePlannerSettings({ maxBlocksPerDay: Number(event.target.value) })} />
            </label>
            <button className="focus-ring w-full rounded-md bg-pine px-4 py-2 font-medium text-white" onClick={() => setPlan(generateWeeklyPlan(data))}>
              Generate Weekly Plan
            </button>
            <button
              className="focus-ring w-full rounded-md border border-black/10 px-4 py-2 text-sm dark:border-white/10"
              onClick={() => {
                plan.forEach((block) => {
                  store.addTask({
                    subjectId: block.subjectId,
                    topicId: block.topicId,
                    title: block.title,
                    type: block.type,
                    estimatedMinutes: block.minutes,
                    dueDate: block.date,
                    priority: block.priorityScore > 75 ? "high" : "medium",
                    completed: false
                  });
                });
              }}
              disabled={!plan.length}
            >
              Save plan as tasks
            </button>
          </div>
        </Panel>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {dates.map((date, index) => {
            const dayPlan = plan.filter((block) => block.date === date);
            return (
              <Panel key={date} className="min-h-[260px]">
                <p className="font-semibold">{days[index]}</p>
                <p className="mb-3 text-xs text-ink/55 dark:text-white/50">{date}</p>
                {dayPlan.length ? (
                  <div className="space-y-2">
                    {dayPlan.map((block) => {
                      const subject = data.subjects.find((item) => item.id === block.subjectId);
                      return (
                        <div key={block.id} className="rounded-md border border-black/10 p-2 text-sm dark:border-white/10">
                          <div className="mb-2 h-1 rounded-full" style={{ backgroundColor: subject?.colorToken }} />
                          <p className="font-medium">{block.title}</p>
                          <p className="text-ink/60 dark:text-white/55">{block.minutes} min · {block.type}</p>
                          <p className="text-ink/50 dark:text-white/45">Priority {block.priorityScore}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-ink/50 dark:text-white/45">{data.settings.planner.restDay === days[index] ? "Rest day" : "Generate plan"}</p>
                )}
              </Panel>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
