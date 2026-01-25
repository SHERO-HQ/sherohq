import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import db from "../db/database";
import { notificationService } from "../services/NotificationService";

const router = express.Router();

// Helper function to get user from token
function getUserFromToken(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  const session = db
    .prepare(
      `SELECT users.*, user_sessions.expiresAt as sessionExpiry FROM user_sessions 
       JOIN users ON user_sessions.userId = users.id 
       WHERE user_sessions.token = ?`,
    )
    .get(token) as any;

  if (!session) return null;

  // Check expiration
  if (new Date(session.sessionExpiry) < new Date()) return null;

  return session;
}

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password, and name are required" });
      return;
    }

    // Check if user exists
    const existingUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Generate verification token (expires in 24 hours)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ).toISOString();

    db.prepare(
      `INSERT INTO users (id, email, passwordHash, name, phone, emailVerified, verificationToken, verificationExpiry) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      userId,
      email,
      hashedPassword,
      name,
      phone || null,
      0,
      verificationToken,
      verificationExpiry,
    );

    // Auto login
    const token = uuidv4();
    const sessionId = uuidv4();
    // Expires in 30 days
    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    db.prepare(
      "INSERT INTO user_sessions (id, userId, token, expiresAt) VALUES (?, ?, ?, ?)",
    ).run(sessionId, userId, token, expiresAt);

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
router.post("/verify-email", (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: "Verification token is required" });
      return;
    }

    const user = db
      .prepare("SELECT * FROM users WHERE verificationToken = ?")
      .get(token) as any;

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
    db.prepare(
      "UPDATE users SET emailVerified = 1, verificationToken = NULL, verificationExpiry = NULL WHERE id = ?",
    ).run(user.id);

    console.log(`✅ Email verified for user: ${user.email}`);

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Resend Verification Email
router.post("/resend-verification", (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as any;

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
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ).toISOString();

    db.prepare(
      "UPDATE users SET verificationToken = ?, verificationExpiry = ? WHERE id = ?",
    ).run(verificationToken, verificationExpiry, user.id);

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
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as any;

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = uuidv4();
    const sessionId = uuidv4();
    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    db.prepare(
      "INSERT INTO user_sessions (id, userId, token, expiresAt) VALUES (?, ?, ?, ?)",
    ).run(sessionId, user.id, token, expiresAt);

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
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get User (Me)
router.get("/me", (req, res) => {
  const user = getUserFromToken(req.headers.authorization);

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
});

// Update Profile
router.put("/profile", (req, res) => {
  try {
    const user = getUserFromToken(req.headers.authorization);

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, phone, shippingAddress } = req.body;

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }

    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone);
    }

    if (shippingAddress !== undefined) {
      updates.push("shippingAddress = ?");
      values.push(JSON.stringify(shippingAddress));
    }

    if (updates.length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    values.push(user.id);

    db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(
      ...values,
    );

    // Fetch updated user
    const updatedUser = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(user.id) as any;

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
router.post("/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    db.prepare("DELETE FROM user_sessions WHERE token = ?").run(token);
  }
  res.json({ success: true });
});

export default router;
