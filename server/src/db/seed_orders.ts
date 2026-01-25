import db from "./database";
import { v4 as uuidv4 } from "uuid";

interface DatabaseProduct {
  id: string;
  name: string;
  price: number;
}

export function seedOrders() {
  const products = db
    .prepare("SELECT id, name, price FROM products")
    .all() as DatabaseProduct[];

  if (products.length === 0) {
    console.log("❌ No products found. Seed products first.");
    return;
  }

  console.log(`Found ${products.length} products. Generating orders...`);

  const orders = [];

  const paymentMethods = ["credit_card", "paypal", "apple_pay"];

  // Generate 50 orders over the last 30 days
  for (let i = 0; i < 50; i++) {
    const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
    const orderItems = [];
    let total = 0;

    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;

      orderItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
      });

      total += product.price * quantity;
    }

    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    // Random status based on recency
    let status = "delivered";
    if (daysAgo < 2) status = "pending";
    else if (daysAgo < 5) status = "shipped";
    else if (Math.random() > 0.9) status = "cancelled";

    orders.push({
      id: uuidv4(),
      guestId: uuidv4(),
      items: JSON.stringify(orderItems),
      total: total,
      shippingInfo: JSON.stringify({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        address: "123 Main St",
        city: "New York",
        region: "NY",
        postalCode: "10001",
        phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      }),
      paymentMethod:
        paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      status: status,
      createdAt: date.toISOString(),
    });
  }

  const insertOrder = db.prepare(`
    INSERT INTO orders (id, guestId, items, total, shippingInfo, paymentMethod, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((orders) => {
    for (const order of orders) {
      insertOrder.run(
        order.id,
        order.guestId,
        order.items,
        order.total,
        order.shippingInfo,
        order.paymentMethod,
        order.status,
        order.createdAt,
      );
    }
  });

  insertMany(orders);
  console.log(`✅ Seeded ${orders.length} orders.`);
}

// Check if running directly
// In ES modules, allow running if this is the main entry point logic
// But simpler to just export and run via a runner script or just call it here if we assume standalone run
if (process.argv[1] && process.argv[1].endsWith("seed_orders.ts")) {
  seedOrders();
}
