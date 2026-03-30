import { createClient } from "@supabase/supabase-js";

import type { Database } from "~/lib/database.types";

const configuredUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const configuredKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

/** Valid-shaped placeholders so prerender / CI build can import the module without secrets. */
const url =
  configuredUrl.length > 0
    ? configuredUrl
    : "https://build-placeholder.supabase.co";
const publishableKey =
  configuredKey.length > 0
    ? configuredKey
    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1aWxkLXBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDA5OTUyMDAsImV4cCI6MTk1NjU3MTYwMH0.placeholder";

if (configuredUrl.length === 0 || configuredKey.length === 0) {
  console.warn(
    "Nudge: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is missing — using build placeholder client; configure .env.local for real data.",
  );
}

export const supabase = createClient<Database>(url, publishableKey, {
  auth: {
    flowType: "pkce",
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});
