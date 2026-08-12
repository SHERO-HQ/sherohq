import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://dummy.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  "dummy";

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || (!supabaseKey && !supabaseServiceKey)) {
  console.warn(
    "⚠️ WARNING: Supabase credentials (SUPABASE_URL, SUPABASE_KEY) are missing. Storage uploads will use local storage fallback."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : supabase;

