const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    await client.query('ALTER TABLE abandoned_carts ADD COLUMN IF NOT EXISTS "whatsappSent" BOOLEAN DEFAULT false');
    console.log('Column added successfully');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}
run();
