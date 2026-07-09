"use client";

import { createClient } from "@supabase/supabase-js";

// Public-safe values: the publishable key is designed for browser use and all
// table access is protected by Row Level Security. The static GitHub Pages
// host has no runtime env, so we fall back to hardcoded values when the
// NEXT_PUBLIC_* vars are not baked in at build time.
const FALLBACK_SUPABASE_URL = "https://vnsupnqmzpetgjgjbhep.supabase.co";
const FALLBACK_SUPABASE_KEY = "sb_publishable_7ImvwLt7mhaZDnuhrdmj4A_5-EC-tPz";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
