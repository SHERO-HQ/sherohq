import { apiResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const start = Date.now();
    const dbCheck = await db.execute(sql`SELECT NOW()`);
    const duration = Date.now() - start;

    return apiResponse.success({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        latency: `${duration}ms`},
      environment: process.env.NODE_ENV});
  } catch (error) {
    console.error("Health check failed:", error);
    return apiResponse.success(
      {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error"}, 500);
  }
}
