import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { clientPartners } from "@/lib/drizzle/schema";
import { asc, desc, eq } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get("all") === "true";

    let dbQuery = db.select().from(clientPartners);

    if (!includeInactive) {
      dbQuery = dbQuery.where(eq(clientPartners.active, true)) as any;
    }

    const result = await dbQuery.orderBy(
      asc(clientPartners.order),
      desc(clientPartners.createdAt)
    );

    const headers = includeInactive
      ? { "Cache-Control": "no-store, no-cache, must-revalidate" }
      : { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };

    return apiResponse.success(result, 200, headers);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return apiResponse.error("Failed to fetch clients", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const body = await request.json();
    const { name, tagline, logo, logoDark, website, category, order, active } = body;

    if (!name || !logo) {
      return apiResponse.error("Name and logo are required", 400);
    }

    const id = uuidv4();

    await db.insert(clientPartners).values({
      id,
      name,
      tagline: tagline || null,
      logo,
      logoDark: logoDark || null,
      website: website || null,
      category: category || "Client",
      order: typeof order === "number" ? order : 0,
      active: active !== undefined ? Boolean(active) : true,
    });

    logActivity(
      admin.id,
      "client_create",
      "success",
      `Admin ${admin.username} added client/partner: ${name}`
    ).catch(console.error);

    return apiResponse.success({ id, name, logo }, 201);
  } catch (error) {
    console.error("Error creating client:", error);
    return apiResponse.error("Failed to create client", 500);
  }
}
