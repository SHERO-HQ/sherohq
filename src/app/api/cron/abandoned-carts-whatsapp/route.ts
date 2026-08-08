import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendWhatsAppMessageDirect, storeOutgoingMessage } from "@/lib/whatsapp-messages";

// Standard security check for cron endpoints
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find carts that:
    // 1. Have not had a WhatsApp reminder sent
    // 2. Have been inactive for > 2 hours
    // 3. Have a valid phone number (guest or user)
    // 4. Have items in them
    const result = await query(`
      SELECT 
        ac.id, 
        ac."userId", 
        ac."guestId", 
        ac.items, 
        COALESCE(u.phone, ac."guestPhone") as phone,
        COALESCE(u.name, 'there') as name
      FROM abandoned_carts ac
      LEFT JOIN users u ON ac."userId" = u.id
      WHERE ac."whatsappSent" = false
        AND ac."lastActive" < NOW() - INTERVAL '2 hours'
        AND COALESCE(u.phone, ac."guestPhone") IS NOT NULL
        AND COALESCE(u.phone, ac."guestPhone") <> ''
        AND ac.items IS NOT NULL
        AND ac.items::text <> '[]'
      LIMIT 100
    `);

    const carts = result.rows;
    let sentCount = 0;
    let errorCount = 0;

    for (const cart of carts) {
      const phone = cart.phone as string;
      const name = cart.name as string;
      
      let items = [];
      try {
        items = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items;
      } catch (e) {}

      if (items.length === 0) continue;

      // Construct reminder text (since there might not be an approved template yet)
      const content = `Hi ${name.split(' ')[0]}! We noticed you left some great items in your cart at SHERO Technologies. Complete your order today before they run out! Reply to this message if you need any help with checkout.`;

      try {
        const sendResult = await sendWhatsAppMessageDirect(
          phone,
          content,
          null, // Template name (if approved template is created, replace this null)
          null,
          []
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
          await query(
            `UPDATE abandoned_carts SET "whatsappSent" = true WHERE id = $1`,
            [cart.id]
          );
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

    return NextResponse.json({
      success: true,
      processed: carts.length,
      sent: sentCount,
      failed: errorCount
    });
  } catch (error) {
    console.error("Error in abandoned carts WhatsApp cron:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
