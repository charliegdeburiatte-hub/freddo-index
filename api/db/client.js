import { createClient } from '@supabase/supabase-js'

// Why: two clients — public reads for the frontend, admin writes for scrapers.
// The service key bypasses RLS. Never let it near the frontend.
// Note: Supabase Vercel integration injects SUPABASE_SERVICE_ROLE_KEY (not SERVICE_KEY).

export const supabasePublic = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
