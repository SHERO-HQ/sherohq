import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    // Mark all received inbound messages from this phone as 'read'
    await query(`
      UPDATE whatsapp_messages 
      SET status = 'read', updated_at = NOW() 
      WHERE sender_wa_id = $1 
        AND direction = 'inbound' 
        AND status = 'received'
    `, [phone]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read", details: error.message || String(error) },
      { status: 500 },
    );
  }
}
