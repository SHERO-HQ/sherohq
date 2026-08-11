import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
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
      result = await db.execute(sql`
        SELECT a.*, c.title as "jobTitle"
        FROM job_applications a
        JOIN careers c ON a."jobId" = c.id
        WHERE a."jobId" = ${jobId}
        ORDER BY a."createdAt" DESC
      `);
    } else {
      result = await db.execute(sql`
        SELECT a.*, c.title as "jobTitle"
        FROM job_applications a
        JOIN careers c ON a."jobId" = c.id
        ORDER BY a."createdAt" DESC
      `);
    }

    return apiResponse.success((result.rows || result) as Record<string, unknown>[]);
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
    const appResult = await db.execute(sql`
      SELECT a."applicantEmail", a."applicantName", c.title as "jobTitle"
      FROM job_applications a
      JOIN careers c ON a."jobId" = c.id
      WHERE a.id = ${id}
    `);

    await db.execute(sql`UPDATE job_applications SET status = ${status} WHERE id = ${id}`);
    await logActivity(admin.id, "application_status_update", "success", `Updated application ${id} status to ${status}`);

    const rows = (appResult.rows || appResult) as Record<string, unknown>[];
    if (rows.length > 0) {
      const { applicantEmail, applicantName, jobTitle } = rows[0];
      import("@/lib/notifications/services/careers").then(({ sendApplicationStatusEmail }) => {
        sendApplicationStatusEmail(applicantEmail as string, applicantName as string, jobTitle as string, status)
          .catch((err) => console.error("Error sending status email:", err));
      });
    }

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error("Update application error:", error);
    return apiResponse.error("Failed to update application status");
  }
}
