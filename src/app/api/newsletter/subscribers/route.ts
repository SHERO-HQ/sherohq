import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/drizzle/schema";
import { eq, or, and, ilike, desc, sql, SQL } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || !["admin", "superadmin", "manager"].includes(admin.role)) {
      return apiResponse.unauthorized();
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status")?.toLowerCase() || "all";
    const search = searchParams.get("search")?.trim() || "";

    const conditions: SQL[] = [];

    if (status === "active" || status === "unsubscribed") {
      conditions.push(eq(newsletterSubscribers.status, status));
    }

    if (search) {
      conditions.push(
        or(
          ilike(newsletterSubscribers.email, `%${search}%`),
          ilike(newsletterSubscribers.name, `%${search}%`),
          ilike(newsletterSubscribers.phone, `%${search}%`)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [subscribersResult, countsResult] = await Promise.all([
      db
        .select({
          id: newsletterSubscribers.id,
          email: newsletterSubscribers.email,
          phone: newsletterSubscribers.phone,
          name: newsletterSubscribers.name,
          source: newsletterSubscribers.source,
          status: newsletterSubscribers.status,
          subscribedAt: newsletterSubscribers.subscribedAt,
          unsubscribedAt: newsletterSubscribers.unsubscribedAt,
          lastCampaignAt: newsletterSubscribers.lastCampaignAt,
          createdAt: newsletterSubscribers.createdAt,
          updatedAt: newsletterSubscribers.updatedAt,
        })
        .from(newsletterSubscribers)
        .where(whereClause)
        .orderBy(desc(newsletterSubscribers.createdAt)),
      db
        .select({
          total: sql<number>`count(*)::int`,
          active: sql<number>`count(*) filter (where status = 'active')::int`,
          unsubscribed: sql<number>`count(*) filter (where status = 'unsubscribed')::int`,
        })
        .from(newsletterSubscribers)
    ]);

    return apiResponse.success({
      subscribers: subscribersResult,
      counts: countsResult[0] || { total: 0, active: 0, unsubscribed: 0 },
    });
  } catch (error) {
    console.error("Newsletter list error:", error);
    return apiResponse.error("Failed to fetch subscribers", 500);
  }
}
