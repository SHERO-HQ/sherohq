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
    const { phone, name } = await request.json();
    const normalizedPhone =
      typeof phone === "string" && phone.trim() ? phone.trim() : null;
    const normalizedName =
      typeof name === "string" && name.trim() ? name.trim() : null;

    const result = await query(
      `UPDATE newsletter_subscribers
       SET phone = $1,
           name = COALESCE($2, name),
           "updatedAt" = NOW()
       WHERE id = $3
       RETURNING id, email, phone, name, source, status, "subscribedAt",
                 "unsubscribedAt", "lastCampaignAt", "createdAt", "updatedAt"`,
      [normalizedPhone, normalizedName, id],
    );

    if (result.rowCount === 0) {
      return apiResponse.notFound("Subscriber not found");
    }

    return apiResponse.success({ subscriber: result.rows[0] });
  } catch (error) {
    console.error("Newsletter subscriber contact error:", error);
    return apiResponse.error("Failed to update subscriber contact");
  }
}
