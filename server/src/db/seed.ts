import db from "./database";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

// Type definitions for seed data
interface SeedProduct {
  id: string;
  name: string;
  sku?: string;
  category: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string[] | null;
  rating: number;
  reviews: number;
  badge: string | null;
  inStock: boolean;
  stockQuantity: number;
  description: string;
  features: string[] | null;
  specifications: Record<string, string> | null;
}

// Product data matching existing frontend structure
const products: SeedProduct[] = [
  {
    id: "1",
    name: 'MacBook Pro 16" M3',
    sku: "MAC-PRO-16-M3",
    category: "laptops",
    price: 8999,
    originalPrice: 9999,
    image: "💻",
    images: ["💻", "🖥️", "⌨️", "🖱️"],
    rating: 4.9,
    reviews: 245,
    badge: "Best Seller",
    inStock: true,
    stockQuantity: 100,
    description:
      "Experience the ultimate pro laptop. The new MacBook Pro features the M3 chip line, up to 22 hours of battery life, and the world's best laptop display.",
    features: [
      "Apple M3 Pro or M3 Max chip",
      "Up to 22 hours of battery life",
      "Liquid Retina XDR display",
      "Advanced camera and audio",
    ],
    specifications: {
      Processor: "Apple M3 Pro",
      Memory: "18GB Unified Memory",
      Storage: "512GB SSD",
      Display: '16.2" Liquid Retina XDR',
    },
  },
  {
    id: "2",
    name: "iPhone 15 Pro Max",
    sku: "IPHONE-15-PRO-MAX",
    category: "phones",
    price: 4599,
    originalPrice: null,
    image: "📱",
    images: ["📱", "🤳", "📲", "🔋"],
    rating: 4.8,
    reviews: 892,
    badge: "New",
    inStock: true,
    stockQuantity: 50,
    description:
      "The first iPhone to feature an aerospace-grade titanium design, using the same alloy that spacecraft use for missions to Mars.",
    features: [
      "A17 Pro chip",
      "Titanium design",
      "Action button",
      "48MP Main camera system",
    ],
    specifications: {
      Display: '6.7" Super Retina XDR',
      Processor: "A17 Pro chip",
      Camera: "48MP Main | Ultra Wide | Telephoto",
      Material: "Titanium",
    },
  },
  {
    id: "3",
    name: "Sony WH-1000XM5",
    sku: "SONY-WH1000XM5",
    category: "audio",
    price: 1299,
    originalPrice: 1499,
    image: "🎧",
    images: ["🎧", "🎵", "🔊", "📻"],
    rating: 4.7,
    reviews: 456,
    badge: null,
    inStock: true,
    stockQuantity: 75,
    description:
      "Our best noise cancelling gets even better. See how these Sony noise cancelling headphones combine our best noise cancelling technology with superlative sound.",
    features: [
      "Industry-leading noise cancellation",
      "Magnificent sound",
      "Crystal clear hands-free calling",
      "Up to 30-hour battery life",
    ],
    specifications: {
      "Driver Unit": "30mm",
      "Frequency Response": "4Hz-40,000Hz",
      "Headphone Type": "Closed, dynamic",
      "Cord Length": "approx. 1.2m",
    },
  },
  {
    id: "4",
    name: 'Dell UltraSharp 27"',
    sku: "DELL-U27-4K",
    category: "monitors",
    price: 2199,
    originalPrice: null,
    image: "🖥️",
    images: null,
    rating: 4.6,
    reviews: 178,
    badge: null,
    inStock: true,
    stockQuantity: 30,
    description:
      "Experience captivating visuals with this 27-inch 4K monitor featuring wide color coverage and ComfortView Plus.",
    features: [
      "4K UHD Resolution",
      "IPS Technology",
      "USB-C Hub Monitor",
      "ComfortView Plus",
    ],
    specifications: {
      "Screen Size": '27"',
      Resolution: "3840 x 2160",
      "Panel Type": "IPS",
      "Refresh Rate": "60Hz",
    },
  },
  {
    id: "5",
    name: "Logitech MX Keys",
    sku: "LOGI-MX-KEYS",
    category: "keyboards",
    price: 399,
    originalPrice: null,
    image: "⌨️",
    images: null,
    rating: 4.8,
    reviews: 324,
    badge: "Popular",
    inStock: true,
    stockQuantity: 45,
    description:
      "Introducing MX Keys - the key to mastering your next big project. Designed for creatives and engineered for coders.",
    features: [
      "Perfect Stroke Keys",
      "Smart Illumination",
      "Multi-Device & Multi-OS",
      "USB-C Rechargeable",
    ],
    specifications: {
      Connectivity: "Bluetooth / USB Receiver",
      "Battery Life": "up to 10 days",
      Backlighting: "Yes",
      Weight: "810g",
    },
  },
  {
    id: "6",
    name: "Logitech MX Master 3S",
    sku: "LOGI-MX-MASTER-3S",
    category: "mice",
    price: 349,
    originalPrice: null,
    image: "🖱️",
    images: null,
    rating: 4.9,
    reviews: 567,
    badge: null,
    inStock: false,
    stockQuantity: 0,
    description:
      "Meet MX Master 3S – an iconic mouse remastered. Feel every moment of your workflow with even more precision.",
    features: [
      "8K DPI Sensor",
      "Quiet Clicks",
      "Magspeed Scrolling",
      "App-Specific Customizations",
    ],
    specifications: null,
  },
  {
    id: "7",
    name: "Samsung T7 SSD 2TB",
    sku: "SAMSUNG-T7-2TB",
    category: "storage",
    price: 899,
    originalPrice: 1099,
    image: "💾",
    images: null,
    rating: 4.7,
    reviews: 289,
    badge: null,
    inStock: true,
    stockQuantity: 25,
    description:
      "The light, pocket-sized Portable SSD T7 delivers fast speeds with easy and reliable data storage.",
    features: [
      "Transfer in a flash",
      "Built strong and safe",
      "Sophisticated thermal solution",
      "Sleek and compact style",
    ],
    specifications: null,
  },
  {
    id: "8",
    name: "USB-C Hub",
    sku: "USBC-HUB-7IN1",
    category: "accessories",
    price: 149,
    originalPrice: null,
    image: "🔌",
    images: null,
    rating: 4.5,
    reviews: 412,
    badge: null,
    inStock: true,
    stockQuantity: 120,
    description:
      "Expand your connectivity with this 7-in-1 USB-C hub. Features 4K HDMI, USB 3.0 ports, and SD card readers.",
    features: [
      "7-in-1 Connectivity",
      "4K HDMI Output",
      "High-Speed Data Transfer",
      "Compact Design",
    ],
    specifications: null,
  },
  {
    id: "9",
    name: "Gaming Desktop PC",
    sku: "GAMING-PC-RTX4090",
    category: "desktops",
    price: 8999,
    originalPrice: 9999,
    image: "🖥️",
    images: null,
    rating: 4.9,
    reviews: 245,
    badge: "Best Seller",
    inStock: true,
    stockQuantity: 15,
    description:
      "Ultimate gaming desktop with the latest RTX graphics and fastest processors for maximum performance.",
    features: [
      "RTX 4090 Graphics",
      "Intel i9 Processor",
      "64GB RAM",
      "2TB NVMe SSD",
    ],
    specifications: null,
  },
];

