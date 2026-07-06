"use client";

import { AppShell } from "@/components/AppShell";
import { StudySessionForm } from "@/components/forms";
import { PageHeader, Panel, ProgressBar, StatCard } from "@/components/ui";
import { totalMinutesThisWeek } from "@/lib/summaries";
import { useExamData } from "@/lib/useExamData";

export default function SessionsPage() {
  const store = useExamData();
  if (!store) return <AppShell><div /></AppShell>;
  const { data } = store;
  const minutesBySubject = data.subjects.map((subject) => ({
    subject,
    minutes: data.sessions.filter((session) => session.subjectId === subject.id).reduce((sum, session) => sum + session.minutes, 0)
  }));
  const maxMinutes = Math.max(1, ...minutesBySubject.map((item) => item.minutes));
  const typeCounts = data.sessions.reduce<Record<string, number>>((acc, session) => {
    acc[session.sessionType] = (acc[session.sessionType] ?? 0) + 1;
    return acc;
  }, {});
  const avgFocus = data.sessions.length ? (data.sessions.reduce((sum, session) => sum + session.focusRating, 0) / data.sessions.length).toFixed(1) : "0";
  const totalAttempted = data.sessions.reduce((sum, session) => sum + session.questionsAttempted, 0);
  const totalCorrect = data.sessions.reduce((sum, session) => sum + session.questionsCorrect, 0);

  return (
    <AppShell>
      <PageHeader title="Study Sessions" description="Log sessions and review minutes by subject, session type distribution, accuracy, and focus trend." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="This week" value={`${totalMinutesThisWeek(data)} min`} />
        <StatCard label="All sessions" value={data.sessions.length} />
        <StatCard label="Average focus" value={`${avgFocus}/5`} />
        <StatCard label="Accuracy" value={totalAttempted ? `${Math.round((totalCorrect / totalAttempted) * 100)}%` : "No data"} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Panel>
            <h3 className="mb-3 text-lg font-semibold">Minutes by Subject</h3>
            <div className="space-y-3">
              {minutesBySubject.map(({ subject, minutes }) => (
                <div key={subject.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{subject.name}</span>
                    <span>{minutes} min</span>
                  </div>
                  <ProgressBar value={(minutes / maxMinutes) * 100} />
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <h3 className="mb-3 text-lg font-semibold">Session Type Distribution</h3>
            <div className="grid gap-2 md:grid-cols-3">
              {Object.entries(typeCounts).map(([type, count]) => (
                <div key={type} className="rounded-md bg-black/5 p-3 dark:bg-white/10">
                  <p className="font-medium">{type}</p>
                  <p className="text-sm text-ink/60 dark:text-white/55">{count} sessions</p>
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <h3 className="mb-3 text-lg font-semibold">Session Log</h3>
            <div className="space-y-2">
              {data.sessions.map((session) => (
                <div key={session.id} className="rounded-md border border-black/10 p-3 text-sm dark:border-white/10">
                  <p className="font-medium">{data.subjects.find((subject) => subject.id === session.subjectId)?.name} · {session.sessionType}</p>
                  <p className="text-ink/60 dark:text-white/55">{session.date} · {session.minutes} min · focus {session.focusRating}/5 · {session.questionsCorrect}/{session.questionsAttempted}</p>
                  <button className="mt-2 text-coral" onClick={() => store.deleteSession(session.id)}>Delete</button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <Panel>
          <h3 className="mb-3 text-lg font-semibold">Add Study Session</h3>
          <StudySessionForm subjects={data.subjects} topics={data.topics} onAdd={store.addSession} />
        </Panel>
      </div>
    </AppShell>
  );
}
