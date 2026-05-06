import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await query(`SELECT * FROM newsletter_campaigns ORDER BY "createdAt" DESC`);
    return apiResponse.success({ campaigns: result.rows });
  } catch (error) {
    console.error("Fetch campaigns error:", error);
    return apiResponse.error("Failed to fetch campaigns");
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { subject, content, type, scheduledAt } = await request.json();
    if (!subject || !content) return apiResponse.error("Subject and content required", 400);

    const id = uuidv4();
    await query(
      `INSERT INTO newsletter_campaigns (id, subject, content, type, status, "scheduledAt", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [id, subject, content, type || "manual", scheduledAt ? "scheduled" : "draft", scheduledAt || null]
    );

    await logActivity(admin.id, "newsletter_campaign_create", "success", `Created campaign: ${subject}`);

    return apiResponse.success({ id, subject, status: scheduledAt ? "scheduled" : "draft" }, 201);
  } catch (error) {
    console.error("Create campaign error:", error);
    return apiResponse.error("Failed to create campaign");
  }
}
