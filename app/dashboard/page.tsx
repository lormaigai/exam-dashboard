"use client";

import { AppShell } from "@/components/AppShell";
import { MistakeForm, StudySessionForm, TaskForm } from "@/components/forms";
import { CountdownCard, EmptyState, PageHeader, Panel, StatCard, SubjectCard, TaskCard } from "@/components/ui";
import { todayISO } from "@/lib/date";
import { getRankedTopics } from "@/lib/priority";
import { getPlanningData } from "@/lib/subjectFilters";
import { overdueTopics, recommendedTasks, subjectMinutesThisWeek, subjectProgress, totalMinutesThisWeek, upcomingAssessments } from "@/lib/summaries";
import { useExamData } from "@/lib/useExamData";

export default function DashboardPage() {
  const store = useExamData();
  if (!store) return <AppShell><div /></AppShell>;
  const { data } = store;
  const planningData = getPlanningData(data);
  const nextAssessments = upcomingAssessments(data).slice(0, 5);
  const ranked = getRankedTopics(planningData).slice(0, 6);
  const overdue = overdueTopics(data).slice(0, 5);
  const tasks = recommendedTasks(data.tasks, data).slice(0, 5);

  return (
    <AppShell>
      <PageHeader title="Dashboard" description="Today’s plan, progress signals, and quick capture for sessions and mistakes." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Study this week" value={`${totalMinutesThisWeek(data)} min`} detail="Local session log" />
        <StatCard label="Open tasks" value={data.tasks.filter((task) => !task.completed).length} detail="Across all subjects" />
        <StatCard label="Needs attention" value={data.mistakes.filter((mistake) => !mistake.reviewed).length} detail="Unreviewed mistakes" />
        <StatCard label="Today" value={todayISO()} detail="Local planning date" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <h3 className="mb-3 text-lg font-semibold">Recommended Tasks</h3>
          <div className="space-y-3">
            {tasks.length ? tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                subject={data.subjects.find((subject) => subject.id === task.subjectId)}
                topic={data.topics.find((topic) => topic.id === task.topicId)}
                onComplete={() => store.updateTask(task.id, { completed: !task.completed })}
                onEdit={() => {
                  const title = window.prompt("Task title", task.title);
                  if (title) store.updateTask(task.id, { title });
                }}
                onDelete={() => store.deleteTask(task.id)}
              />
            )) : <EmptyState title="No open tasks" detail="Add a task or generate a weekly plan." />}
          </div>
        </Panel>
        <Panel>
          <h3 className="mb-3 text-lg font-semibold">Quick Add Task</h3>
          <TaskForm subjects={data.subjects} topics={data.topics} onAdd={store.addTask} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.subjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            progress={subjectProgress(data, subject)}
            minutes={subjectMinutesThisWeek(data, subject.id)}
            upcomingCount={data.assessments.filter((assessment) => assessment.subjectId === subject.id && assessment.status !== "completed").length}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h3 className="mb-3 text-lg font-semibold">Next 5 Assessments</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {nextAssessments.map((assessment) => (
              <CountdownCard key={assessment.id} assessment={assessment} subject={data.subjects.find((subject) => subject.id === assessment.subjectId)} />
            ))}
          </div>
        </Panel>
        <Panel>
          <h3 className="mb-3 text-lg font-semibold">Weak Topics</h3>
          <div className="space-y-3">
            {ranked.map(({ topic, subject, priority }) => (
              <div key={topic.id} className="rounded-md border border-black/10 p-3 dark:border-white/10">
                <p className="font-medium">{topic.name}</p>
                <p className="text-sm text-ink/60 dark:text-white/55">{subject.name} · score {priority.score}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel>
          <h3 className="mb-3 text-lg font-semibold">Overdue Reviews</h3>
          <div className="space-y-2">
            {overdue.length ? overdue.map((topic) => (
              <div key={topic.id} className="rounded-md bg-black/5 p-3 text-sm dark:bg-white/10">
                {data.subjects.find((subject) => subject.id === topic.subjectId)?.name}: {topic.name}
              </div>
            )) : <EmptyState title="Reviews are current" detail="Next reviews will appear here." />}
          </div>
        </Panel>
        <Panel>
          <h3 className="mb-3 text-lg font-semibold">Quick Add Study Session</h3>
          <StudySessionForm subjects={data.subjects} topics={data.topics} onAdd={store.addSession} />
        </Panel>
        <Panel>
          <h3 className="mb-3 text-lg font-semibold">Quick Add Mistake</h3>
          <MistakeForm subjects={data.subjects} topics={data.topics} onAdd={store.addMistake} />
        </Panel>
      </div>
    </AppShell>
  );
}
