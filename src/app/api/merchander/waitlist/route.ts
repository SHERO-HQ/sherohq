import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import { apiResponse, validateCsrf } from "@/lib/api-utils";
import { notificationService } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const csrfError = await validateCsrf(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const { name, phone, email, businessType } = body;

    if (!name || !email || !phone || !businessType) {
      return apiResponse.error("Please provide your name, phone number, email, and business type.", 400);
    }

    const id = uuidv4();
    const subject = `Merchander Waitlist: ${businessType}`;
    const message = [
      `Product: Merchander (In Development)`,
      `Applicant Name: ${name}`,
      `Phone Number: ${phone}`,
      `Email Address: ${email}`,
      `Business Type: ${businessType}`,
      `Submitted: ${new Date().toISOString()}`,
    ].join("\n");

    await db.insert(inquiries).values({
      id,
      name,
      email,
      subject,
      message,
      status: "pending",
    });

    const inquiryObj = {
      id,
      name,
      email,
      subject,
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      await Promise.all([
        notificationService.sendInquiryConfirmationEmail(inquiryObj as any),
        notificationService.sendNewInquiryAdminAlert(inquiryObj as any),
      ]);
    } catch (emailErr) {
      console.error("Failed to send waitlist notification emails:", emailErr);
    }

    return apiResponse.success(
      { success: true, message: "Thank you for joining the Merchander early access waitlist!" },
      201
    );
  } catch (error) {
    console.error("Merchander waitlist submission error:", error);
    return apiResponse.error("Failed to submit waitlist application. Please try again.", 500);
  }
}
