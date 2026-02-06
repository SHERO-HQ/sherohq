/**
 * Seed script to populate the admin panel with realistic data
 * This includes orders, tickets, consultations, inquiries, and reviews
 */

import db from "./database";
import { v4 as uuidv4 } from "uuid";

// Ghanaian names for realistic local data
const ghanaianFirstNames = [
  "Kwame",
  "Kofi",
  "Yaw",
  "Kwesi",
  "Ama",
  "Akua",
  "Abena",
  "Efua",
  "Nana",
  "Adjoa",
  "Akosua",
  "Adwoa",
  "Afua",
  "Kojo",
  "Kwadwo",
  "Kwabena",
  "Priscilla",
  "Emmanuel",
  "Gifty",
  "Patience",
  "Bright",
  "Blessing",
  "Prince",
  "Victoria",
  "Michael",
  "Samuel",
  "Daniel",
  "Grace",
  "Mercy",
  "Elizabeth",
];

const ghanaianLastNames = [
  "Asante",
  "Mensah",
  "Owusu",
  "Boateng",
  "Osei",
  "Appiah",
  "Adjei",
  "Amoah",
  "Agyemang",
  "Ofori",
  "Ansah",
  "Danso",
  "Darko",
  "Frimpong",
  "Gyamfi",
  "Kumi",
  "Nyarko",
  "Opoku",
  "Sarpong",
  "Yeboah",
  "Amponsah",
  "Bonsu",
  "Fordjour",
  "Tawiah",
  "Acheampong",
  "Asiedu",
  "Baah",
  "Badu",
  "Koranteng",
  "Quansah",
];

const ghanaianCities = [
  { city: "Accra", region: "Greater Accra" },
  { city: "Kumasi", region: "Ashanti" },
  { city: "Tamale", region: "Northern" },
  { city: "Takoradi", region: "Western" },
  { city: "Cape Coast", region: "Central" },
  { city: "Koforidua", region: "Eastern" },
  { city: "Sunyani", region: "Bono" },
  { city: "Ho", region: "Volta" },
  { city: "Tema", region: "Greater Accra" },
  { city: "Obuasi", region: "Ashanti" },
  { city: "Kasoa", region: "Central" },
  { city: "Techiman", region: "Bono East" },
];

const streetAddresses = [
  "15 Independence Avenue",
  "23 Liberation Road",
  "7 Oxford Street",
  "42 Ring Road Central",
  "18 Cantonments Road",
  "55 Spintex Road",
  "12 Achimota Road",
  "31 Airport Residential",
  "45 East Legon",
  "8 Labone Crescent",
  "67 Osu Oxford Street",
  "21 Dzorwulu",
];

// Helper functions
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
  const prefixes = ["024", "020", "027", "055", "054", "059", "026", "056"];
  const prefix = randomElement(prefixes);
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `${prefix}${number}`;
}

function randomEmail(firstName: string, lastName: string): string {
  const domains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "icloud.com",
    "mail.com",
  ];
  const separator = randomElement([".", "_", ""]);
  const suffix = Math.random() > 0.7 ? Math.floor(Math.random() * 99) : "";
  return `${firstName.toLowerCase()}${separator}${lastName.toLowerCase()}${suffix}@${randomElement(domains)}`;
}

function randomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 12) + 8); // 8am to 8pm
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

