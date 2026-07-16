import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://dummy.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "dummy";

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "⚠️ WARNING: Supabase credentials (SUPABASE_URL, SUPABASE_KEY) are missing. Storage uploads will fail."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
