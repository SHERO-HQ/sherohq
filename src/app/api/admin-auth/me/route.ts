import { NextResponse } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    return apiResponse.success({ admin });
  } catch (error) {
    console.error("Admin me error:", error);
    return apiResponse.unauthorized();
  }
}
