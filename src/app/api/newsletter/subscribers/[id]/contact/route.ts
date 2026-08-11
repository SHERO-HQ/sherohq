import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/drizzle/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;
    const { phone, name } = await request.json();
    const normalizedPhone =
      typeof phone === "string" && phone.trim() ? phone.trim() : null;
    const normalizedName =
      typeof name === "string" && name.trim() ? name.trim() : null;

    const rows = await db.update(newsletterSubscribers)
      .set({
        phone: normalizedPhone,
        name: normalizedName ?? undefined,
        updatedAt: sql`NOW()`,
      })
      .where(eq(newsletterSubscribers.id, id))
      .returning();

    if (rows.length === 0) {
      return apiResponse.notFound("Subscriber not found");
    }

    return apiResponse.success({ subscriber: rows[0] });
  } catch (error) {
    console.error("Newsletter subscriber contact error:", error);
    return apiResponse.error("Failed to update subscriber contact");
  }
}
