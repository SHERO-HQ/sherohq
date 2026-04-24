import { NextRequest, NextResponse } from "next/server";
import { processNewsletterCron } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 1. Verify Cron Secret (Security)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processNewsletterCron();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron handler error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
