import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import * as dotenv from "dotenv";

// Database
import { initializeDatabase } from "./db/database";
import { seedAdminUser } from "./db/seed";
import { adminAuth } from "./middleware/adminAuth";

// Routes
import productRoutes from "./routes/products";
import orderRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";
import reportRoutes from "./routes/reports";
import uploadRoutes from "./routes/upload";
import paymentRoutes from "./routes/payments";
import reviewRoutes from "./routes/reviews";
import authRoutes from "./routes/auth";
import inquiryRoutes from "./routes/inquiry";
import ticketsRoute from "./routes/tickets";
import activityRoutes from "./routes/activity";
import usersRoutes from "./routes/users";
import guidesRoutes from "./routes/guides";
import projectRoutes from "./routes/projects";
import teamRoutes from "./routes/team";
import testimonialRoutes from "./routes/testimonials";
import statRoutes from "./routes/stats";

// Load environment variables
dotenv.config();

const app = express();
app.set("trust proxy", 1); // Trust Render proxy
const PORT = process.env.PORT || 5000;

// Validate DATABASE_URL for common issues (unencoded special characters)
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  // Check for multiple '@' symbols which usually means an unencoded password
  if (dbUrl.includes("@") && dbUrl.split("@").length > 2) {
    console.warn(
      "⚠️ WARNING: DATABASE_URL seems to contain multiple '@' symbols. If your password contains '@', it MUST be URL-encoded (e.g., %40).",
    );
  }
}

// CORS configuration - Support multiple origins
const allowedOrigins = [
  "https://sherotech.vercel.app",
  "https://sherohq.vercel.app",
  "https://sherotech.com",
  "https://www.sherotech.com",
  "https://sherohq.com",
  "https://www.sherohq.com",
  "https://admin.sherohq.com",
  "https://support.sherohq.com",
  "https://products.sherohq.com",
  "https://shop.sherohq.com",
  "https://api.sherohq.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Add FRONTEND_URL or CORS_ORIGIN from environment if it exists
const envOrigin = process.env.FRONTEND_URL || process.env.CORS_ORIGIN;
if (envOrigin) {
  const origins = envOrigin.split(",").map((o) => o.trim());
  origins.forEach((origin) => {
    if (origin && !allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

// CORS MUST be before helmet and other middleware to handle OPTIONS requests correctly
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Normalize origin and allowedOrigins by removing trailing slashes for resilient matching
      const normalizedOrigin = origin.replace(/\/$/, "");
      const normalizedAllowedOrigins = allowedOrigins.map((o) =>
        o.replace(/\/$/, ""),
      );

      const isAllowed =
        normalizedAllowedOrigins.includes(normalizedOrigin) ||
        process.env.NODE_ENV !== "production";

      if (isAllowed) {
        callback(null, true);
      } else {
        console.error(`🚫 CORS blocked for origin: ${origin}`);
        console.warn(`📋 Normalized origin: ${normalizedOrigin}`);
        console.warn(
          `📋 Allowed origins (normalized): ${normalizedAllowedOrigins.join(", ")}`,
        );
        console.warn(`🛠️ NODE_ENV: ${process.env.NODE_ENV}`);
        callback(new Error(`Not allowed by CORS for origin: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Protection",
      "X-Requested-With",
    ],
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
); // Set security headers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CSRF Protection
import { csrfProtection } from "./middleware/csrfProtection";
app.use(csrfProtection);

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Global Rate Limiting - Disabled in development, 500 requests per 15 minutes in production
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === "production" ? 500 : 100000, // Effectively disabled in dev
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== "production", // Skip entirely if not in production
  message: { error: "Too many requests, please try again later." },
});

app.use("/api", globalLimiter);

// Serve uploaded files statically - REMOVED (Migrated to Supabase Storage)
// const uploadsPath = path.resolve(process.cwd(), "uploads");
// if (!fs.existsSync(uploadsPath)) {
//   fs.mkdirSync(uploadsPath, { recursive: true });
// }
// console.log(`📂 Serving uploads from: ${uploadsPath}`);
// app.use(
//   "/uploads",
//   express.static(uploadsPath, {
//     setHeaders: (res) => {
//       res.set("Cross-Origin-Resource-Policy", "cross-origin");
//     },
//   }),
// );

// Health check route
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Sherotech API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/tickets", ticketsRoute);
app.use("/api/upload", uploadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin/reviews", adminAuth, reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/admin", activityRoutes);
app.use("/api/admin/users", usersRoutes);
app.use("/api/guides", guidesRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/stats", statRoutes);

// Root route - information about the API
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Sherotech API is running",
    frontend: process.env.CORS_ORIGIN || "Deployed separately",
    endpoints: {
      health: "/api/health",
      products: "/api/products",
      docs: "See frontend documentation",
    },
  });
});

// API 404 handler - only for /api routes that weren't matched above
app.use("/api", (req: Request, res: Response) => {
  res.status(404).json({ error: "API route not found" });
});

// Removed catch-all route for static files since frontend is deployed independently

// Start server immediately to bind port (crucial for Render/Railway startup checks)
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);

  // Synchronous database initialization for stability
  try {
    console.time("⏱️ Database Startup");
    await initializeDatabase();
    await seedAdminUser();
    console.timeEnd("⏱️ Database Startup");
    console.log("✅ Database is ready to handle requests.");
  } catch (err) {
    console.error("Critical error starting server:", err);
    process.exit(1); // Exit if DB fails
  }
});

export default app;
