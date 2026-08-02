import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId");

    let result;
    if (jobId) {
      result = await query(`
        SELECT a.*, c.title as "jobTitle"
        FROM job_applications a
        JOIN careers c ON a."jobId" = c.id
        WHERE a."jobId" = $1
        ORDER BY a."createdAt" DESC
      `, [jobId]);
    } else {
      result = await query(`
        SELECT a.*, c.title as "jobTitle"
        FROM job_applications a
        JOIN careers c ON a."jobId" = c.id
        ORDER BY a."createdAt" DESC
      `);
    }

    return apiResponse.success(result.rows);
  } catch (error) {
    console.error("Fetch applications error:", error);
    return apiResponse.error("Failed to fetch applications");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id, status } = await request.json();
    if (!id || !status) return apiResponse.error("ID and status required", 400);

    await query(`UPDATE job_applications SET status = $1 WHERE id = $2`, [status, id]);
    await logActivity(admin.id, "application_status_update", "success", `Updated application ${id} status to ${status}`);

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error("Update application error:", error);
    return apiResponse.error("Failed to update application status");
  }
}
