import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/activity";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;
    const feedbackId = parseInt(id, 10);
    
    if (isNaN(feedbackId)) {
       return apiResponse.error("Invalid ID format", 400);
    }

    const result = await query(
      "DELETE FROM customer_feedback WHERE id = $1 RETURNING *",
      [feedbackId]
    );

    if (result.rowCount === 0) {
      return apiResponse.error("Feedback not found", 404);
    }

    await logActivity(
      admin.id,
      "feedback_delete",
      "success",
      `Deleted site feedback #${feedbackId}`
    );

    return apiResponse.success({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete feedback error:", error);
    return apiResponse.error("Failed to delete feedback");
  }
}
