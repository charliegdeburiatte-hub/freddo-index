import { createClient } from '@supabase/supabase-js'

// Why: frontend uses anon key only — read-only public access.
// Env vars must be VITE_ prefixed to be accessible in the browser.
// Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel,
// copying the values from SUPABASE_URL and SUPABASE_ANON_KEY.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
