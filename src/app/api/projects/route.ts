import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";

function parseProject(row: any) {
  const safeParse = (val: unknown): unknown => {
    if (!val) return [];
    if (typeof val !== "string") return val;
    try {
      return JSON.parse(val);
    } catch (e) {
      return [];
    }
  };

  return {
    ...row,
    technologies: safeParse(row.technologies)};
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    
    let dbQuery = db.select().from(projects);
    
    if (category && category !== "All") {
      dbQuery = dbQuery.where(eq(projects.category, category)) as any;
    }

    dbQuery = dbQuery.orderBy(desc(projects.createdAt)) as any;

    const result = await dbQuery;
    return apiResponse.success(result.map(parseProject), 200, {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return apiResponse.error("Failed to fetch projects", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const body = await request.json();
    const { title, category, client, description, useCase, technologies, image, link } = body;

    const projectId = uuidv4();

    await db.insert(projects).values({
      id: projectId,
      title,
      category,
      client,
      description,
      useCase,
      technologies: JSON.stringify(technologies),
      image,
      link,
    });

    logActivity(
      admin.id,
      "project_create",
      "success",
      `Admin ${admin.username} added project: ${title}`
    ).catch(console.error);

    return apiResponse.success({ id: projectId }, 201);
  } catch (error) {
    console.error("Error creating project:", error);
    return apiResponse.error("Failed to create project", 500);
  }
}
