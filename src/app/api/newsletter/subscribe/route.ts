import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { randomBytes } from "node:crypto";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { marketingNotifications } from "@/lib/notifications/services/marketing";

const NewsletterSubscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = NewsletterSubscribeSchema.parse(body);
    const { email, name, phone, source = "footer" } = validated;

    const normalizedEmail = email.trim().toLowerCase();
    const unsubscribeToken = randomBytes(24).toString("hex");

    const existing = await query(`SELECT status FROM newsletter_subscribers WHERE email = $1`, [normalizedEmail]);
    const isNewSubscription = existing.rows.length === 0 || existing.rows[0].status !== 'active';

    await query(
      `INSERT INTO newsletter_subscribers (id, email, phone, name, source, status, "unsubscribeToken", "subscribedAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, 'active', $6, NOW(), NOW())
       ON CONFLICT (email)
       DO UPDATE SET
         phone = COALESCE(EXCLUDED.phone, newsletter_subscribers.phone),
         name = COALESCE(EXCLUDED.name, newsletter_subscribers.name),
         source = EXCLUDED.source,
         status = 'active',
         "unsubscribeToken" = COALESCE(newsletter_subscribers."unsubscribeToken", EXCLUDED."unsubscribeToken"),
         "unsubscribedAt" = NULL,
         "updatedAt" = NOW()`,
      [uuidv4(), normalizedEmail, phone || null, name || null, source, unsubscribeToken]
    );

    if (isNewSubscription) {
      const actualToken = existing.rows.length > 0 && existing.rows[0].unsubscribeToken
        ? existing.rows[0].unsubscribeToken
        : unsubscribeToken;
        
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
      const unsubscribeUrl = `${baseUrl.replace(/\/$/, "")}/newsletter/unsubscribe/${actualToken}`;
      
      // Send email asynchronously without blocking the response
      marketingNotifications.sendNewsletterWelcomeEmail(normalizedEmail, unsubscribeUrl).catch((err) => {
        console.error("Failed to send welcome email:", err);
      });
    }

    return NextResponse.json({ success: true, message: "Subscription successful" });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
