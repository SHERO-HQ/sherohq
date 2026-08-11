import { NextRequest} from "next/server";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/drizzle/schema";
import { desc } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { } from "@/lib/activity";
import { apiResponse, validateCsrf } from "@/lib/api-utils";
import { notificationService } from "@/lib/notifications";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const result = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
    return apiResponse.success(result);
  } catch (error) {
    console.error("Fetch inquiries error:", error);
    return apiResponse.error("Failed to fetch inquiries");
  }
}

export async function POST(request: NextRequest) {
  try {
    const csrfError = await validateCsrf(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return apiResponse.error("Missing required fields", 400);
    }

    const id = uuidv4();
    const finalSubject = subject || "General Inquiry";
    
    await db.insert(inquiries).values({
      id,
      name,
      email,
      subject: finalSubject,
      message,
      status: 'pending'
    });

    const inquiryObj = {
      id,
      name,
      email,
      subject: finalSubject,
      message,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    try {
      await Promise.all([
        notificationService.sendInquiryConfirmationEmail(inquiryObj as any),
        notificationService.sendNewInquiryAdminAlert(inquiryObj as any),
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
