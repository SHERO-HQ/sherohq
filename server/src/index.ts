import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
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

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../../dist")));

// API 404 handler - only for /api routes that weren't matched above
app.use("/api", (req: Request, res: Response) => {
  res.status(404).json({ error: "API route not found" });
});

// Catch-all route for client-side routing
app.get(/.*/, (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

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
