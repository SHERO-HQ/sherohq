import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { notificationService } from "@/lib/notifications";
import { apiResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate cron job request (using an auth token passed in headers/query)
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return apiResponse.unauthorized("Invalid CRON token");
    }

    // Query abandoned carts that haven't received an email,
    // where the last activity was between 1 and 48 hours ago,
    // and where the cart has items and belongs to a known user (with email).
    const result = await query(
      `SELECT ac.id, ac.items, ac."userId", u.email, u.name as "firstName" 
       FROM abandoned_carts ac
       JOIN users u ON ac."userId" = u.id
       WHERE ac."emailSent" = false 
       AND ac."lastActive" < NOW() - INTERVAL '1 hour'
       AND ac."lastActive" > NOW() - INTERVAL '48 hours'
       AND jsonb_array_length(ac.items) > 0`
    );

    const carts = result.rows;

    let emailsSent = 0;
    for (const cart of carts) {
      const items = cart.items;
      try {
        await notificationService.sendAbandonedCartEmail(
          cart.email,
          cart.firstName,
          items,
          `${process.env.NEXT_PUBLIC_APP_URL || "https://shop.sherohq.com"}/shop/checkout`
        );
        
        await query(
          `UPDATE abandoned_carts SET "emailSent" = true WHERE id = $1`,
          [cart.id]
        );
        emailsSent++;
      } catch (err) {
        console.error(`Failed to send abandoned cart email to ${cart.email}:`, err);
      }
    }

    return NextResponse.json({ success: true, processed: carts.length, emailsSent });
  } catch (error) {
    console.error("Cron job error:", error);
    return apiResponse.error("Internal Server Error");
  }
}
