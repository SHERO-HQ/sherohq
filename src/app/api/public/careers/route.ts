import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(`
      SELECT *
      FROM careers
      WHERE "isActive" = true
      ORDER BY "createdAt" DESC
    `);
    
    return NextResponse.json(
      { success: true, data: result.rows },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Public fetch careers error:", error);
    return NextResponse.json({ error: "Failed to fetch active job postings" }, { status: 500 });
  }
}
