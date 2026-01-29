import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "node:crypto";
import { rateLimit } from "express-rate-limit";
import db from "../db/database";
import { notificationService } from "../services/NotificationService";

const router = express.Router();

// Stricter rate limiting for auth routes: 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again in 15 minutes." },
});

// Helper function to get user from token
async function getUserFromToken(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  const result = await db.query(
    `SELECT users.*, user_sessions."expiresAt" as "sessionExpiry" FROM user_sessions 
       JOIN users ON user_sessions."userId" = users.id 
       WHERE user_sessions.token = $1`,
    [token],
  );

  const session = result.rows[0];

  if (!session) return null;

  // Check expiration
  if (new Date(session.sessionExpiry) < new Date()) return null;

  return session;
}

// Register
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password, and name are required" });
      return;
    }

    // Check if user exists
    const check = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (check.rowCount && check.rowCount > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Generate verification token (expires in 24 hours)
    const verificationToken = randomBytes(32).toString("hex");
    const verificationExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ).toISOString();

    await db.query(
      `INSERT INTO users (id, email, "passwordHash", name, phone, "emailVerified", "verificationToken", "verificationExpiry") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        email,
        hashedPassword,
        name,
        phone || null,
        false, // emailVerified boolean
        verificationToken,
        verificationExpiry,
      ],
    );

    // Auto login
    const token = randomBytes(32).toString("hex");
    const sessionId = uuidv4();
    // Expires in 30 days
    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    await db.query(
      'INSERT INTO user_sessions (id, "userId", token, "expiresAt") VALUES ($1, $2, $3, $4)',
      [sessionId, userId, token, expiresAt],
    );

    // Send verification email (async, don't block response)
    notificationService
      .sendVerificationEmail(email, verificationToken, name)
      .catch((err) => console.error("Failed to send verification email:", err));

    res.status(201).json({
      success: true,
      token,
      user: { id: userId, email, name, phone, emailVerified: false },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify Email
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: "Verification token is required" });
      return;
    }

    const result = await db.query(
      'SELECT * FROM users WHERE "verificationToken" = $1',
      [token],
    );
    const user = result.rows[0];

    if (!user) {
      res.status(400).json({ error: "Invalid verification token" });
      return;
    }

    // Check if token expired
    if (new Date(user.verificationExpiry) < new Date()) {
      res.status(400).json({
        error: "Verification token has expired. Please request a new one.",
      });
      return;
    }

    // Mark as verified
    await db.query(
      'UPDATE users SET "emailVerified" = $1, "verificationToken" = NULL, "verificationExpiry" = NULL WHERE id = $2',
      [true, user.id],
    );

    console.log(`✅ Email verified for user: ${user.email}`);

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Resend Verification Email
router.post("/resend-verification", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      // Don't reveal if email exists for security
      res.json({
        success: true,
        message: "If the email exists, a verification link has been sent.",
      });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ error: "Email is already verified" });
      return;
    }

    // Generate new token
    const verificationToken = randomBytes(32).toString("hex");
    const verificationExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ).toISOString();

    await db.query(
      'UPDATE users SET "verificationToken" = $1, "verificationExpiry" = $2 WHERE id = $3',
      [verificationToken, verificationExpiry, user.id],
    );

    // Send email
    notificationService
      .sendVerificationEmail(email, verificationToken, user.name)
      .catch((err) =>
        console.error("Failed to resend verification email:", err),
      );

    res.json({ success: true, message: "Verification email sent" });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔑 Login attempt for: ${email}`);

    console.time(`⏱️ Login Process [${email}]`);

    console.time(`  🔍 DB Query User [${email}]`);
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    console.timeEnd(`  🔍 DB Query User [${email}]`);

    const user = result.rows[0];

    if (!user) {
      console.warn(`❌ Login failed: User not found (${email})`);
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    console.time(`  🔐 Bcrypt Compare [${email}]`);
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.timeEnd(`  🔐 Bcrypt Compare [${email}]`);

    if (!isMatch) {
      console.warn(`❌ Login failed: Wrong password for ${email}`);
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = randomBytes(32).toString("hex");
    const sessionId = uuidv4();
    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    console.time(`  📝 Create Session [${email}]`);
    await db.query(
      'INSERT INTO user_sessions (id, "userId", token, "expiresAt") VALUES ($1, $2, $3, $4)',
      [sessionId, user.id, token, expiresAt],
    );
    console.timeEnd(`  📝 Create Session [${email}]`);

    console.log(`✅ User logged in: ${email}`);
    console.timeEnd(`⏱️ Login Process [${email}]`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        emailVerified: !!user.emailVerified,
        shippingAddress: user.shippingAddress
          ? JSON.parse(user.shippingAddress)
          : null,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get User (Me)
router.get("/me", async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        emailVerified: !!user.emailVerified,
        shippingAddress: user.shippingAddress
          ? JSON.parse(user.shippingAddress)
          : null,
      },
    });
  } catch (error) {
    console.error("Get Me error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update Profile
router.put("/profile", async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, phone, shippingAddress } = req.body;

    // Build update query dynamically
    const updates: string[] = [];
    const values: (string | null)[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      values.push(phone);
      paramIndex++;
    }

    if (shippingAddress !== undefined) {
      updates.push(`"shippingAddress" = $${paramIndex}`);
      values.push(JSON.stringify(shippingAddress));
      paramIndex++;
    }

    if (updates.length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    values.push(user.id);
    await db.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
      values,
    );

    // Fetch updated user
    const result = await db.query("SELECT * FROM users WHERE id = $1", [
      user.id,
    ]);
    const updatedUser = result.rows[0];

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        emailVerified: !!updatedUser.emailVerified,
        shippingAddress: updatedUser.shippingAddress
          ? JSON.parse(updatedUser.shippingAddress)
          : null,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      await db.query("DELETE FROM user_sessions WHERE token = $1", [token]);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
});

export default router;
