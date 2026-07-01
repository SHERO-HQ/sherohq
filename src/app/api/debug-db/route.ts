import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  const pgUrl = process.env.POSTGRES_URL || "";
  const pgPrisma = process.env.POSTGRES_PRISMA_URL || "";
  
  const mask = (url: string) => {
    if (!url) return "NOT_SET";
    try {
      const parsed = new URL(url);
      parsed.password = "****";
      return parsed.toString();
    } catch {
      return "INVALID_URL";
    }
  };

  try {
    const start = Date.now();
    await query("SELECT 1 AS ok");
    const duration = Date.now() - start;
    
    return NextResponse.json({
      status: "success",
      durationMs: duration,
      DATABASE_URL: mask(dbUrl),
      POSTGRES_URL: mask(pgUrl),
      POSTGRES_PRISMA_URL: mask(pgPrisma),
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "error",
      message: err.message,
      stack: err.stack,
      DATABASE_URL: mask(dbUrl),
      POSTGRES_URL: mask(pgUrl),
      POSTGRES_PRISMA_URL: mask(pgPrisma),
    }, { status: 500 });
  }
}
