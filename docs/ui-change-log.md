# Exam Dashboard UI change log

2026-09-23

1. Inspected main branch. The app lives in `index.html`. Logged-out users see a clickable sample dashboard, then an optional preview gate after scrolling or interacting. Existing timer confetti runs on recorded focus completion.
2. Created `feature/signup-first-motion` from `main` for the requested changes.
3. Next: show the account form over the sample dashboard on first load, remove open-demo dismissal, add header and scroll motion, improve completion feedback, then validate and open a pull request.

4. Updated `index.html`: account form appears over a non-interactive sample on logged-out load; removed the demo dismissal and interaction gate; added a readable rotating header, scroll reveals with reduced-motion support, and a visible focus-block completion message alongside the existing confetti.
5. Updated `README.md` to match the new first-visit flow. Checked inline JavaScript syntax, verified key element IDs are unique and present, checked that old demo controls are gone, and compared the feature branch with `main` (three changed files, no divergence).
6. Pending: run the repository CI after opening the pull request and inspect its result. Browser visual review is still recommended before publishing.
