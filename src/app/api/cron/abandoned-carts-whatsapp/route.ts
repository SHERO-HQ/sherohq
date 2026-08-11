import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { campaignTemplates, abandonedCarts, users } from "@/lib/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendWhatsAppMessageDirect, storeOutgoingMessage } from "@/lib/whatsapp-messages";
import { apiResponse } from "@/lib/api-utils";

// Standard security check for cron endpoints
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return apiResponse.unauthorized("Unauthorized");
  }

  try {
    // Find carts that:
    // 1. Have not had a WhatsApp reminder sent
    // 2. Have been inactive for > 2 hours
    // 3. Have a valid phone number (guest or user)
    // 4. Have items in them
    const carts = await db
      .select({
        id: abandonedCarts.id,
        userId: abandonedCarts.userId,
        guestId: abandonedCarts.guestId,
        items: abandonedCarts.items,
        phone: sql<string>`COALESCE(${users.phone}, ${abandonedCarts.guestPhone})`,
        name: sql<string>`COALESCE(${users.name}, 'there')`,
      })
      .from(abandonedCarts)
      .leftJoin(users, eq(abandonedCarts.userId, users.id))
      .where(
        and(
          eq(abandonedCarts.whatsappSent, false),
          sql`${abandonedCarts.lastActive} < NOW() - INTERVAL '2 hours'`,
          sql`COALESCE(${users.phone}, ${abandonedCarts.guestPhone}) IS NOT NULL`,
          sql`COALESCE(${users.phone}, ${abandonedCarts.guestPhone}) <> ''`,
          sql`${abandonedCarts.items} IS NOT NULL`,
          sql`${abandonedCarts.items}::text <> '[]'`
        )
      )
      .limit(100);

    let sentCount = 0;
    let errorCount = 0;

    for (const cart of carts) {
      const phone = cart.phone;
      const name = cart.name;
      
      let items = [];
      try {
        items = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items;
      } catch (_e) {
        /* ignore error */
      }

      if (items.length === 0) continue;

      // Find the template in the database
      let templateName = null;
      let templateLanguage = null;
      let templateParams: string[] = [];

      try {
        const templateRecord = await db.query.campaignTemplates.findFirst({
          where: and(
            eq(campaignTemplates.name, "abandoned_cart_reminder"),
            eq(campaignTemplates.channel, "whatsapp")
          )
        });

        if (templateRecord) {
          templateName = templateRecord.name;
          templateLanguage = templateRecord.whatsappTemplateLanguage || "en";
          templateParams = [name.split(' ')[0]]; // E.g. pass the user's first name
        }
      } catch (e) {
        console.error("Failed to fetch template:", e);
      }

      // Fallback text if template isn't found/configured properly yet
      const content = `Hi ${name.split(' ')[0]}! We noticed you left some great items in your cart at SHERO Technologies. Complete your order today before they run out! Reply to this message if you need any help with checkout.`;

      try {
        const sendResult = await sendWhatsAppMessageDirect(
          phone,
          content,
          templateName,
          templateLanguage,
          templateParams
        );

        if (sendResult.success && sendResult.messageId) {
          // Log it so we see it in our WhatsApp admin panel
          await storeOutgoingMessage(
            sendResult.messageId,
            null,
            phone.replace(/[^\d]/g, ""),
            process.env.WHATSAPP_PHONE_NUMBER_ID || "unknown",
            content
          );

          // Mark as sent
          await db.update(abandonedCarts)
            .set({ whatsappSent: true })
            .where(eq(abandonedCarts.id, cart.id));
          
          sentCount++;
        } else {
          console.error(`Failed to send WhatsApp reminder to ${phone}:`, sendResult.error);
          errorCount++;
        }
      } catch (e) {
        console.error(`Exception sending WhatsApp reminder to ${phone}:`, e);
        errorCount++;
      }
    }

    return apiResponse.success({
      processed: carts.length,
      sent: sentCount,
      failed: errorCount
    });
  } catch (error) {
    console.error("Error in abandoned carts WhatsApp cron:", error);
    return apiResponse.error(
      "Internal server error",
      500,
      { details: error instanceof Error ? error.message : String(error) }
    );
  }
}
