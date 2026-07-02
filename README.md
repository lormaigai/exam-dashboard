# Exam Control

Static study tracker with optional account-based progress sync through Supabase Auth.

## Files

- `index.html` - the app
- `supabase-schema.sql` - database table and row-level security policies

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase-schema.sql`.
3. Go to Authentication settings and enable Email signups.
4. Add your deployed site URL to the allowed redirect/site URLs.
5. In `index.html`, fill in:

```js
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-public-anon-key";
```

The anon key is meant to be public in browser apps. Do not paste service-role keys into `index.html`.

## GitHub + Netlify

1. Create a new GitHub repository.
2. Upload or push these files to the repository root.
3. In Netlify, import the GitHub repository.
4. Use the default static deploy settings. No build command is needed.
5. After deploy, add the Netlify URL to Supabase Authentication URL settings.

## How Saving Works

- Without Supabase keys, progress saves locally in the browser.
- With Supabase keys, users must create an account or log in.
- Each user gets one private `user_progress` row keyed by their Supabase user id.
- Emails are collected by Supabase Auth and also mirrored into `user_progress.email` for easy viewing.
