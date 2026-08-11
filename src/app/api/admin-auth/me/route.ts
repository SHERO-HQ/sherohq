import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.success({ success: false, admin: null });
    }

    return apiResponse.success({ admin });
  } catch (error) {
    console.error("Admin me error:", error);
    return apiResponse.success({ success: false, admin: null });
  }
}
