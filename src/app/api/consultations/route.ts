import { NextRequest} from "next/server";
import { db } from "@/lib/db";
import { consultations } from "@/lib/drizzle/schema";
import { desc } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";
import { apiResponse, validateCsrf } from "@/lib/api-utils";
import { notificationService } from "@/lib/notifications";
import { sanitizeText, canonicalizeEmail, sanitizePhone } from "@/lib/sanitize";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const rows = await db.query.consultations.findMany({
      orderBy: [desc(consultations.createdAt)],
    });
    return apiResponse.success(rows);
  } catch (error) {
    console.error("Fetch consultations error:", error);
    return apiResponse.error("Failed to fetch consultations");
  }
}

export async function POST(request: NextRequest) {
  try {
    const csrfError = await validateCsrf(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const { name, email, phone, service, date, time, message } = body;

    if (!name || !email || !service || !date || !time) {
      return apiResponse.error("Missing required fields", 400);
    }

    const sanitizedName = sanitizeText(name as string);
    const sanitizedEmail = canonicalizeEmail(email as string);
    const sanitizedPhone = phone ? sanitizePhone(phone as string) : null;
    const sanitizedService = sanitizeText(service as string);
    const sanitizedMessage = message ? sanitizeText(message as string) : null;

    const id = uuidv4();
    await db.insert(consultations).values({
      id, name: sanitizedName, email: sanitizedEmail, phone: sanitizedPhone, service: sanitizedService, date, time, message: sanitizedMessage, status: 'pending'
    });

    await logActivity(null, "Consultation Requested", "info", `New consultation for ${sanitizedService} from ${sanitizedName}`);

    const consultationObj = {
      id,
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone || undefined,
      service: sanitizedService,
      date,
      time,
      message: sanitizedMessage || undefined,
      status: "pending",
      createdAt: new Date().toISOString()};

    try {
      await Promise.allSettled([
        notificationService.sendConsultationScheduledEmail(consultationObj),
        notificationService.sendConsultationScheduledWhatsApp(consultationObj),
        notificationService.sendNewConsultationAdminAlert(consultationObj),
      ]);
    } catch (notifyErr) {
      console.error("Failed to send consultation notifications:", notifyErr);
    }

    return apiResponse.success({ success: true, message: "Consultation scheduled" }, 201);
  } catch (error) {
    console.error("Create consultation error:", error);
    return apiResponse.error("Failed to schedule consultation");
  }
}
