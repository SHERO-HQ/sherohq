import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { getAdminFromSession, ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function POST() {
  try {
    const admin = await getAdminFromSession();
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

    if (token) {
      await query("DELETE FROM sessions WHERE token = $1", [token]);
    }

    cookieStore.set(ADMIN_SESSION_COOKIE, "", { maxAge: 0, path: "/" });

    if (admin) {
      await logActivity(
        admin.id,
        "admin_logout",
        "info",
        `Admin logged out: ${admin.username}`,
      );
    }

    return apiResponse.success({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Admin logout error:", error);
    return apiResponse.error("Logout failed");
  }
}
