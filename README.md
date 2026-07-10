# Exam Control — Y4 2026

A single-page exam-prep dashboard for a Sec 4 (Year 4) student's T3/T4 2026 run
of end-year assessments and O-Levels. The whole app is one self-contained file,
`index.html` — editorial "control desk" styling, no build step.

## Features

- **Account gate first.** The first screen is email + password sign-in / create
  account (Supabase). Each student's progress is saved to their own row in the
  `user_progress` table (row-level-security scoped per user) and syncs across
  devices; it also mirrors to `localStorage` so the app keeps working offline.
- **Overview** — next-paper countdown, "up next" timetable, and coverage stats.
- **Calendar** — month grid of exam days plus the full timetable in order.
- **Study Tracker** — per-skill syllabus checklists for every subject; ticking a
  topic updates each subject's coverage bar. Covers Biology, Chemistry, Physics,
  Geography, Math 1 & 2, English, Higher Chinese, and Inquiry & Advocacy,
  rebuilt from the 2026 Y4 curriculum maps and assessment frameworks.
- **Focus Timer** — Pomodoro with presets (Classic 25/5, Deep Work 50/10, Quick
  Sprint 15/3, Custom), long breaks, auto-advance, sound alerts, a refresh-safe
  countdown, and a "focused today" tally.
- **Goals & Weekly Plan** — term goals and a click-to-edit weekly study grid.
- **Edit Data** — add/remove exams and subjects and build custom checklists.

## Hosting

Deployed to GitHub Pages from `main` by `.github/workflows/deploy-pages.yml`,
which simply publishes `index.html` as a static site (no build). To run locally,
open `index.html` in a browser or serve the folder with any static file server.

## Data & sync

- Auth and cloud storage use Supabase (project URL and publishable key are
  embedded in `index.html`; the publishable key is safe for client-side use).
- Local copy lives in `localStorage` under `examcontrol-data`; the Focus timer's
  settings and state live under `examcontrol-pomodoro`.
- On sign-in the cloud copy is loaded (falling back to local, then to the
  built-in defaults). When the bundled 2026 curriculum is newer than a student's
  saved copy, their syllabus checklists refresh to the new curriculum while
  their goals, weekly plan, and custom exams are preserved.
