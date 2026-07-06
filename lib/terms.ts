import type { Assessment } from "@/lib/types";

export type TimelineScope = "sem2" | "t3" | "t4" | "olevel" | "all";

export interface TermInfo {
  term: "T1" | "T2" | "T3" | "T4" | "External" | "Flexible";
  week?: number;
  semester: "Sem 1" | "Sem 2";
  label: string;
  sortKey: number;
}

export function getTermInfo(assessment: Assessment): TermInfo {
  const source = `${assessment.termWeek} ${assessment.name}`.toLowerCase();
  const compact = assessment.termWeek.replace(/\s+/g, "");
  const tMatch = compact.match(/^T([1-4])W?(\d+)?$/i);
  const termMatch = assessment.termWeek.match(/^Term\s*([1-4])$/i);

  if (tMatch) {
    const termNumber = Number(tMatch[1]);
    const week = tMatch[2] ? Number(tMatch[2]) : undefined;
    return {
      term: `T${termNumber}` as TermInfo["term"],
      week,
      semester: termNumber <= 2 ? "Sem 1" : "Sem 2",
      label: week ? `T${termNumber}W${week}` : `T${termNumber}`,
      sortKey: termNumber * 100 + (week ?? 99)
    };
  }

  if (termMatch) {
    const termNumber = Number(termMatch[1]);
    return {
      term: `T${termNumber}` as TermInfo["term"],
      semester: termNumber <= 2 ? "Sem 1" : "Sem 2",
      label: `T${termNumber}`,
      sortKey: termNumber * 100 + 99
    };
  }

  if (/gce|o-level|olevel|prelim/.test(source)) {
    return {
      term: "External",
      semester: "Sem 2",
      label: /prelim/.test(source) ? "Prelim" : "O-Level",
      sortKey: 450
    };
  }

  if (/eya|eoy|end-year|end year/.test(source) || assessment.optionalDate) {
    return {
      term: "Flexible",
      semester: "Sem 2",
      label: assessment.termWeek === "Editable" ? "Sem 2" : assessment.termWeek,
      sortKey: 420
    };
  }

  return {
    term: "Flexible",
    semester: "Sem 2",
    label: assessment.termWeek || "Flexible",
    sortKey: 499
  };
}

export function isInTimelineScope(assessment: Assessment, scope: TimelineScope) {
  const info = getTermInfo(assessment);
  if (scope === "all") return true;
  if (scope === "sem2") return info.semester === "Sem 2";
  if (scope === "t3") return info.term === "T3";
  if (scope === "t4") return info.term === "T4";
  return info.term === "External" || /gce|o-level|olevel|prelim/i.test(`${assessment.name} ${assessment.termWeek}`);
}
