import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUserFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { z } from "zod";

const SyncCartSchema = z.object({
  guestId: z.string().optional(),
  items: z.array(z.any()),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession();
    const body = await request.json();

    const result = SyncCartSchema.safeParse(body);
    if (!result.success) {
      return apiResponse.error("Invalid cart data", 400);
    }

    const { guestId, items } = result.data;
    
    // Do not sync completely empty carts if they were never created
    if (!user && !guestId) {
       return apiResponse.success({ message: "No identifiers provided" });
    }

    const resolvedGuestId = guestId || "unknown-guest";

    if (user) {
      // Upsert cart for logged in user
      await query(
        `INSERT INTO abandoned_carts ("userId", items, "lastActive")
         VALUES ($1, $2, NOW())
         ON CONFLICT ("userId") DO UPDATE SET
         items = EXCLUDED.items,
         "lastActive" = NOW(),
         "emailSent" = false`,
        [user.id, JSON.stringify(items)]
      );
    } else {
      // Upsert cart for guest
      await query(
        `INSERT INTO abandoned_carts ("guestId", items, "lastActive")
         VALUES ($1, $2, NOW())
         ON CONFLICT ("guestId") DO UPDATE SET
         items = EXCLUDED.items,
         "lastActive" = NOW()`,
        [resolvedGuestId, JSON.stringify(items)]
      );
    }

    return apiResponse.success({ synced: true });
  } catch (error) {
    console.error("Cart sync error:", error);
    return apiResponse.error("Failed to sync cart");
  }
}
