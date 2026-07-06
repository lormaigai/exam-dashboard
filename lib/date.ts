const dayMs = 24 * 60 * 60 * 1000;

export function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(input: string | Date, days: number) {
  const date = typeof input === "string" ? new Date(`${input}T12:00:00`) : new Date(input);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function daysBetween(from: string | Date, to: string | Date) {
  const fromDate = typeof from === "string" ? new Date(`${from}T00:00:00`) : from;
  const toDate = typeof to === "string" ? new Date(`${to}T00:00:00`) : to;
  return Math.ceil((toDate.getTime() - fromDate.getTime()) / dayMs);
}

export function todayISO() {
  return toISODate(new Date());
}

export function startOfWeekISO(input = new Date()) {
  const date = new Date(input);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return toISODate(date);
}

export function formatShortDate(value?: string) {
  if (!value) return "Date flexible";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
    new Date(`${value}T12:00:00`)
  );
}

export function getNextReviewDate(confidence: number, from = todayISO()) {
  const intervals: Record<number, number> = { 1: 1, 2: 2, 3: 4, 4: 7, 5: 14 };
  return addDays(from, intervals[confidence] ?? 4);
}

export function weekDates(weekStart = startOfWeekISO()) {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}
