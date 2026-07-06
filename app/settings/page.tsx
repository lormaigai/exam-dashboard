"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AssessmentForm } from "@/components/forms";
import { PageHeader, Panel } from "@/components/ui";
import { useExamData } from "@/lib/useExamData";

export default function SettingsPage() {
  const store = useExamData();
  const [backupText, setBackupText] = useState("");
  const [message, setMessage] = useState("");
  if (!store) return <AppShell><div /></AppShell>;
  const activeStore = store;
  const { data } = activeStore;

  function exportJson() {
    const value = JSON.stringify(data, null, 2);
    setBackupText(value);
    const blob = new Blob([value], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `examos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Export ready and downloaded.");
  }

  function importJson() {
    try {
      activeStore.importBackup(backupText);
      setMessage("Import complete.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import failed.");
    }
  }

  return (
    <AppShell>
      <PageHeader title="Settings" description="Edit subjects, assessment dates and weights, export or import JSON, and reset the local demo data." />
      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <Panel>
            <h3 className="mb-3 text-lg font-semibold">Subjects</h3>
            <div className="space-y-3">
              {data.subjects.map((subject) => (
                <div key={subject.id} className="grid gap-2 rounded-md border border-black/10 p-3 md:grid-cols-[1fr_90px_90px] dark:border-white/10">
                  <input className="rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={subject.name} onChange={(event) => activeStore.updateSubject(subject.id, { name: event.target.value })} />
                  <input className="rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={subject.targetGrade} onChange={(event) => activeStore.updateSubject(subject.id, { targetGrade: event.target.value })} />
                  <input className="rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" type="number" min="1" max="5" value={subject.currentConfidence} onChange={(event) => activeStore.updateSubject(subject.id, { currentConfidence: Number(event.target.value) })} />
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <h3 className="mb-3 text-lg font-semibold">Assessment Dates and Weights</h3>
            <div className="mb-4 rounded-md border border-black/10 p-3 dark:border-white/10">
              <h4 className="mb-3 font-medium">Add Exam or Deadline</h4>
              <AssessmentForm subjects={data.subjects} onAdd={activeStore.addAssessment} />
            </div>
            <div className="space-y-3">
              {data.assessments.map((assessment) => (
                <div key={assessment.id} className="grid gap-2 rounded-md border border-black/10 p-3 md:grid-cols-[1fr_150px_90px_90px] dark:border-white/10">
                  <div>
                    <p className="font-medium">{assessment.name}</p>
                    <p className="text-sm text-ink/60 dark:text-white/55">{data.subjects.find((subject) => subject.id === assessment.subjectId)?.name} · {assessment.type}</p>
                  </div>
                  <input className="rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" type="date" value={assessment.optionalDate ?? ""} onChange={(event) => activeStore.updateAssessment(assessment.id, { optionalDate: event.target.value || undefined })} />
                  <input className="rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" type="number" min="0" max="100" value={assessment.weighting} onChange={(event) => activeStore.updateAssessment(assessment.id, { weighting: Number(event.target.value) })} />
                  <button className="focus-ring rounded-md border border-coral px-3 py-2 text-sm text-coral" onClick={() => activeStore.deleteAssessment(assessment.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel>
            <h3 className="mb-3 text-lg font-semibold">Import / Export</h3>
            <div className="flex gap-2">
              <button className="focus-ring rounded-md bg-pine px-4 py-2 font-medium text-white" onClick={exportJson}>Export JSON</button>
              <button className="focus-ring rounded-md border border-black/10 px-4 py-2 dark:border-white/10" onClick={importJson}>Import JSON</button>
            </div>
            <textarea
              className="mt-3 min-h-[300px] w-full rounded-md border border-black/10 bg-white p-3 font-mono text-xs dark:border-white/10 dark:bg-white/5"
              value={backupText}
              onChange={(event) => setBackupText(event.target.value)}
              placeholder="Paste ExamOS backup JSON here, or export to view the current backup."
            />
            {message ? <p className="mt-2 text-sm text-ink/60 dark:text-white/55">{message}</p> : null}
          </Panel>
          <Panel>
            <h3 className="mb-3 text-lg font-semibold">Reset Demo Data</h3>
            <p className="mb-3 text-sm text-ink/60 dark:text-white/55">This restores the seeded MVP data in localStorage.</p>
            <button
              className="focus-ring rounded-md border border-coral px-4 py-2 text-coral"
              onClick={() => {
                if (window.confirm("Reset local ExamOS data?")) activeStore.resetDemoData();
              }}
            >
              Reset demo data
            </button>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
