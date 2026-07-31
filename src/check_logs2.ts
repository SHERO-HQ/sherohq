import { query } from './lib/db';
query("SELECT action, details, type, \"createdAt\" FROM activity_logs ORDER BY \"createdAt\" DESC LIMIT 20")
  .then(r => {
    r.rows.forEach(row => console.log(`[${row.createdAt}] ${row.action} (${row.type}): ${row.details}`));
  })
  .catch(console.error)
  .finally(() => process.exit(0));
