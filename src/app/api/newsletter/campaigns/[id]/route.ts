import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;
    const result = await query(
      `DELETE FROM newsletter_campaigns
       WHERE id = $1
       RETURNING subject`,
      [id],
    );

    if (result.rowCount === 0) {
      return apiResponse.notFound("Campaign not found");
    }

    await logActivity(
      admin.id,
      "newsletter_campaign_delete",
      "warning",
      `Deleted campaign: ${result.rows[0].subject}`,
    );

    return apiResponse.success({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Newsletter campaign delete error:", error);
    return apiResponse.error("Failed to delete campaign");
  }
}
