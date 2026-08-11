import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { notificationService } from "@/lib/notifications";
import { apiResponse, validateCronAuth } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const cronError = validateCronAuth(request);
    if (cronError) return cronError;

    // Query abandoned carts that haven't received an email,
    // where the last activity was between 1 and 48 hours ago,
    // and where the cart has items and belongs to a known user (with email).
    const result = await db.execute(sql`
      SELECT ac.id, ac.items, ac."userId", u.email, u.name as "firstName" 
      FROM abandoned_carts ac
      JOIN users u ON ac."userId" = u.id
      WHERE ac."emailSent" = false 
      AND ac."lastActive" < NOW() - INTERVAL '1 hour'
      AND ac."lastActive" > NOW() - INTERVAL '48 hours'
      AND jsonb_array_length(ac.items) > 0
    `);

    const carts = result.rows || result; // Fallback in case of driver changes

    let emailsSent = 0;
    for (const cart of carts as any[]) {
      const items = cart.items;
      try {
        await notificationService.sendAbandonedCartEmail(
          cart.email,
          cart.firstName,
          items,
          `${process.env.NEXT_PUBLIC_SITE_URL || "https://shop.sherohq.com"}/shop/checkout`
        );
        
        await db.execute(sql`
          UPDATE abandoned_carts SET "emailSent" = true WHERE id = ${cart.id}
        `);
        emailsSent++;
      } catch (err) {
        console.error(`Failed to send abandoned cart email to ${cart.email}:`, err);
      }
    }

    return apiResponse.success({ success: true, processed: carts.length, emailsSent });
  } catch (error) {
    console.error("Cron job error:", error);
    return apiResponse.error("Internal Server Error");
  }
}
