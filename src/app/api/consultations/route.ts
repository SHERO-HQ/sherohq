import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";
import { notificationService } from "@/lib/notifications";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await query(`SELECT * FROM consultations ORDER BY "createdAt" DESC`);
    return apiResponse.success(result.rows);
  } catch (error) {
    console.error("Fetch consultations error:", error);
    return apiResponse.error("Failed to fetch consultations");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, service, date, time, message } = body;

    if (!name || !email || !service || !date || !time) {
      return apiResponse.error("Missing required fields", 400);
    }

    const id = uuidv4();
    await query(
      `INSERT INTO consultations (id, name, email, phone, service, date, time, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')`,
      [id, name, email, phone || null, service, date, time, message || null]
    );

    await logActivity(null, "Consultation Requested", "info", `New consultation for ${service} from ${name}`);

    const consultationObj = {
      id,
      name,
      email,
      phone,
      service,
      date,
      time,
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      await Promise.all([
        notificationService.sendConsultationScheduledEmail(consultationObj),
        notificationService.sendNewConsultationAdminAlert(consultationObj),
      ]);
    } catch (emailErr) {
      console.error("Failed to send consultation emails:", emailErr);
    }

    return apiResponse.success({ success: true, message: "Consultation scheduled" }, 201);
  } catch (error) {
    console.error("Create consultation error:", error);
    return apiResponse.error("Failed to schedule consultation");
  }
}
