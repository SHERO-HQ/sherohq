import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tickets } from "@/lib/drizzle/schema";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    let condition = undefined;
    if (status && status !== "all") {
      condition = eq(tickets.status, status);
    }

    const rows = await db.query.tickets.findMany({
      where: condition,
      orderBy: [desc(tickets.createdAt)]
    });

    return apiResponse.success(rows);
  } catch (error) {
    console.error("Fetch tickets error:", error);
    return apiResponse.error("Failed to fetch support tickets");
  }
}
