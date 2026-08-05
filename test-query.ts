import { config } from "dotenv";
config({ path: ".env.local" });
import { query } from "./src/lib/db";

async function test() {
  try {
    const result = await query(`
      SELECT
        sender_wa_id,
        MAX(created_at) as last_message_at,
        COUNT(*) as message_count,
        (array_agg(content ORDER BY created_at DESC))[1] as last_message,
        (array_agg(direction ORDER BY created_at DESC))[1] as direction
      FROM whatsapp_messages
      GROUP BY sender_wa_id
      ORDER BY MAX(created_at) DESC;
    `);
    console.log("Success:", result.rows);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
