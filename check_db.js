const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "server/data/sherotech.db");
console.log("Openning DB at:", dbPath);

try {
  const db = new Database(dbPath);

  const products = db.prepare("SELECT COUNT(*) as count FROM products").get();
  console.log("Products:", products.count);

  const orders = db.prepare("SELECT COUNT(*) as count FROM orders").get();
  console.log("Orders:", orders.count);

  const users = db.prepare("SELECT COUNT(*) as count FROM admin_users").get();
  console.log("Admin Users:", users.count);
} catch (err) {
  console.error("Error opening DB:", err);
}
