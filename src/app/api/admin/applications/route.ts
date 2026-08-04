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

    // Fetch application details before updating
    const appResult = await query(`
      SELECT a."applicantEmail", a."applicantName", c.title as "jobTitle"
      FROM job_applications a
      JOIN careers c ON a."jobId" = c.id
      WHERE a.id = $1
    `, [id]);

    await query(`UPDATE job_applications SET status = $1 WHERE id = $2`, [status, id]);
    await logActivity(admin.id, "application_status_update", "success", `Updated application ${id} status to ${status}`);

    if (appResult.rows.length > 0) {
      const { applicantEmail, applicantName, jobTitle } = appResult.rows[0];
      import("@/lib/notifications/services/careers").then(({ sendApplicationStatusEmail }) => {
        sendApplicationStatusEmail(applicantEmail, applicantName, jobTitle, status)
          .catch((err) => console.error("Error sending status email:", err));
      });
    }

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error("Update application error:", error);
    return apiResponse.error("Failed to update application status");
  }
}
