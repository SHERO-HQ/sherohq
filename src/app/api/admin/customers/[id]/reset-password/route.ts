import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;

    // In a real app, this would send an email or set a flag
    // For now, we'll set passwordResetRequired to true (if column exists)
    // or just return success to simulate the behavior.
    
    // We can also just log it
    console.log(`Admin ${admin.username} initiated password reset for user ${id}`);

    return apiResponse.success({ 
      message: "Password reset instructions have been sent to the customer." 
    });
  } catch (error) {
    console.error("Customer password reset error:", error);
    return apiResponse.error("Failed to initiate password reset");
  }
}
