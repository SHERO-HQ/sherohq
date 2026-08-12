import { validateCsrf, apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, userSessions } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { notificationService } from "@/lib/notifications";

import { PasswordSchema } from "@/lib/validations/auth";
import { USER_SESSION_COOKIE, getAuthCookieOptions } from "@/lib/auth";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
  name: z.string().min(1),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const csrfError = await validateCsrf(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const validated = RegisterSchema.parse(body);
    const { email, password, name, phone } = validated;

    const check = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true }
    });

    if (check) {
      return apiResponse.error("Email already registered", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const verificationToken = randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 30 * 60 * 1000);

    await db.insert(users).values({
      id: userId,
      email,
      passwordHash: hashedPassword,
      name,
      phone: phone || null,
      emailVerified: false,
      verificationToken,
      verificationExpiry: verificationExpiry.toISOString(),
    });

    // Auto login
    const token = randomBytes(32).toString("hex");
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(userSessions).values({
      id: sessionId,
      userId,
      token,
      expiresAt: expiresAt.toISOString(),
    });

    const cookieOptions = await getAuthCookieOptions(expiresAt);
    const cookieStore = await cookies();
    cookieStore.set(USER_SESSION_COOKIE, token, cookieOptions);

    // Send verification and welcome emails (async)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
    const verificationLink = `${siteUrl.replace(/\/$/, "")}/verify-email?token=${verificationToken}`;

    notificationService.sendVerificationEmail(email, name, verificationLink).catch((err) => {
      console.error("Failed to send verification email:", err);
    });

    notificationService.sendWelcomeEmail(email, name).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });
    
    return apiResponse.success(
      {
        user: { id: userId, email, name, phone, emailVerified: false },
      },
      201
    );
  } catch (error) {
    console.error("Register error:", error);
    return apiResponse.error("Internal server error", 500);
  }
}
