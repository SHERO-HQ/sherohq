import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
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
    const result = await query(
      `UPDATE newsletter_campaigns
       SET status = 'failed', "updatedAt" = NOW()
       WHERE id = $1 AND status = 'scheduled'
       RETURNING subject`,
      [id],
    );

    if (result.rowCount === 0) {
      return apiResponse.notFound("Scheduled campaign not found");
    }

    await logActivity(
      admin.id,
      "newsletter_campaign_cancel",
      "warning",
      `Cancelled campaign: ${result.rows[0].subject}`,
    );

    return apiResponse.success({ message: "Campaign cancelled successfully" });
  } catch (error) {
    console.error("Newsletter campaign cancel error:", error);
    return apiResponse.error("Failed to cancel campaign");
  }
}
