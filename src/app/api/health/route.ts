import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const start = Date.now();
    const dbCheck = await query("SELECT NOW()");
    const duration = Date.now() - start;

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        latency: `${duration}ms`,
      },
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
