import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ success: false, user: null }, { status: 200 });
  }
}
