import { NextResponse } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, admin: null }, { status: 200 });
    }

    return apiResponse.success({ admin });
  } catch (error) {
    console.error("Admin me error:", error);
    return NextResponse.json({ success: false, admin: null }, { status: 200 });
  }
}
