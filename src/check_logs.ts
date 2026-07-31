import { query } from './lib/db';
query("SELECT * FROM activity_logs WHERE action = 'system_alert' ORDER BY \"createdAt\" DESC LIMIT 5")
  .then(r => console.log(r.rows))
  .catch(console.error)
  .finally(() => process.exit(0));
