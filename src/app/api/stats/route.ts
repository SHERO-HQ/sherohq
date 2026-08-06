import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const result = await query(
      `SELECT * FROM site_stats ORDER BY "order" ASC, "createdAt" DESC`
    );
    return NextResponse.json(result.rows, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" }
    });
  } catch (err) {
    console.error("Error fetching site stats:", err);
    return NextResponse.json({ error: "Failed to fetch site stats" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { label, value, suffix, prefix, icon, color, order } = await request.json();
    if (!label || !value) return NextResponse.json({ error: "Label and value are required" }, { status: 400 });

    const id = uuidv4();
    const result = await query(
      `INSERT INTO site_stats (id, label, value, suffix, prefix, icon, color, "order")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, label, value, suffix, prefix, icon, color, order || 0]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("Error creating site stat:", err);
    return NextResponse.json({ error: "Failed to create site stat" }, { status: 500 });
  }
}
