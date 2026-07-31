import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
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
    
    let queryText = "SELECT * FROM projects";
    const params: string[] = [];

    if (category && category !== "All") {
      queryText += " WHERE category = $1";
      params.push(category);
    }

    queryText += ' ORDER BY "createdAt" DESC';

    const result = await query(queryText, params);
    return NextResponse.json(result.rows.map(parseProject));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, category, client, description, useCase, technologies, image, link } = body;

    const projectId = uuidv4();

    await query(
      `INSERT INTO projects (id, title, category, client, description, "useCase", technologies, image, link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        projectId,
        title,
        category,
        client || null,
        description || null,
        useCase || null,
        technologies ? JSON.stringify(technologies) : JSON.stringify([]),
        image || null,
        link || null,
      ]
    );

    await logActivity(admin.id, "project_create", "success", `Created project: ${title}`);

    const result = await query("SELECT * FROM projects WHERE id = $1", [projectId]);
    return NextResponse.json({ success: true, project: parseProject(result.rows[0]) }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
