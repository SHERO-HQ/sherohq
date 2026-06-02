import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const tableInfo = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'consultations';
    `);

    return NextResponse.json({
      columns: tableInfo.rows
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || String(error) });
  }
}