const categories = [
  { id: "all", name: "All Products", icon: "📦" },
  { id: "laptops", name: "Laptops", icon: "💻" },
  { id: "phones", name: "Phones", icon: "📱" },
  { id: "audio", name: "Audio", icon: "🎧" },
  { id: "monitors", name: "Monitors", icon: "🖥️" },
  { id: "keyboards", name: "Keyboards", icon: "⌨️" },
  { id: "mice", name: "Mice", icon: "🖱️" },
  { id: "storage", name: "Storage", icon: "💾" },
  { id: "accessories", name: "Accessories", icon: "🔌" },
  { id: "desktops", name: "Desktops", icon: "🖥️" },
];

export async function seedDatabase() {
  try {
    // Check if products already exist
    const existingProductsRes = await db.query(
      "SELECT COUNT(*) as count FROM products",
    );
    const existingProducts = existingProductsRes.rows[0];

    // Count returns a string (bigint) in valid Postgres
    if (Number(existingProducts.count) > 0) {
      console.log("📦 Database already seeded, skipping...");
      return;
    }

    // Begin transaction
    await db.query("BEGIN");

    // Insert products with stockQuantity
    for (const p of products) {
      await db.query(
        `
        INSERT INTO products (id, name, sku, category, price, "originalPrice", image, images, rating, reviews, badge, "inStock", "stockQuantity", description, features, specifications)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `,
        [
          p.id,
          p.name,
          p.sku || null,
          p.category,
          p.price,
          p.originalPrice,
          p.image,
          p.images ? JSON.stringify(p.images) : null,
          p.rating,
          p.reviews,
          p.badge,
          p.inStock,
          p.stockQuantity,
          p.description,
          p.features ? JSON.stringify(p.features) : null,
          p.specifications ? JSON.stringify(p.specifications) : null,
        ],
      );
    }

    // Insert categories
    for (const c of categories) {
      await db.query(
        `
        INSERT INTO categories (id, name, icon)
        VALUES ($1, $2, $3)
      `,
        [c.id, c.name, c.icon],
      );
    }

    await db.query("COMMIT");

    console.log(
      `✅ Seeded ${products.length} products and ${categories.length} categories`,
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Seed default admin user
export async function seedAdminUser() {
  try {
    const existingAdminRes = await db.query(
      "SELECT COUNT(*) as count FROM admin_users",
    );
    const existingAdmin = existingAdminRes.rows[0];

    if (Number(existingAdmin.count) > 0) {
      console.log("👤 Admin user already exists, skipping...");
      return;
    }

    // Import bcrypt dynamically to hash password
    const bcrypt = await import("bcryptjs");
    const { v4: uuidv4 } = await import("uuid");

    const adminId = uuidv4();
    const passwordHash = await bcrypt.hash("admin123", 10);

    await db.query(
      `
      INSERT INTO admin_users (id, username, email, "passwordHash", role)
      VALUES ($1, $2, $3, $4, $5)
    `,
      [adminId, "admin", "admin@sherotech.com", passwordHash, "superadmin"],
    );

    console.log("👤 Created default admin user (admin / admin123)");
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}

// Seed default regular user
export async function seedDefaultUser() {
  try {
    const existingUserRes = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE email = $1",
      ["user@sherotech.com"],
    );
    const existingUser = existingUserRes.rows[0];

    if (Number(existingUser.count) > 0) {
      console.log("👤 Default user already exists, skipping...");
      return;
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash("password123", 10);

    await db.query(
      `
      INSERT INTO users (id, email, "passwordHash", name, phone, "emailVerified")
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [
        userId,
        "user@sherotech.com",
        passwordHash,
        "Shero User",
        "0240000000",
        true,
      ],
    );

    console.log("👤 Created default user (user@sherotech.com / password123)");
  } catch (error) {
    console.error("Error seeding default user:", error);
  }
}

// Flush test data (orders, tickets, inquiries, consultations, non-essential users)
// Does NOT touch products or categories.
export async function flushTestData() {
  try {
    console.log("🧹 Flushing test data...");
    await db.query("BEGIN");

    // Order of deletion matters due to foreign keys
    await db.query("DELETE FROM reviews");
    await db.query("DELETE FROM orders");
    await db.query("DELETE FROM activity_logs");
    await db.query("DELETE FROM tickets");
    await db.query("DELETE FROM consultations");
    await db.query("DELETE FROM inquiries");
    await db.query("DELETE FROM user_sessions");
    await db.query("DELETE FROM sessions"); // Admin sessions

    // Delete all users except our new default user (if we want to keep it)
    await db.query("DELETE FROM users WHERE email != $1", [
      "user@sherotech.com",
    ]);

    await db.query("COMMIT");
    console.log(
      "✨ Test data flushed successfully. Products and categories preserved.",
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("❌ Error flushing test data:", error);
  }
}
