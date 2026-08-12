import { db } from "@/lib/db";
import { userSessions } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { apiResponse } from "@/lib/api-utils";
import { USER_SESSION_COOKIE, clearAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_SESSION_COOKIE)?.value;

    if (token) {
      await db.delete(userSessions).where(eq(userSessions.token, token));
    }

    await clearAuthCookie(USER_SESSION_COOKIE);

    return apiResponse.success({ message: "Logged out successfully" });
  } catch (error) {
    console.error("User logout error:", error);
    return apiResponse.error("Logout failed");
  }
}
