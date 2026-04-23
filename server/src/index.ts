import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import * as dotenv from "dotenv";
import * as fs from "node:fs";
import * as path from "node:path";

// Database
import { initializeDatabase } from "./db/database";
import { checkDatabaseHealth } from "./db/database";
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
import analyticsRoutes from "./routes/analytics";
import newsletterRoutes from "./routes/newsletter";
import { processDueScheduledCampaigns } from "./routes/newsletter";
import searchRoutes from "./routes/search";

// Load environment variables
dotenv.config();

// Validate required environment variables at startup
function validateEnvironment() {
  const required = ["DATABASE_URL", "PORT"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `❌ FATAL: Missing required environment variables: ${missing.join(", ")}`,
    );
    process.exit(1);
  }

  // Accept both postgres:// and postgresql:// connection string schemes.
  const dbUrl = process.env.DATABASE_URL ?? "";
  const isPostgresUrl =
    dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://");

  if (!isPostgresUrl) {
    console.error(
      "❌ FATAL: DATABASE_URL must start with postgresql:// or postgres://",
    );
    process.exit(1);
  }

  // Supabase is optional for non-upload/database-only deployments.
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.warn(
      "⚠️ WARNING: SUPABASE_URL/SUPABASE_KEY missing. Upload features may fail.",
    );
  } else if (!process.env.SUPABASE_URL.includes("supabase.co")) {
    console.warn("⚠️ WARNING: SUPABASE_URL looks invalid. Uploads may fail.");
  }

  console.log("✅ All required environment variables present and valid");
}

validateEnvironment();

const app = express();

/**
 * Trust the first proxy in front of the app (e.g., Render, Vercel, Cloudflare).
 * This is essential for correct client IP detection, rate limiting, and secure cookies.
 */
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

const NEWSLETTER_SCHEDULER_ENABLED =
  process.env.NEWSLETTER_SCHEDULER_ENABLED === "true";
const NEWSLETTER_SCHEDULER_INTERVAL_MS = Number.parseInt(
  process.env.NEWSLETTER_SCHEDULER_INTERVAL_MS || "60000",
  10,
);
const NEWSLETTER_MAX_CAMPAIGNS_PER_TICK = Number.parseInt(
  process.env.NEWSLETTER_MAX_CAMPAIGNS_PER_TICK || "3",
  10,
);

let newsletterSchedulerRunning = false;

