# Hosting ExamOS

ExamOS is local-first. Progress is saved in the browser's `localStorage`, so it survives closing and reopening the browser on the same device and same site URL.

## Local Use

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000/dashboard`.

## Internet Hosting

Use Vercel or Netlify for the current MVP. No database or API key is required.

Typical Vercel flow:

```bash
pnpm build
vercel
```

Important: hosted local-first data is still stored per browser and per domain. If you open the hosted app on a different device, import your JSON backup from Settings. True cross-device sync requires adding login and a backend database later.