// Database seeding functions
export async function seedOrders() {
  try {
    const existingRes = await db.query("SELECT COUNT(*) as count FROM orders");
    if (Number(existingRes.rows[0].count) > 20) {
      console.log("📦 Orders already seeded, skipping...");
      return;
    }

    const productsRes = await db.query(
      "SELECT id, name, price, image FROM products",
    );
    const products = productsRes.rows;

    if (products.length === 0) {
      console.log("❌ No products found. Seed products first.");
      return;
    }

    const paymentMethods = [
      "credit_card",
      "momo",
      "bank_transfer",
      "cash_on_delivery",
    ];
    const orders = [];

    // Generate 75 orders over the last 60 days
    for (let i = 0; i < 75; i++) {
      const firstName = randomElement(ghanaianFirstNames);
      const lastName = randomElement(ghanaianLastNames);
      const location = randomElement(ghanaianCities);

      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let total = 0;

      for (let j = 0; j < numItems; j++) {
        const product = randomElement(products);
        const quantity = Math.floor(Math.random() * 2) + 1;
        const price = Number(product.price);

        orderItems.push({
          id: product.id,
          name: product.name,
          price: price,
          quantity: quantity,
          image: product.image,
        });

        total += price * quantity;
      }

      const daysAgo = Math.floor(Math.random() * 60);
      const createdAt = randomDate(60);

      // Status based on age
      let status: string;
      if (daysAgo < 1) status = "pending";
      else if (daysAgo < 3) status = randomElement(["pending", "processing"]);
      else if (daysAgo < 7) status = randomElement(["processing", "shipped"]);
      else if (Math.random() > 0.92) status = "cancelled";
      else status = "delivered";

      orders.push({
        id: uuidv4(),
        guestId: uuidv4(),
        items: JSON.stringify(orderItems),
        total: total,
        shippingInfo: JSON.stringify({
          firstName,
          lastName,
          email: randomEmail(firstName, lastName),
          phone: randomPhone(),
          address: randomElement(streetAddresses),
          city: location.city,
          region: location.region,
        }),
        paymentMethod: randomElement(paymentMethods),
        status: status,
        createdAt: createdAt.toISOString(),
      });
    }

    await db.query("BEGIN");
    for (const order of orders) {
      await db.query(
        `INSERT INTO orders (id, "guestId", items, total, "shippingInfo", "paymentMethod", status, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          order.id,
          order.guestId,
          order.items,
          order.total,
          order.shippingInfo,
          order.paymentMethod,
          order.status,
          order.createdAt,
        ],
      );
    }
    await db.query("COMMIT");
    console.log(
      `✅ Seeded ${orders.length} orders with Ghanaian customer data.`,
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error seeding orders:", error);
  }
}

export async function seedTickets() {
  try {
    const existingRes = await db.query("SELECT COUNT(*) as count FROM tickets");
    if (Number(existingRes.rows[0].count) > 5) {
      console.log("🎫 Tickets already seeded, skipping...");
      return;
    }

    const productsRes = await db.query("SELECT id, name FROM products");
    const products = productsRes.rows;

    const priorities = ["low", "medium", "high", "urgent"];

    const ticketTemplates = [
      {
        subject: "Order not received",
        message:
          "I placed an order 5 days ago and haven't received it yet. Can you help track it?",
        category: "shipping",
      },
      {
        subject: "Product not working",
        message:
          "The product I received is not powering on. I've tried different outlets but nothing works.",
        category: "technical",
      },
      {
        subject: "Wrong item delivered",
        message:
          "I ordered a laptop but received a keyboard instead. Please help me exchange this.",
        category: "shipping",
      },
      {
        subject: "Refund request",
        message:
          "I would like to request a refund for my recent purchase. The product doesn't meet my expectations.",
        category: "returns",
      },
      {
        subject: "Battery issue",
        message:
          "The battery drains very quickly, lasting only about 2 hours instead of the advertised 8 hours.",
        category: "warranty",
      },
      {
        subject: "Payment failed but amount deducted",
        message:
          "My payment failed but the amount was deducted from my account. Please help.",
        category: "billing",
      },
      {
        subject: "Screen flickering problem",
        message:
          "The screen keeps flickering when I use certain applications. This started after the last update.",
        category: "technical",
      },
      {
        subject: "Discount code not working",
        message:
          "I tried using the discount code SHERO20 but it says invalid. Can you help?",
        category: "billing",
      },
      {
        subject: "Delivery address change",
        message:
          "I need to change my delivery address. The order hasn't shipped yet.",
        category: "shipping",
      },
      {
        subject: "Product inquiry",
        message:
          "Can you tell me if this product is compatible with Mac computers?",
        category: "general",
      },
      {
        subject: "Warranty claim",
        message:
          "My device stopped working after 3 months. I would like to claim warranty service.",
        category: "warranty",
      },
      {
        subject: "Installation help needed",
        message:
          "I'm having trouble installing the software that came with the device. Can you guide me?",
        category: "technical",
      },
      {
        subject: "Missing accessories",
        message:
          "The package arrived without the charger and user manual. Please send them.",
        category: "shipping",
      },
      {
        subject: "Bulk order inquiry",
        message:
          "We are interested in placing a bulk order for our company. Do you offer corporate discounts?",
        category: "general",
      },
      {
        subject: "Return pickup request",
        message:
          "I've been approved for a return but no one has picked up the item yet.",
        category: "returns",
      },
    ];

    const tickets = [];

    for (let i = 0; i < 20; i++) {
      const firstName = randomElement(ghanaianFirstNames);
      const lastName = randomElement(ghanaianLastNames);
      const template = randomElement(ticketTemplates);
      const product = Math.random() > 0.4 ? randomElement(products) : null;

      const daysAgo = Math.floor(Math.random() * 30);
      let status: string;
      if (daysAgo < 2) status = "open";
      else if (daysAgo < 5)
        status = randomElement(["open", "pending", "in-progress"]);
      else if (daysAgo < 14)
        status = randomElement(["in-progress", "resolved"]);
      else status = "resolved";

      tickets.push({
        id: uuidv4(),
        name: `${firstName} ${lastName}`,
        email: randomEmail(firstName, lastName),
        phone: randomPhone(),
        subject: template.subject + (product ? ` - ${product.name}` : ""),
        message: template.message,
        category: template.category,
        priority: randomElement(priorities),
        status: status,
        productId: product?.id || null,
        createdAt: randomDate(30).toISOString(),
      });
    }

    await db.query("BEGIN");
    for (const ticket of tickets) {
      await db.query(
        `INSERT INTO tickets (id, name, email, phone, subject, message, category, priority, status, "productId", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          ticket.id,
          ticket.name,
          ticket.email,
          ticket.phone,
          ticket.subject,
          ticket.message,
          ticket.category,
          ticket.priority,
          ticket.status,
          ticket.productId,
          ticket.createdAt,
        ],
      );
    }
    await db.query("COMMIT");
    console.log(`✅ Seeded ${tickets.length} support tickets.`);
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error seeding tickets:", error);
  }
}

