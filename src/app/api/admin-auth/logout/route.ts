import { db } from "@/lib/db";
import { sessions } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getAdminFromSession, ADMIN_SESSION_COOKIE, clearAuthCookie } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function POST() {
  try {
    const admin = await getAdminFromSession();
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

    if (token) {
      await db.delete(sessions).where(eq(sessions.token, token));
    }

    await clearAuthCookie(ADMIN_SESSION_COOKIE);

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
