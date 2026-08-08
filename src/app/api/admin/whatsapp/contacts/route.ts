import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { whatsappContacts } from "@/lib/drizzle/schema";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    const contacts = await db
      .select()
      .from(whatsappContacts)
      .orderBy(desc(whatsappContacts.lastInteraction));

    return apiResponse.success(contacts);
  } catch (error: any) {
    console.error("Error fetching WhatsApp contacts:", error);
    return apiResponse.error(error.message || "Internal server error", 500);
  }
}
