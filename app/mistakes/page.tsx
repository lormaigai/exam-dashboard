"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MistakeForm } from "@/components/forms";
import { MistakeCard, PageHeader, Panel, StatCard } from "@/components/ui";
import { useExamData } from "@/lib/useExamData";

export default function MistakesPage() {
  const store = useExamData();
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [reviewedFilter, setReviewedFilter] = useState("all");
  if (!store) return <AppShell><div /></AppShell>;
  const { data } = store;
  const mistakes = data.mistakes
    .filter((mistake) => subjectFilter === "all" || mistake.subjectId === subjectFilter)
    .filter((mistake) => typeFilter === "all" || mistake.mistakeType === typeFilter)
    .filter((mistake) => reviewedFilter === "all" || String(mistake.reviewed) === reviewedFilter)
    .filter((mistake) => `${mistake.questionRef} ${mistake.whatWentWrong} ${mistake.nextAction}`.toLowerCase().includes(query.toLowerCase()));
  const typeCounts = data.mistakes.reduce<Record<string, number>>((acc, mistake) => {
    acc[mistake.mistakeType] = (acc[mistake.mistakeType] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell>
      <PageHeader title="Mistake Bank" description="Search, filter, review, edit, and delete mistakes without grade-shaming language." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total mistakes" value={data.mistakes.length} />
        <StatCard label="Needs attention" value={data.mistakes.filter((mistake) => !mistake.reviewed).length} />
        <StatCard label="Top cause" value={Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "None"} />
      </div>
      <Panel className="mt-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input className="rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Search mistakes" value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className="rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>
            <option value="all">All subjects</option>
            {data.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <select className="rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="all">All causes</option>
            {Array.from(new Set(data.mistakes.map((mistake) => mistake.mistakeType))).map((type) => <option key={type}>{type}</option>)}
          </select>
          <select className="rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={reviewedFilter} onChange={(event) => setReviewedFilter(event.target.value)}>
            <option value="all">All review states</option>
            <option value="false">Needs attention</option>
            <option value="true">Reviewed</option>
          </select>
        </div>
      </Panel>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-3 md:grid-cols-2">
          {mistakes.map((mistake) => (
            <MistakeCard
              key={mistake.id}
              mistake={mistake}
              subject={data.subjects.find((subject) => subject.id === mistake.subjectId)}
              topic={data.topics.find((topic) => topic.id === mistake.topicId)}
              onReview={() => store.updateMistake(mistake.id, { reviewed: !mistake.reviewed })}
              onEdit={() => {
                const nextAction = window.prompt("Next action", mistake.nextAction);
                if (nextAction) store.updateMistake(mistake.id, { nextAction });
              }}
              onDelete={() => store.deleteMistake(mistake.id)}
            />
          ))}
        </div>
        <Panel>
          <h3 className="mb-3 text-lg font-semibold">Add Mistake</h3>
          <MistakeForm subjects={data.subjects} topics={data.topics} onAdd={store.addMistake} />
        </Panel>
      </div>
    </AppShell>
  );
}
