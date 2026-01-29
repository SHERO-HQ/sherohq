import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import path from "node:path";
import * as dotenv from "dotenv";

// Database
import { initializeDatabase } from "./db/database";
import { seedDatabase, seedAdminUser } from "./db/seed";

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

// Load environment variables
dotenv.config();

const app = express();
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
  "https://sherohq.vercel.app",
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

      const isAllowed =
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== "production";

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked for origin: ${origin}`);
        console.warn(`📋 Allowed origins: ${allowedOrigins.join(", ")}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  }),
);

// Other Middleware
app.use(helmet()); // Set security headers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiting - 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.use("/api", globalLimiter);

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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
app.use("/api/upload", uploadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inquiry", inquiryRoutes);

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

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    await seedDatabase();
    await seedAdminUser();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🛒 Products API: http://localhost:${PORT}/api/products`);
      console.log(`🔐 Admin API: http://localhost:${PORT}/api/admin`);
      console.log(`📸 Uploads: http://localhost:${PORT}/uploads`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
