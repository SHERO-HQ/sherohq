import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    
    let queryText = 'SELECT * FROM tickets';
    const params: any[] = [];
    
    if (status && status !== 'all') {
      queryText += ' WHERE status = $1';
      params.push(status);
    }
    
    queryText += ' ORDER BY "createdAt" DESC';

    const result = await query(queryText, params);
    return apiResponse.success(result.rows);
  } catch (error) {
    console.error("Fetch tickets error:", error);
    return apiResponse.error("Failed to fetch support tickets");
  }
}
