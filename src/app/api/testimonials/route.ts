import { NextRequest} from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isAdmin = searchParams.get("admin") === "true";
    
    let queryText = 'SELECT * FROM testimonials';
    if (!isAdmin) {
      queryText += ' WHERE active = true';
    }
    queryText += ' ORDER BY "order" ASC, "createdAt" DESC';

    const result = await query(queryText);
    
    // Only cache public requests
    const headers = !isAdmin ? { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } : undefined;
    
    return apiResponse.success(result.rows, 200, headers);
  } catch (error) {
    console.error("Fetch testimonials error:", error);
    return apiResponse.error("Failed to fetch testimonials");
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    const body = await request.json();
    const { quote, author, role, company, image, order, active, rating, reviewUrl } = body;

    const id = uuidv4();
    await query(
      `INSERT INTO testimonials (id, quote, author, role, company, image, "order", active, rating, "reviewUrl")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, quote, author, role || null, company || null, image || null, order || 0, active !== undefined ? active : true, rating || null, reviewUrl || null]
    );

    if (admin) {
      await logActivity(admin.id, "testimonial_create", "success", `Created testimonial by: ${author}`);
    }

    const result = await query("SELECT * FROM testimonials WHERE id = $1", [id]);
    return apiResponse.success(result.rows[0], 201);
  } catch (error) {
    console.error("Create testimonial error:", error);
    return apiResponse.error("Failed to create testimonial");
  }
}