export async function seedConsultations() {
  try {
    const existingRes = await db.query(
      "SELECT COUNT(*) as count FROM consultations",
    );
    if (Number(existingRes.rows[0].count) > 3) {
      console.log("📅 Consultations already seeded, skipping...");
      return;
    }

    const services = [
      "IT Consulting",
      "Hardware Setup",
      "Software Installation",
      "Network Configuration",
      "Data Recovery",
      "Cybersecurity Assessment",
      "Cloud Migration",
      "Tech Support Training",
      "Business IT Solutions",
    ];

    const timeSlots = [
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM",
    ];

    const messages = [
      "Looking forward to discussing our IT infrastructure needs.",
      "We need help setting up our new office network.",
      "Interested in learning more about your services.",
      "We have a team of 50 and need better collaboration tools.",
      "Please call me 30 minutes before the appointment.",
      "Our current system is outdated and we need modernization advice.",
      "",
      "We are a startup looking for cost-effective IT solutions.",
    ];

    const consultations = [];

    for (let i = 0; i < 15; i++) {
      const firstName = randomElement(ghanaianFirstNames);
      const lastName = randomElement(ghanaianLastNames);

      // Future dates for pending/confirmed, past dates for completed
      const dayOffset = Math.floor(Math.random() * 30) - 10; // -10 to +20 days
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);

      let status: string;
      if (dayOffset > 5) status = randomElement(["pending", "confirmed"]);
      else if (dayOffset > 0) status = "confirmed";
      else if (dayOffset > -7)
        status = randomElement(["completed", "cancelled"]);
      else status = "completed";

      consultations.push({
        id: uuidv4(),
        name: `${firstName} ${lastName}`,
        email: randomEmail(firstName, lastName),
        phone: randomPhone(),
        service: randomElement(services),
        date: date.toISOString().split("T")[0],
        time: randomElement(timeSlots),
        message: randomElement(messages),
        status: status,
        createdAt: randomDate(30).toISOString(),
      });
    }

    await db.query("BEGIN");
    for (const c of consultations) {
      await db.query(
        `INSERT INTO consultations (id, name, email, phone, service, date, time, message, status, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          c.id,
          c.name,
          c.email,
          c.phone,
          c.service,
          c.date,
          c.time,
          c.message,
          c.status,
          c.createdAt,
        ],
      );
    }
    await db.query("COMMIT");
    console.log(`✅ Seeded ${consultations.length} consultations.`);
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error seeding consultations:", error);
  }
}

export async function seedInquiries() {
  try {
    const existingRes = await db.query(
      "SELECT COUNT(*) as count FROM inquiries",
    );
    if (Number(existingRes.rows[0].count) > 3) {
      console.log("📨 Inquiries already seeded, skipping...");
      return;
    }

    const inquiryTemplates = [
      {
        subject: "Partnership Opportunity",
        message:
          "We are interested in becoming a reseller partner for your products in the Northern region. Please share your partnership program details.",
      },
      {
        subject: "Corporate Account Inquiry",
        message:
          "Our company wants to set up a corporate account for IT equipment purchases. What are the requirements and benefits?",
      },
      {
        subject: "Product Availability",
        message:
          "Hi, I'm looking for the new MacBook Pro M3 Max. When will it be available in your store?",
      },
      {
        subject: "Bulk Order Discount",
        message:
          "We need to purchase 25 laptops for our new office. Do you offer bulk discounts?",
      },
      {
        subject: "Store Location",
        message:
          "I'm visiting Accra next week. Can you share your physical store address and operating hours?",
      },
      {
        subject: "Payment Options",
        message:
          "Do you accept mobile money payments? Specifically, MTN MoMo and Vodafone Cash?",
      },
      {
        subject: "Warranty Information",
        message:
          "What is your warranty policy for refurbished items? I'm interested in a refurbished iPhone.",
      },
      {
        subject: "Technical Specifications",
        message:
          "Can you provide the full technical specifications for the Gaming Desktop PC?",
      },
      {
        subject: "International Shipping",
        message:
          "Do you ship to Nigeria? I'm interested in ordering some accessories.",
      },
      {
        subject: "Feedback",
        message:
          "Just wanted to say thank you for the excellent service! My order arrived on time and the product quality is amazing.",
      },
      {
        subject: "Price Match Request",
        message:
          "I found the same product cheaper at another store. Do you offer price matching?",
      },
      {
        subject: "Event Sponsorship",
        message:
          "We are organizing a tech event in Kumasi. Would SHERO Technologies be interested in sponsoring?",
      },
    ];

    const inquiries = [];

    for (let i = 0; i < 18; i++) {
      const firstName = randomElement(ghanaianFirstNames);
      const lastName = randomElement(ghanaianLastNames);
      const template = inquiryTemplates[i % inquiryTemplates.length];

      const daysAgo = Math.floor(Math.random() * 45);
      let status: string;
      if (daysAgo < 3) status = "pending";
      else if (daysAgo < 10) status = randomElement(["pending", "responded"]);
      else status = randomElement(["responded", "closed"]);

      inquiries.push({
        id: uuidv4(),
        name: `${firstName} ${lastName}`,
        email: randomEmail(firstName, lastName),
        subject: template.subject,
        message: template.message,
        status: status,
        createdAt: randomDate(45).toISOString(),
      });
    }

    await db.query("BEGIN");
    for (const inq of inquiries) {
      await db.query(
        `INSERT INTO inquiries (id, name, email, subject, message, status, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          inq.id,
          inq.name,
          inq.email,
          inq.subject,
          inq.message,
          inq.status,
          inq.createdAt,
        ],
      );
    }
    await db.query("COMMIT");
    console.log(`✅ Seeded ${inquiries.length} contact inquiries.`);
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error seeding inquiries:", error);
  }
}

