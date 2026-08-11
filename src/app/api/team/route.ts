import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/drizzle/schema";
import { asc, desc } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";
import { safeParse } from "@/lib/orderUtils";

export async function GET() {
  try {
    const result = await db.select()
      .from(teamMembers)
      .orderBy(asc(teamMembers.order), desc(teamMembers.createdAt));
      
    const formatted = result.map((member) => ({
      ...member,
      social: safeParse(member.social)
    }));

    return apiResponse.success(formatted, 200, {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
    });
  } catch (error) {
    console.error("Fetch team error:", error);
    return apiResponse.error("Failed to fetch team members");
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const body = await request.json();
    const { name, role, bio, image, social, order } = body;

    const id = uuidv4();
    const result = await db.insert(teamMembers).values({
      id,
      name,
      role,
      bio: bio || null,
      image: image || null,
      social: social ? JSON.stringify(social) : null,
      order: order || 0
    }).returning();

    await logActivity(admin.id, "team_member_create", "success", `Added team member: ${name}`);

    const member = result[0];
    return apiResponse.success({
      ...member,
      social: safeParse(member.social)
    }, 201);
  } catch (error) {
    console.error("Create team member error:", error);
    return apiResponse.error("Failed to add team member");
  }
}
