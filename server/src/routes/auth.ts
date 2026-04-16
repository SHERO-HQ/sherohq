import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "node:crypto";
import { rateLimit } from "express-rate-limit";
import db from "../db/database";
import { notificationService } from "../services/NotificationService";
import { validateBody } from "../middleware/validate";
import {
  RegisterSchema,
  LoginSchema,
  UpdateProfileSchema,
  VerifyEmailSchema,
  ResendVerificationSchema,
  UpdateAvatarSchema,
  ChangePasswordSchema,
} from "../schemas";
import {
  USER_SESSION_COOKIE,
  getTokenFromRequest,
  getSessionCookieOptions,
  getClearSessionCookieOptions,
} from "../utils/sessionAuth";

const router = express.Router();

// Rate limiting for auth routes: Enabled in all environments
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Too many attempts, please try again in 15 minutes." },
});

// Helper function to get user from token
async function getUserFromRequest(req: express.Request) {
  const token = getTokenFromRequest(req, USER_SESSION_COOKIE);
  if (!token) {
    return null;
  }

  const result = await db.query(
    `SELECT users.*, user_sessions."expiresAt" as "sessionExpiry" FROM user_sessions
       JOIN users ON user_sessions."userId" = users.id
       WHERE user_sessions.token = $1 AND user_sessions."expiresAt" > NOW()`,
    [token],
  );

  const session = result.rows[0];

  if (!session) return null;

  return session;
}

