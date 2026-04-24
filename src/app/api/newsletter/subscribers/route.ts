import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || !["admin", "superadmin", "manager"].includes(admin.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status")?.toLowerCase() || "all";
    const search = searchParams.get("search")?.trim() || "";

    const values: Array<string> = [];
    const whereClauses: string[] = [];

    if (status === "active" || status === "unsubscribed") {
      values.push(status);
      whereClauses.push(`status = $${values.length}`);
    }

    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      whereClauses.push(
        `(LOWER(email) LIKE $${values.length} OR LOWER(COALESCE(name, '')) LIKE $${values.length} OR COALESCE(phone, '') LIKE $${values.length})`
      );
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const [subscribersResult, countsResult] = await Promise.all([
      query(
        `SELECT id, email, phone, name, source, status, "subscribedAt", "unsubscribedAt", "lastCampaignAt", "createdAt", "updatedAt"
         FROM newsletter_subscribers
         ${whereSql}
         ORDER BY "createdAt" DESC`,
        values
      ),
      query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'active')::int AS active,
          COUNT(*) FILTER (WHERE status = 'unsubscribed')::int AS unsubscribed
        FROM newsletter_subscribers
      `)
    ]);

    return NextResponse.json({
      subscribers: subscribersResult.rows,
      counts: countsResult.rows[0],
    });
  } catch (error) {
    console.error("Newsletter list error:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}
