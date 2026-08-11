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
    const { status } = await request.json();
    if (status !== "active" && status !== "unsubscribed") {
      return apiResponse.error("Status must be active or unsubscribed", 400);
    }

    const rows = await db.update(newsletterSubscribers)
      .set({
        status,
        unsubscribedAt: status === 'unsubscribed' ? sql`NOW()` : null,
        updatedAt: sql`NOW()`,
      })
      .where(eq(newsletterSubscribers.id, id))
      .returning();

    if (rows.length === 0) {
      return apiResponse.notFound("Subscriber not found");
    }

    return apiResponse.success({ subscriber: rows[0] });
  } catch (error) {
    console.error("Newsletter subscriber status error:", error);
    return apiResponse.error("Failed to update subscriber status");
  }
}