// Register
router.post(
  "/register",
  authLimiter,
  validateBody(RegisterSchema),
  async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;

      // Check if user exists
      const check = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (check.rowCount && check.rowCount > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      // Generate verification token (expires in 30 minutes)
      const verificationToken = randomBytes(32).toString("hex");
      const verificationExpiry = new Date(
        Date.now() + 30 * 60 * 1000,
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

      res.cookie(
        USER_SESSION_COOKIE,
        token,
        getSessionCookieOptions(30 * 24 * 60 * 60 * 1000),
      );

      // Send verification email (async, don't block response)
      notificationService
        .sendVerificationEmail(email, verificationToken, name)
        .catch((err) =>
          console.error("Failed to send verification email:", err),
        );

      res.status(201).json({
        success: true,
        token,
        user: { id: userId, email, name, phone, emailVerified: false },
      });
    } catch (error) {
      console.error("Register error:", error);
      const isDev = process.env.NODE_ENV === "development";
      res.status(500).json({
        error: "Internal server error",
        ...(isDev && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    }
  },
);

// Verify Email
router.post(
  "/verify-email",
  validateBody(VerifyEmailSchema),
  async (req, res) => {
    try {
      const { token } = req.body;

      const result = await db.query(
        'SELECT * FROM users WHERE "verificationToken" = $1',
        [token],
      );
      const user = result.rows[0];

      if (!user) {
        return res.status(400).json({ error: "Invalid verification token" });
      }

      // Check if token expired
      if (new Date(user.verificationExpiry) < new Date()) {
        return res.status(400).json({
          error: "Verification token has expired. Please request a new one.",
        });
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
      const isDev = process.env.NODE_ENV === "development";
      res.status(500).json({
        error: "Internal server error",
        ...(isDev && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    }
  },
);

// Resend Verification Email
router.post(
  "/resend-verification",
  authLimiter,
  validateBody(ResendVerificationSchema),
  async (req, res) => {
    try {
      const { email } = req.body;

      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      const user = result.rows[0];

      if (!user) {
        // Don't reveal if email exists for security
        return res.json({
          success: true,
          message: "If the email exists, a verification link has been sent.",
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: "Email is already verified" });
      }

      // Generate new token (expires in 30 minutes)
      const verificationToken = randomBytes(32).toString("hex");
      const verificationExpiry = new Date(
        Date.now() + 30 * 60 * 1000,
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
      const isDev = process.env.NODE_ENV === "development";
      res.status(500).json({
        error: "Internal server error",
        ...(isDev && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    }
  },
);

// Login
router.post(
  "/login",
  authLimiter,
  validateBody(LoginSchema),
  async (req, res) => {
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

      // Always run bcrypt comparison to prevent timing attacks
      const fakeHash =
        "$2a$10$fakeHashForTimingConsistencyPreventionXXXXXXXXXXXXXXXXXXXXXXXX";
      console.time(`  🔐 Bcrypt Compare [${email}]`);
      const isMatch = await bcrypt.compare(
        password,
        user?.passwordHash || fakeHash,
      );
      console.timeEnd(`  🔐 Bcrypt Compare [${email}]`);

      if (!user || !isMatch) {
        console.warn(`❌ Login failed: Invalid credentials for ${email}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check if account is active
      if (user.isActive === false) {
        console.warn(`🚫 Login blocked: Account deactivated for ${email}`);
        return res.status(403).json({
          error: "Your account has been deactivated. Please contact support.",
        });
      }

      // Check for password expiration (6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const passwordExpired = user.passwordUpdatedAt
        ? new Date(user.passwordUpdatedAt) < sixMonthsAgo
        : false;
      const mustReset = !!user.passwordResetRequired || passwordExpired;

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

      res.cookie(
        USER_SESSION_COOKIE,
        token,
        getSessionCookieOptions(30 * 24 * 60 * 60 * 1000),
      );
      console.timeEnd(`  📝 Create Session [${email}]`);

      console.log(`✅ User logged in: ${email}`);
      console.timeEnd(`⏱️ Login Process [${email}]`);

      res.json({
        success: true,
        token,
        mustReset,
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
      const isDev = process.env.NODE_ENV === "development";
      res.status(500).json({
        error: "Internal server error",
        ...(isDev && {
          details: error instanceof Error ? error.message : String(error),
        }),
      });
    }
  },
);

// Get User (Me)
router.get("/me", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const passwordExpired = user.passwordUpdatedAt
      ? new Date(user.passwordUpdatedAt) < sixMonthsAgo
      : false;
    const mustReset = !!user.passwordResetRequired || passwordExpired;

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
      mustReset,
    });
  } catch (error) {
    console.error("Get Me error:", error);
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      error: "Internal server error",
      ...(isDev && {
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    });
  }
});

// Update Profile
router.put("/profile", validateBody(UpdateProfileSchema), async (req, res) => {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
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
      return res.status(400).json({ error: "No fields to update" });
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
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      error: "Internal server error",
      ...(isDev && {
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    const token = getTokenFromRequest(req, USER_SESSION_COOKIE);
    if (token) {
      await db.query("DELETE FROM user_sessions WHERE token = $1", [token]);
    }

    res.cookie(USER_SESSION_COOKIE, "", getClearSessionCookieOptions());
    res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
});

// Upload Avatar
router.put("/avatar", validateBody(UpdateAvatarSchema), async (req, res) => {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { avatarUrl } = req.body;

    await db.query("UPDATE users SET avatar = $1 WHERE id = $2", [
      avatarUrl,
      user.id,
    ]);

    res.json({
      success: true,
      user: {
        ...user,
        avatar: avatarUrl,
      },
    });
  } catch (error) {
    console.error("Update avatar error:", error);
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      error: "Internal server error",
      ...(isDev && {
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    });
  }
});

// Change Password
router.post(
  "/change-password",
  authLimiter,
  validateBody(ChangePasswordSchema),
  async (req, res) => {
    try {
      const user = await getUserFromRequest(req);

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { password } = req.body;

      if (!password || password.length < 8) {
        return res
          .status(400)
          .json({ error: "Password must be at least 8 characters long" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await db.query(
        `UPDATE users 
             SET "passwordHash" = $1, "passwordResetRequired" = false, "passwordUpdatedAt" = CURRENT_TIMESTAMP 
             WHERE id = $2`,
        [hashedPassword, user.id],
      );

      console.log(`🔐 Password changed for user: ${user.email}`);

      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ error: "Failed to update password" });
    }
  },
);

export default router;
