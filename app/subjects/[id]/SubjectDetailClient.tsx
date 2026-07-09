"use client";

import { AppShell } from "@/components/AppShell";
import { AssessmentForm, MistakeForm, StudySessionForm, TaskForm, TopicForm } from "@/components/forms";
import { AssessmentBadge, ConfidenceSelector, EmptyState, MistakeCard, PageHeader, Panel, ProgressBar, TaskCard } from "@/components/ui";
import { rankTopic } from "@/lib/priority";
import { subjectProgress } from "@/lib/summaries";
import { useExamData } from "@/lib/useExamData";

export default function SubjectDetailClient({ subjectId }: { subjectId: string }) {
  const store = useExamData();
  if (!store) return <AppShell><div /></AppShell>;
  const { data } = store;
  const subject = data.subjects.find((item) => item.id === subjectId);
  if (!subject) return <AppShell><EmptyState title="Subject not found" detail="Choose a subject from the subjects page." /></AppShell>;
  const topics = data.topics.filter((topic) => topic.subjectId === subject.id);
  const assessments = data.assessments.filter((assessment) => assessment.subjectId === subject.id);
  const tasks = data.tasks.filter((task) => task.subjectId === subject.id);
  const sessions = data.sessions.filter((session) => session.subjectId === subject.id);
  const mistakes = data.mistakes.filter((mistake) => mistake.subjectId === subject.id);
  const nextActionTopic = [...topics].sort((a, b) => rankTopic({ topic: b, subject, assessments: data.assessments, mistakes: data.mistakes }).score - rankTopic({ topic: a, subject, assessments: data.assessments, mistakes: data.mistakes }).score)[0];

  return (
    <AppShell>
      <PageHeader title={subject.name} description={subject.notes} />
      <div className="grid gap-4 md:grid-cols-3">
        <Panel>
          <p className="text-sm text-ink/60 dark:text-white/55">Target grade</p>
          <p className="mt-2 text-3xl font-semibold">{subject.targetGrade}</p>
        </Panel>
        <Panel>
          <p className="mb-3 text-sm text-ink/60 dark:text-white/55">Subject confidence</p>
          <ConfidenceSelector value={subject.currentConfidence} onChange={(value) => store.updateSubject(subject.id, { currentConfidence: value })} />
        </Panel>
        <Panel>
          <ProgressBar value={subjectProgress(data, subject)} label="Overall progress" />
          <p className="mt-3 text-sm text-ink/60 dark:text-white/55">Next action: {nextActionTopic?.name ?? "Add topics"}</p>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <h3 className="mb-3 text-lg font-semibold">Assessment Timeline</h3>
          <div className="mb-4">
            <AssessmentForm subjects={[subject]} defaultSubjectId={subject.id} onAdd={store.addAssessment} />
          </div>
          <div className="space-y-3">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="space-y-2">
                <AssessmentBadge assessment={assessment} subject={subject} />
                <div className="flex gap-2">
                  <button
                    className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10"
                    onClick={() => {
                      const name = window.prompt("Assessment name", assessment.name);
                      if (name) store.updateAssessment(assessment.id, { name });
                    }}
                  >
                    Edit name
                  </button>
                  <button
                    className="focus-ring rounded-md border border-coral px-3 py-2 text-sm text-coral"
                    onClick={() => store.deleteAssessment(assessment.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <h3 className="mb-3 text-lg font-semibold">Topic Tree</h3>
          <div className="mb-4">
            <TopicForm subject={subject} onAdd={store.addTopic} />
          </div>
          <div className="space-y-3">
            {topics.map((topic) => (
              <div key={topic.id} className="rounded-md border border-black/10 p-3 dark:border-white/10">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{topic.name}</p>
                    <p className="text-sm text-ink/60 dark:text-white/55">{topic.parentTopic ?? "Core topic"} · accuracy {topic.practiceAccuracy}%</p>
                  </div>
                  <ConfidenceSelector value={topic.confidence} onChange={(value) => store.updateTopic(topic.id, { confidence: value })} />
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <ProgressBar value={topic.practiceAccuracy} label="Practice accuracy" />
                  <ProgressBar value={topic.difficulty * 20} label={`Difficulty ${topic.difficulty}/5`} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10"
                    onClick={() => {
                      const name = window.prompt("Topic name", topic.name);
                      if (name) store.updateTopic(topic.id, { name });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="focus-ring rounded-md border border-coral px-3 py-2 text-sm text-coral"
                    onClick={() => store.deleteTopic(topic.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="mb-3 text-lg font-semibold">Tasks</h3>
          <div className="mb-4">
            <TaskForm subjects={[subject]} topics={topics} onAdd={store.addTask} />
          </div>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                subject={subject}
                topic={topics.find((topic) => topic.id === task.topicId)}
                onComplete={() => store.updateTask(task.id, { completed: !task.completed })}
                onEdit={() => {
                  const title = window.prompt("Task title", task.title);
                  if (title) store.updateTask(task.id, { title });
                }}
                onDelete={() => store.deleteTask(task.id)}
              />
            ))}
          </div>
        </Panel>
        <Panel>
          <h3 className="mb-3 text-lg font-semibold">Study Sessions</h3>
          <StudySessionForm subjects={[subject]} topics={topics} onAdd={store.addSession} />
          <div className="mt-4 space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-md bg-black/5 p-3 text-sm dark:bg-white/10">
                {session.date} · {session.minutes} min · {session.sessionType} · focus {session.focusRating}/5
                <button className="ml-3 text-coral" onClick={() => store.deleteSession(session.id)}>Delete</button>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="mt-6">
        <h3 className="mb-3 text-lg font-semibold">Mistake Logs</h3>
        <div className="mb-4">
          <MistakeForm subjects={[subject]} topics={topics} onAdd={store.addMistake} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {mistakes.map((mistake) => (
            <MistakeCard
              key={mistake.id}
              mistake={mistake}
              subject={subject}
              topic={topics.find((topic) => topic.id === mistake.topicId)}
              onReview={() => store.updateMistake(mistake.id, { reviewed: !mistake.reviewed })}
              onEdit={() => {
                const nextAction = window.prompt("Next action", mistake.nextAction);
                if (nextAction) store.updateMistake(mistake.id, { nextAction });
              }}
              onDelete={() => store.deleteMistake(mistake.id)}
            />
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
