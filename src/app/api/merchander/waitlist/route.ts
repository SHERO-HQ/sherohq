import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import { apiResponse, validateCsrf } from "@/lib/api-utils";
import { notificationService } from "@/lib/notifications";

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: NextRequest) {
  try {
    const csrfError = await validateCsrf(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const name = clean(body.name, 120);
    const businessName = clean(body.businessName, 160);
    const phone = clean(body.phone, 40);
    const sells = clean(body.sells, 500);

    if (!name || !businessName || !phone || !sells) {
      return apiResponse.error("Please fill in every field.", 400);
    }

    // The inquiries table needs an email and the waitlist does not collect one,
    // so a placeholder address is stored. Contact is by phone.
    const id = uuidv4();
    const email = `${phone.replace(/\D/g, "") || id}@no-email.invalid`;
    const subject = `Merchander waitlist: ${businessName}`;
    const message = [
      `Product: Merchander (In development)`,
      `Name: ${name}`,
      `Business name: ${businessName}`,
      `Phone: ${phone}`,
      `What they sell: ${sells}`,
    ].join("\n");

    await db.insert(inquiries).values({ id, name, email, subject, message, status: "pending" });

    try {
      await notificationService.sendNewInquiryAdminAlert({ name, email, subject, message });
    } catch (emailErr) {
      console.error("Failed to send waitlist alert email:", emailErr);
    }

    return apiResponse.success({ success: true }, 201);
  } catch (error) {
    console.error("Merchander waitlist submission error:", error);
    return apiResponse.error("Something went wrong. Please try again.", 500);
  }
}
