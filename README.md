# ExamOS

ExamOS is a private, local-first exam preparation dashboard for Sec 4 end-year and O-Level-style study planning.

## Features

- Account sign-in (email + password via Supabase) as the first screen, with per-student cloud sync of progress across devices.
- Focus page with Pomodoro timer presets (Classic 25/5, Deep Work 50/10, Quick Sprint 15/3, Custom), auto-advance, sound alerts, and automatic logging of completed focus blocks to the session log.
- Dashboard with recommended tasks, assessment countdowns, weak topics, overdue reviews, and quick add forms.
- Subject pages with assessment timelines, topic confidence, accuracy, sessions, mistakes, and next actions.
- Weekly planner with rule-based generation from assessment weight, urgency, confidence, accuracy, stale reviews, mistakes, and difficulty.
- Mistake bank with search, filters, review state, edit, and delete actions.
- Study session log with subject minutes, type distribution, accuracy, and focus summaries.
- Weekly review summary and saved reflections.
- Settings for subject edits, assessment date/weight edits, JSON export/import, demo reset, and dark mode.

## Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000/dashboard`.

## Build

```bash
pnpm build
```

## Hosting

See `DEPLOYMENT.md`. The current MVP can be hosted as a Next.js app, but progress remains local to each browser unless a backend sync layer is added later.

## Usage Notes

Data is stored in browser `localStorage` under `examos-data-v1` and synced to the signed-in student's row in the Supabase `user_progress` table (RLS-scoped per user). Use Settings to export JSON backups before resetting browser storage. The recommendations are rule-based, not AI-generated, and can be adjusted by editing confidence, accuracy, mistakes, assessments, and planner constraints.

Healthy defaults are built into the planner: no more than three study blocks on school days by default, a rest day, breaks through short blocks, and no late-night scheduling.
