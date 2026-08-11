import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || !["admin", "superadmin", "manager"].includes(admin.role)) {
      return apiResponse.unauthorized();
    }

    const result = await db.execute(sql`
      SELECT 
        ac.id, 
        ac."userId", 
        ac."guestId", 
        ac."guestEmail", 
        ac."guestPhone", 
        ac.items, 
        ac."lastActive", 
        u.email as "userEmail", 
        u.name as "userName", 
        u.phone as "userPhone"
       FROM abandoned_carts ac
       LEFT JOIN users u ON ac."userId" = u.id
       ORDER BY ac."lastActive" DESC
    `);

    const rows = (result.rows || result) as Record<string, unknown>[];
    const carts = rows.map((row: any) => {
      let items = [];
      try {
        items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
      } catch (e) {
        items = [];
      }
      
      const cartTotal = items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

      return {
        id: row.id,
        userId: row.userId,
        guestId: row.guestId,
        email: row.userEmail || row.guestEmail,
        name: row.userName || 'Guest User',
        phone: row.userPhone || row.guestPhone,
        items,
        totalValue: cartTotal,
        lastActive: row.lastActive,
      };
    });

    return apiResponse.success(carts);
  } catch (error) {
    console.error("Error fetching abandoned carts:", error);
    return apiResponse.error("Failed to fetch abandoned carts", 500);
  }
}
