import { NextRequest, NextResponse } from "next/server";
import { processPendingRetries } from "@/lib/whatsapp-retry";

/**
 * POST /api/cron/whatsapp-retry
 * Process pending message retries for failed WhatsApp deliveries
 *
 * Call this endpoint periodically via cron service (recommended: every 10 minutes).
 * Configure in vercel.json crons array.
 */
export async function POST(request: NextRequest) {
  try {
    // Log Cloudflare proxy headers for auditing
    const cfConnectingIp =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for");
    const cfRay = request.headers.get("cf-ray");
    const cfCountry = request.headers.get("cf-ipcountry");
    console.log("Cron POST invoked", { cfConnectingIp, cfRay, cfCountry });

    // Verify cron secret if provided
    const cronSecret = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    if (cronSecret && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Processing WhatsApp message retries...");

    const result = await processPendingRetries();

    console.log("WhatsApp retry processing complete:", result);

    return NextResponse.json({
      success: true,
      processed: result.processed,
      successful: result.successful,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing retries:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/cron/whatsapp-retry
 * Health check / manual trigger endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // Log Cloudflare proxy headers for auditing
    const cfConnectingIp =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for");
    const cfRay = request.headers.get("cf-ray");
    const cfCountry = request.headers.get("cf-ipcountry");
    console.log("Cron GET invoked", { cfConnectingIp, cfRay, cfCountry });

    const result = await processPendingRetries();

    return NextResponse.json({
      success: true,
      message: "Manual retry trigger executed",
      processed: result.processed,
      successful: result.successful,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in retry health check:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
