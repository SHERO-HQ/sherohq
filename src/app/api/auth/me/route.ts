import { apiResponse } from "@/lib/api-utils";
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUserFromSession();

    if (!user) {
      return apiResponse.success({ success: false, user: null });
    }

    return apiResponse.success({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return apiResponse.success({ success: false, user: null });
  }
}
