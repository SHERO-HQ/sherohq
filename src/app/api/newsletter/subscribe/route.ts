import { apiResponse, validateCsrf } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { marketingNotifications } from "@/lib/notifications/services/marketing";
import { canonicalizeEmail } from "@/lib/sanitize";

const NewsletterSubscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const csrfError = await validateCsrf(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const validated = NewsletterSubscribeSchema.parse(body);
    const { email, name, phone, source = "footer" } = validated;

    const normalizedEmail = canonicalizeEmail(email);
    const unsubscribeToken = randomBytes(24).toString("hex");

    const existing = await db
      .select({ 
        status: newsletterSubscribers.status, 
        unsubscribeToken: newsletterSubscribers.unsubscribeToken 
      })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, normalizedEmail));
      
    const isNewSubscription = existing.length === 0 || existing[0].status !== 'active';

    await db.insert(newsletterSubscribers).values({
      id: uuidv4(),
      email: normalizedEmail,
      phone: phone || null,
      name: name || null,
      source: source,
      status: 'active',
      unsubscribeToken: unsubscribeToken,
      subscribedAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`
    }).onConflictDoUpdate({
      target: newsletterSubscribers.email,
      set: {
        phone: sql`COALESCE(EXCLUDED.phone, ${newsletterSubscribers.phone})`,
        name: sql`COALESCE(EXCLUDED.name, ${newsletterSubscribers.name})`,
        source: sql`EXCLUDED.source`,
        status: 'active',
        unsubscribeToken: sql`COALESCE(${newsletterSubscribers.unsubscribeToken}, EXCLUDED."unsubscribeToken")`,
        unsubscribedAt: null,
        updatedAt: sql`CURRENT_TIMESTAMP`
      }
    });

    if (isNewSubscription) {
      const actualToken = existing.length > 0 && existing[0].unsubscribeToken
        ? existing[0].unsubscribeToken
        : unsubscribeToken;
        
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
      const unsubscribeUrl = `${baseUrl.replace(/\/$/, "")}/newsletter/unsubscribe/${actualToken}`;
      
      // Send email asynchronously without blocking the response
      marketingNotifications.sendNewsletterWelcomeEmail(normalizedEmail, unsubscribeUrl).catch((err) => {
        console.error("Failed to send welcome email:", err);
      });
    }

    return apiResponse.success({ success: true, message: "Subscription successful" });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return apiResponse.error("Failed to subscribe", 500);
  }
}