export async function seedReviews() {
  try {
    const existingRes = await db.query("SELECT COUNT(*) as count FROM reviews");
    if (Number(existingRes.rows[0].count) > 10) {
      console.log("⭐ Reviews already seeded, skipping...");
      return;
    }

    const productsRes = await db.query("SELECT id, name FROM products");
    const products = productsRes.rows;

    if (products.length === 0) {
      console.log("❌ No products found. Seed products first.");
      return;
    }

    const reviewComments = [
      {
        rating: 5,
        comment:
          "Amazing quality! Exactly what I was looking for. Fast delivery too.",
      },
      {
        rating: 5,
        comment: "Best purchase I've made. Worth every cedi. Highly recommend!",
      },
      {
        rating: 5,
        comment: "Exceeded my expectations. The build quality is excellent.",
      },
      {
        rating: 4,
        comment:
          "Great product, works perfectly. Shipping was a bit slow but worth the wait.",
      },
      {
        rating: 4,
        comment: "Good value for money. Minor issues but overall satisfied.",
      },
      {
        rating: 4,
        comment: "Nice product, does what it's supposed to. Would buy again.",
      },
      {
        rating: 4,
        comment:
          "Quality is good. Customer service was helpful with my questions.",
      },
      {
        rating: 3,
        comment: "Decent product. Not bad, not great. Gets the job done.",
      },
      {
        rating: 3,
        comment: "Average experience. Product is okay but could be better.",
      },
      {
        rating: 5,
        comment:
          "Outstanding! This is my second purchase from SHERO. Never disappoints.",
      },
      {
        rating: 5,
        comment:
          "Premium quality at a fair price. The team was very professional.",
      },
      {
        rating: 4,
        comment:
          "Works great! Setup was easy thanks to the clear instructions.",
      },
      {
        rating: 5,
        comment: "Fantastic! I've recommended SHERO to all my friends.",
      },
      {
        rating: 4,
        comment:
          "Good product. Packaging was secure and everything arrived intact.",
      },
      {
        rating: 5,
        comment:
          "Perfect for my needs. Will definitely purchase more items soon.",
      },
    ];

    const reviews = [];

    // Generate 3-6 reviews per product
    for (const product of products) {
      const numReviews = Math.floor(Math.random() * 4) + 3;

      for (let i = 0; i < numReviews; i++) {
        const firstName = randomElement(ghanaianFirstNames);
        const lastName = randomElement(ghanaianLastNames);
        const reviewTemplate = randomElement(reviewComments);

        reviews.push({
          id: uuidv4(),
          productId: product.id,
          userName: `${firstName} ${lastName.charAt(0)}.`,
          rating: reviewTemplate.rating,
          comment: reviewTemplate.comment,
          createdAt: randomDate(90).toISOString(),
        });
      }
    }

    await db.query("BEGIN");
    for (const review of reviews) {
      await db.query(
        `INSERT INTO reviews (id, "productId", "userName", rating, comment, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          review.id,
          review.productId,
          review.userName,
          review.rating,
          review.comment,
          review.createdAt,
        ],
      );
    }
    await db.query("COMMIT");
    console.log(`✅ Seeded ${reviews.length} product reviews.`);
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error seeding reviews:", error);
  }
}

export async function seedUsers() {
  try {
    const existingRes = await db.query("SELECT COUNT(*) as count FROM users");
    if (Number(existingRes.rows[0].count) > 10) {
      console.log("👥 Users already seeded, skipping...");
      return;
    }

    // Import bcrypt dynamically to hash password
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash("password123", 10);
    const users = [];

    // Generate 40 customers
    for (let i = 0; i < 40; i++) {
      const firstName = randomElement(ghanaianFirstNames);
      const lastName = randomElement(ghanaianLastNames);
      const email = randomEmail(firstName, lastName);

      users.push({
        id: uuidv4(),
        email,
        passwordHash,
        name: `${firstName} ${lastName}`,
        phone: randomPhone(),
        emailVerified: Math.random() > 0.3,
        createdAt: randomDate(90).toISOString(),
      });
    }

    await db.query("BEGIN");
    for (const user of users) {
      await db.query(
        `INSERT INTO users (id, email, "passwordHash", name, phone, "emailVerified", "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          user.id,
          user.email,
          user.passwordHash,
          user.name,
          user.phone,
          user.emailVerified,
          user.createdAt,
        ],
      );
    }
    await db.query("COMMIT");
    console.log(`✅ Seeded ${users.length} customers.`);
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error seeding users:", error);
  }
}

