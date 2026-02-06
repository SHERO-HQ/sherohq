import db from "./database";
import { v4 as uuidv4 } from "uuid";

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
  condition?: "New" | "Used" | "Refurbished";
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
    condition: "New",
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
    condition: "New",
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
    condition: "Refurbished",
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
    condition: "Used",
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
        INSERT INTO products (id, name, sku, category, price, "originalPrice", image, images, rating, reviews, badge, "inStock", "stockQuantity", description, features, specifications, condition)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
          p.condition || "New",
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
      [adminId, "admin", "admin@sherohq.com", passwordHash, "superadmin"],
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
      ["user@sherohq.com"],
    );

    if (Number.parseInt(existingUserRes.rows[0].count) === 0) {
      // Import bcrypt dynamically to hash password
      const bcrypt = await import("bcryptjs");
      const { v4: uuidv4 } = await import("uuid");

      const passwordHash = await bcrypt.hash("password123", 10);
      await db.query(
        `INSERT INTO users (id, name, email, "passwordHash", role, "isActive", "emailVerified")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          uuidv4(),
          "Shero User",
          "user@sherohq.com",
          passwordHash,
          "customer",
          true,
          true,
        ],
      );
      console.log("👤 Created default user (user@sherohq.com / password123)");
    } else {
      console.log("👤 Default user already exists.");
    }

    // Assign customer role to the user
    await db.query("UPDATE users SET role = 'customer' WHERE email = $1", [
      "user@sherohq.com",
    ]);
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
    await db.query("DELETE FROM users WHERE email != $1", ["user@sherohq.com"]);

    await db.query("COMMIT");
    console.log(
      "✨ Test data flushed successfully. Products and categories preserved.",
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("❌ Error flushing test data:", error);
  }
}

// Seed Team Members
export async function seedTeamMembers() {
  try {
    const existingTeamRes = await db.query(
      "SELECT COUNT(*) as count FROM team_members",
    );
    const existingTeam = existingTeamRes.rows[0];

    if (Number(existingTeam.count) > 0) {
      return;
    }

    const teamMembers = [
      {
        name: "Kwame Mensah",
        role: "Founder & Lead Architect",
        bio: "Visionary leader with 15+ years in digital transformation. Kwame spearheads our mission to bridge Africa's digital divide.",
        image: "https://randomuser.me/api/portraits/men/32.jpg", // Placeholder or use Cloudinary URL
        social: { twitter: "#", linkedin: "#", github: "#" },
      },
      {
        name: "Abena Osei",
        role: "Head of Product Design",
        bio: "Champion of inclusive design. Abena ensures every SHERO product is intuitive and resonates with our diverse user base.",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        social: { twitter: "#", linkedin: "#", github: "#" },
      },
      {
        name: "Kofi Asare",
        role: "Senior Cloud Architect",
        bio: "Infrastructure wizard specializing in high-availability systems. Kofi builds the backbone of our enterprise solutions.",
        image: "https://randomuser.me/api/portraits/men/11.jpg",
        social: { twitter: "#", linkedin: "#", github: "#" },
      },
      {
        name: "Efua Boateng",
        role: "Lead Software Engineer",
        bio: "Full-stack expert with a passion for clean, performant code. Efua leads our engineering teams to excellence.",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        social: {
          twitter: "https://x.com/",
          linkedin: "https://linkedin.com/",
          github: "https://github.com/",
        },
      },
      {
        name: "Yaw Appiah",
        role: "Cybersecurity Lead",
        bio: "Security first. Yaw protects our clients' digital assets with state-of-the-art protocols and proactive monitoring.",
        image: "https://randomuser.me/api/portraits/men/86.jpg",
        social: { twitter: "#", linkedin: "#", github: "#" },
      },
      {
        name: "Ama Serwaa",
        role: "Operations Manager",
        bio: "The glue that holds us together. Ama ensures seamless execution and world-class service delivery for every project.",
        image: "https://randomuser.me/api/portraits/women/22.jpg",
        social: { twitter: "#", linkedin: "#", github: "#" },
      },
    ];

    for (const [index, member] of teamMembers.entries()) {
      const id = uuidv4();
      await db.query(
        `INSERT INTO team_members (id, name, role, bio, image, social, "order") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          id,
          member.name,
          member.role,
          member.bio,
          member.image,
          JSON.stringify(member.social),
          index,
        ],
      );
    }
    console.log(`👥 Seeded ${teamMembers.length} team members`);
  } catch (error) {
    console.error("Error seeding team members:", error);
  }
}

// Seed Testimonials
export async function seedTestimonials() {
  try {
    const existingRes = await db.query(
      "SELECT COUNT(*) as count FROM testimonials",
    );
    if (Number(existingRes.rows[0].count) > 0) return;

    const testimonials = [
      {
        quote:
          "SHERO transformed our outdated retail operations into a world-class e-commerce engine. Their understanding of the Ghanaian market dynamic coupled with global tech standards is unmatched.",
        author: "Kwame Mensah",
        role: "CEO",
        company: "Osei Digitals, Accra",
        active: true,
      },
      {
        quote:
          "Their custom inventory software has saved us countless hours. They didn't just provide a tool; they provided a solution that truly understands the scale of West African logistics.",
        author: "Abena Osei",
        role: "Operations Lead",
        company: "Gold Coast Logistics, Kumasi",
        active: true,
      },
      {
        quote:
          "Reliability is key in our industry. SHERO's networking solutions and security protocols have given us the confidence to expand our digital banking services across the region.",
        author: "Kofi Asare",
        role: "CTO",
        company: "Asante Fintech",
        active: true,
      },
      {
        quote:
          "Working with SHERO was a breath of fresh air. They turned our complex brand vision into a seamless digital experience that resonates with our local and international audience.",
        author: "Efua Boateng",
        role: "Creative Director",
        company: "Adinkra Media Group",
        active: true,
      },
    ];

    for (const [index, t] of testimonials.entries()) {
      const id = uuidv4();
      await db.query(
        `INSERT INTO testimonials (id, quote, author, role, company, "order", active) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, t.quote, t.author, t.role, t.company, index, t.active],
      );
    }
    console.log(`💬 Seeded ${testimonials.length} testimonials`);
  } catch (error) {
    console.error("Error seeding testimonials:", error);
  }
}

// Seed Site Stats
export async function seedStats() {
  try {
    const existingRes = await db.query(
      "SELECT COUNT(*) as count FROM site_stats",
    );
    if (Number(existingRes.rows[0].count) > 0) return;

    const stats = [
      {
        label: "Customers",
        value: "1000",
        suffix: "+",
        icon: "Users",
        color: "text-emerald-500",
      },
      {
        label: "Delivered",
        value: "1500",
        suffix: "+",
        icon: "Trophy",
        color: "text-emerald-500",
      },
      {
        label: "Partners",
        value: "5",
        suffix: "+",
        icon: "Globe",
        color: "text-emerald-500",
      },
      {
        label: "Satisfaction",
        value: "99",
        suffix: "%",
        icon: "Activity",
        color: "text-emerald-500",
      },
    ];

    for (const [index, s] of stats.entries()) {
      const id = uuidv4();
      await db.query(
        `INSERT INTO site_stats (id, label, value, suffix, icon, color, "order") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, s.label, s.value, s.suffix, s.icon, s.color, index],
      );
    }
    console.log(`📊 Seeded ${stats.length} site stats`);
  } catch (error) {
    console.error("Error seeding site stats:", error);
  }
}
