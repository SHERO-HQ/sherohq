import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;
    const result = await db.delete(inquiries).where(eq(inquiries.id, id)).returning({ name: inquiries.name });

    if (result.length === 0) return apiResponse.notFound("Inquiry not found");

    await logActivity(
      admin.id,
      "inquiry_delete",
      "warning",
      `Deleted inquiry from ${result[0].name}`
    );

    return apiResponse.success({ message: "Inquiry deleted successfully" });
  } catch (error) {
    console.error("Delete inquiry error:", error);
    return apiResponse.error("Failed to delete inquiry");
  }
}
