import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { query } from "@/lib/db";

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

    const result = await query(
      `UPDATE newsletter_subscribers
       SET status = $1,
           "unsubscribedAt" = CASE WHEN $1 = 'unsubscribed' THEN NOW() ELSE NULL END,
           "updatedAt" = NOW()
       WHERE id = $2
       RETURNING id, email, phone, name, source, status, "subscribedAt",
                 "unsubscribedAt", "lastCampaignAt", "createdAt", "updatedAt"`,
      [status, id],
    );

    if (result.rowCount === 0) {
      return apiResponse.notFound("Subscriber not found");
    }

    return apiResponse.success({ subscriber: result.rows[0] });
  } catch (error) {
    console.error("Newsletter subscriber status error:", error);
    return apiResponse.error("Failed to update subscriber status");
  }
}
