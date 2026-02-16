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
import expensesRoutes from "./routes/expenses";

// Load environment variables
dotenv.config();

// Validate required environment variables at startup
function validateEnvironment() {
  const required = ["DATABASE_URL", "SUPABASE_URL", "SUPABASE_KEY", "PORT"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `❌ FATAL: Missing required environment variables: ${missing.join(", ")}`,
    );
    process.exit(1);
  }

  // Validate DATABASE_URL format
  if (!process.env.DATABASE_URL?.startsWith("postgresql://")) {
    console.error(
      "❌ FATAL: DATABASE_URL must be a valid PostgreSQL connection string",
    );
    process.exit(1);
  }

  // Validate Supabase URL
  if (!process.env.SUPABASE_URL?.includes("supabase.co")) {
    console.warn("⚠️ WARNING: SUPABASE_URL looks invalid. Uploads may fail.");
  }

  console.log("✅ All required environment variables present and valid");
}

validateEnvironment();

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
  "https://sherohq.com",
  "https://www.sherohq.com",
  "https://sherohq.vercel.app",
  "https://admin.sherohq.com",
  "https://support.sherohq.com",
  "https://products.sherohq.com",
  "https://shop.sherohq.com",
  "https://api.sherohq.com",
  "http://localhost:5173",
  "http://localhost:5175",
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

      const isAllowed = normalizedAllowedOrigins.includes(normalizedOrigin);

      if (isAllowed) {
        callback(null, true);
      } else {
        console.error(`🚫 CORS blocked for origin: ${origin}`);
        console.warn(`📋 Normalized origin: ${normalizedOrigin}`);
        console.warn(
          `📋 Allowed origins (normalized): ${normalizedAllowedOrigins.join(", ")}`,
        );
        callback(new Error(`CORS policy violation: ${origin}`));
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
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "https://sherotech.onrender.com",
          "https://api.sherohq.com",
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
    noSniff: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
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
  limit: 500,
  standardHeaders: "draft-7",
  legacyHeaders: false,
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
app.use("/api/admin/customers", usersRoutes);
app.use("/api/guides", guidesRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/stats", statRoutes);
app.use("/api/expenses", expensesRoutes);

// Root route - information about the API
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Sherotech API is running",
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);

  // Run database initialization in background (non-blocking)
  (async () => {
    try {
      console.time("⏱️ Database Startup");
      await initializeDatabase();
      await seedAdminUser();
      console.timeEnd("⏱️ Database Startup");
      console.log("✅ Database is ready to handle requests.");
    } catch (err) {
      console.error("❌ Error during database initialization:", err);
      console.warn(
        "⚠️ Server is running but database may not be fully initialized",
      );
    }
  })();
});

export default app;