function startNewsletterScheduler() {
  if (!NEWSLETTER_SCHEDULER_ENABLED) {
    console.log(
      "📭 Newsletter scheduler disabled (set NEWSLETTER_SCHEDULER_ENABLED=true to enable)",
    );
    return;
  }

  const intervalMs = Number.isInteger(NEWSLETTER_SCHEDULER_INTERVAL_MS)
    ? Math.max(10000, NEWSLETTER_SCHEDULER_INTERVAL_MS)
    : 60000;
  const maxPerTick = Number.isInteger(NEWSLETTER_MAX_CAMPAIGNS_PER_TICK)
    ? Math.max(1, NEWSLETTER_MAX_CAMPAIGNS_PER_TICK)
    : 3;

  console.log(
    `⏲️ Newsletter scheduler enabled: interval=${intervalMs}ms, maxPerTick=${maxPerTick}`,
  );

  setInterval(async () => {
    if (newsletterSchedulerRunning) {
      return;
    }

    newsletterSchedulerRunning = true;
    try {
      const processed = await processDueScheduledCampaigns({
        maxToProcess: maxPerTick,
      });
      if (processed > 0) {
        console.log(
          `📨 Scheduler processed ${processed} scheduled campaign(s)`,
        );
      }
    } catch (error) {
      console.error("❌ Newsletter scheduler tick failed:", error);
    } finally {
      newsletterSchedulerRunning = false;
    }
  }, intervalMs);
}

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
  "https://pharmasyst.sherohq.com", // Added for new project domain
  "https://admin.sherohq.com",
  "https://support.sherohq.com",
  "https://products.sherohq.com",
  "https://shop.sherohq.com",
  "https://api.sherohq.com",
  "https://sherotech.onrender.com",
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

      let isAllowed = normalizedAllowedOrigins.includes(normalizedOrigin);

      // Also allow any subdomain of sherohq.com or onrender.com for flexibility
      if (!isAllowed) {
        if (
          normalizedOrigin.endsWith(".sherohq.com") ||
          normalizedOrigin.endsWith(".onrender.com")
        ) {
          isAllowed = true;
        }
      }

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Origin rejected: ${origin}`);
        // Deny origin gracefully without throwing error to main app
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Protection",
      "X-Order-Access-Token",
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
          ...allowedOrigins.filter((o) => o.startsWith("https://")),
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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CSRF Protection
import { csrfProtection } from "./middleware/csrfProtection";
app.use(csrfProtection);

// Request Logging & Metadata Middleware
app.use((req, res, next) => {
  const requestId = uuidv4().substring(0, 8);
  const start = Date.now();

  // Attach request metadata
  (req as any).id = requestId;

  // Log on response finish
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const url = req.url;

    const logMsg = `[${requestId}] ${method} ${url} ${status} - ${duration}ms`;

    if (status >= 500) {
      console.error(`🔴 ${logMsg}`);
    } else if (status >= 400) {
      console.warn(`🟡 ${logMsg}`);
    } else {
      const isHealth = url.includes("/health");
      if (!isHealth || process.env.DEBUG === "true") {
        console.log(`🟢 ${logMsg}`);
      }
    }
  });

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

// Health check route (process + real DB check)
app.get("/api/health", async (req: Request, res: Response) => {
  const db = await checkDatabaseHealth(5000);

  if (!db.ok) {
    return res.status(503).json({
      status: "degraded",
      message: "Sherotech API is running but database is unavailable",
      db,
      timestamp: new Date().toISOString(),
    });
  }

  return res.json({
    status: "ok",
    message: "Sherotech API and database are healthy",
    db,
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
app.use("/api/analytics", analyticsRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/admin/search", searchRoutes);

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

// ─── Global Express Error Handler ────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(
  (
    err: Error & { status?: number },
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const isDev = process.env.NODE_ENV !== "production";
    console.error(
      `[${new Date().toISOString()}] Error on ${req.method} ${req.url}:`,
      err,
    );
    if (res.headersSent) return;
    res.status(err.status ?? 500).json({
      error: isDev ? err.message : "Internal server error",
      ...(isDev && { stack: err.stack }),
    });
  },
);

// ─── Process-level crash guards ───────────────────────────────────────────────
const crashLogPath = path.resolve(process.cwd(), "crash.log");

function logCrash(type: string, error: any) {
  const message = `
[${new Date().toISOString()}] 💥 ${type}:
${error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
--------------------------------------------------------------------------------
`;
  try {
    fs.appendFileSync(crashLogPath, message);
  } catch (e) {
    console.error("Failed to write to crash log:", e);
  }
}

process.on("uncaughtException", (err: any) => {
  // Ignore EPIPE errors which happen if stdout/stderr is closed (common in dev environments)
  if (err.code === "EPIPE") {
    return;
  }
  
  try {
    console.error("💥 uncaughtException — shutting down:", err);
    logCrash("uncaughtException", err);
  } catch (e) {
    // If logging fails (e.g. EPIPE on console.error), we just exit
  }
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 unhandledRejection:", reason);
  logCrash("unhandledRejection", reason);
  process.exit(1);
});

// Removed catch-all route for static files since frontend is deployed independently

// Start server immediately to bind port (crucial for Render/Railway startup checks)
app.listen(PORT as number, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);

  // Run database initialization in background (non-blocking)
  (async () => {
    try {
      console.time("⏱️ Database Startup");
      await initializeDatabase();
      await seedAdminUser();
      startNewsletterScheduler();
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
