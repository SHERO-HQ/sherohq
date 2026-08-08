import { NextRequest} from "next/server";
import { query } from "@/lib/db";
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
        `INSERT INTO abandoned_carts ("guestId", items, "lastActive", "guestEmail", "guestPhone")
         VALUES ($1, $2, NOW(), $3, $4)
         ON CONFLICT ("guestId") DO UPDATE SET
         items = EXCLUDED.items,
         "lastActive" = NOW(),
         "guestEmail" = COALESCE($3, abandoned_carts."guestEmail"),
         "guestPhone" = COALESCE($4, abandoned_carts."guestPhone")`,
        [resolvedGuestId, JSON.stringify(items), guestEmail || null, guestPhone || null]
      );
    }

    return apiResponse.success({ synced: true });
  } catch (error) {
    console.error("Cart sync error:", error);
    return apiResponse.error("Failed to sync cart");
  }
}
