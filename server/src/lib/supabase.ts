import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "⚠️ WARNING: Supabase credentials (SUPABASE_URL, SUPABASE_KEY) are missing. Storage uploads will fail.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
