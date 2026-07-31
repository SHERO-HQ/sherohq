import { NextRequest} from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";
import { notificationService } from "@/lib/notifications";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await query(`SELECT * FROM inquiries ORDER BY "createdAt" DESC`);
    return apiResponse.success(result.rows);
  } catch (error) {
    console.error("Fetch inquiries error:", error);
    return apiResponse.error("Failed to fetch inquiries");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return apiResponse.error("Missing required fields", 400);
    }

    const id = uuidv4();
    const finalSubject = subject || "General Inquiry";
    await query(
      `INSERT INTO inquiries (id, name, email, subject, message, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')`,
      [id, name, email, finalSubject, message]
    );

    const inquiryObj = {
      id,
      name,
      email,
      subject: finalSubject,
      message,
      status: "pending",
      createdAt: new Date().toISOString()};

    try {
      await Promise.all([
        notificationService.sendInquiryConfirmationEmail(inquiryObj),
        notificationService.sendNewInquiryAdminAlert(inquiryObj),
      ]);
    } catch (emailErr) {
      console.error("Failed to send inquiry emails:", emailErr);
    }

    return apiResponse.success({ success: true, message: "Inquiry sent successfully" }, 201);
  } catch (error) {
    console.error("Create inquiry error:", error);
    return apiResponse.error("Failed to send inquiry");
  }
}
