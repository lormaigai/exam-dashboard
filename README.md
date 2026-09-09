# Exam Dashboard

A single-page exam-prep dashboard for Singapore students: exam countdowns,
syllabus checklists, a focus timer and a weekly plan. The whole app is one
self-contained file, `index.html` — editorial "control desk" styling, no build
step. Ships with the RGS Year 4 · 2026 preset (T3/T4 exam dates + full syllabus
checklists); any student can also build their own setup or import a template a
friend shared.

## Features

- **Live demo first.** Logged-out visitors can click through the whole app
  with sample data; scrolling deeper or interacting beyond the tabs opens the
  create-account gate. Accounts are email + password (Supabase). Each student's
  progress is saved to their own row in the `user_progress` table
  (row-level-security scoped per user) and syncs across devices; it also
  mirrors to `localStorage` so the app keeps working offline.
- **Two ways to set up.** New accounts pick a template (built-in RGS Year 4 ·
  2026 preset, or one shared by a friend) or a guided builder (subjects →
  syllabus units → exam dates).
- **Shareable templates.** Edit Data → Templates exports your setup as a JSON
  file to send to friends; they import it during sign-up or in Edit Data.
- **Overview** — next-paper countdown, "up next" timetable, and coverage stats.
- **Calendar** — month grid of exam days plus the full timetable in order.
- **Study Tracker** — per-skill syllabus checklists for every subject; ticking a
  topic updates each subject's coverage bar. Covers Biology, Chemistry, Physics,
  Geography, Math 1 & 2, English, Higher Chinese, and Inquiry & Advocacy,
  rebuilt from the 2026 Y4 curriculum maps and assessment frameworks.
- **Focus Timer** — Begin Day / End Day tracking around Pomodoro presets
  (Classic 25/5, Deep Work 50/10, Quick Sprint 15/3, Custom). Actual running
  focus intervals count as study; every other minute inside the day window is
  automatically counted as break/non-study time.
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
- On sign-in the cloud and local copies are reconciled, with study, break, and
  water histories merged so a stale or interrupted cloud save cannot erase a
  newer browser entry. When the bundled 2026 curriculum is newer than a student's
  saved copy, their syllabus checklists refresh to the new curriculum while
  their goals, weekly plan, and custom exams are preserved.
