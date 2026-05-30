import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { apiResponse } from "@/lib/api-utils";
import { USER_SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_SESSION_COOKIE)?.value;

    if (token) {
      await query("DELETE FROM user_sessions WHERE token = $1", [token]);
    }

    cookieStore.set(USER_SESSION_COOKIE, "", { maxAge: 0, path: "/" });

    return apiResponse.success({ message: "Logged out successfully" });
  } catch (error) {
    console.error("User logout error:", error);
    return apiResponse.error("Logout failed");
  }
}