export async function seedActivityLogs() {
  try {
    const existingRes = await db.query(
      "SELECT COUNT(*) as count FROM activity_logs",
    );
    if (Number(existingRes.rows[0].count) > 10) {
      console.log("📜 Activity logs already seeded, skipping...");
      return;
    }

    const adminRes = await db.query("SELECT id FROM admin_users LIMIT 1");
    const adminId = adminRes.rows[0]?.id || null;

    const actionTemplates = [
      {
        action: "Updated product stock",
        type: "info",
        details: "Changed stock for MacBook Pro",
      },
      {
        action: "Order processed",
        type: "success",
        details: "Order #SH-7829 was marked as processing",
      },
      {
        action: "User deleted",
        type: "warning",
        details: "Customer account 'kwame@gmail.com' removed",
      },
      {
        action: "Login successful",
        type: "info",
        details: "Admin session started from 192.168.1.1",
      },
      {
        action: "Category added",
        type: "success",
        details: "New category 'Accessories' created",
      },
      {
        action: "System settings changed",
        type: "warning",
        details: "Updated tax rates for VAT",
      },
      {
        action: "Failed login attempt",
        type: "error",
        details: "Invalid password for user 'admin'",
      },
      {
        action: "Bulk export",
        type: "info",
        details: "Orders exported as CSV",
      },
    ];

    const logs = [];
    for (let i = 0; i < 30; i++) {
      const template = randomElement(actionTemplates);
      logs.push({
        id: uuidv4(),
        adminId,
        action: template.action,
        details: template.details,
        type: template.type,
        createdAt: randomDate(15).toISOString(),
      });
    }

    await db.query("BEGIN");
    for (const log of logs) {
      await db.query(
        `INSERT INTO activity_logs (id, "adminId", action, details, type, "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6)`,
        [log.id, log.adminId, log.action, log.details, log.type, log.createdAt],
      );
    }
    await db.query("COMMIT");
    console.log(`✅ Seeded ${logs.length} activity logs.`);
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error seeding activity logs:", error);
  }
}

// Main function to run all seeders
export async function seedAllAdminData() {
  console.log("🌱 Starting admin data seeding...");

  await seedUsers();
  await seedOrders();
  await seedTickets();
  await seedConsultations();
  await seedInquiries();
  await seedReviews();
  await seedActivityLogs();

  console.log("✅ Admin data seeding complete!");
}

// Allow running directly
if (process.argv[1]?.endsWith("seed_admin_data.ts")) {
  seedAllAdminData()
    .then(() => {
      console.log("Seeding successful");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
