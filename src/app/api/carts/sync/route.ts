import { NextRequest} from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getUserFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { z } from "zod";

const SyncCartSchema = z.object({
  guestId: z.string().optional(),
  guestEmail: z.string().email().optional().or(z.literal("")),
  guestPhone: z.string().optional().or(z.literal("")),
  items: z.array(z.any())});

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession();
    const body = await request.json();

    const result = SyncCartSchema.safeParse(body);
    if (!result.success) {
      return apiResponse.error("Invalid cart data", 400);
    }

    const { guestId, guestEmail, guestPhone, items } = result.data;
    
    // Do not sync anonymous carts to the database (if no user and no contact info)
    // This prevents the abandoned carts list from filling up with untrackable visitors
    if (!user && !guestEmail && !guestPhone) {
       return apiResponse.success({ message: "Anonymous cart ignored" });
    }

    const resolvedGuestId = guestId || "unknown-guest";

    if (user) {
      // Upsert cart for logged in user
      await db.execute(sql`
        INSERT INTO abandoned_carts ("userId", items, "lastActive")
        VALUES (${user.id}, ${JSON.stringify(items)}, NOW())
        ON CONFLICT ("userId") DO UPDATE SET
        items = EXCLUDED.items,
        "lastActive" = NOW(),
        "emailSent" = false
      `);
    } else {
      // Upsert cart for guest
      await db.execute(sql`
        INSERT INTO abandoned_carts ("guestId", items, "lastActive", "guestEmail", "guestPhone")
        VALUES (${resolvedGuestId}, ${JSON.stringify(items)}, NOW(), ${guestEmail || null}, ${guestPhone || null})
        ON CONFLICT ("guestId") DO UPDATE SET
        items = EXCLUDED.items,
        "lastActive" = NOW(),
        "guestEmail" = COALESCE(${guestEmail || null}, abandoned_carts."guestEmail"),
        "guestPhone" = COALESCE(${guestPhone || null}, abandoned_carts."guestPhone")
      `);
    }

    return apiResponse.success({ synced: true });
  } catch (error) {
    console.error("Cart sync error:", error);
    return apiResponse.error("Failed to sync cart");
  }
}
