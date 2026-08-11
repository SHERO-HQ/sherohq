import { NextRequest} from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const q = request.nextUrl.searchParams.get("q") || "";
    if (q.length < 2) {
      return apiResponse.success({ products: [], orders: [], users: [], inquiries: [] });
    }

    const searchTerm = `%${q}%`;

    const products = await db.execute(sql`
      SELECT id, name, sku, price, image FROM products WHERE name ILIKE ${searchTerm} OR sku ILIKE ${searchTerm} OR description ILIKE ${searchTerm} LIMIT 5
    `);

    const orders = await db.execute(sql`
      SELECT id, total, status, "createdAt", "shippingInfo" FROM orders 
      WHERE id::text ILIKE ${searchTerm} OR "shippingInfo"::text ILIKE ${searchTerm} LIMIT 5
    `);

    const users = await db.execute(sql`
      SELECT id, name, email, phone FROM users 
      WHERE name ILIKE ${searchTerm} OR email ILIKE ${searchTerm} OR phone ILIKE ${searchTerm} LIMIT 5
    `);

    const inquiries = await db.execute(sql`
      SELECT id, name, email, subject FROM inquiries WHERE name ILIKE ${searchTerm} OR email ILIKE ${searchTerm} OR subject ILIKE ${searchTerm} OR message ILIKE ${searchTerm} LIMIT 5
    `);

    return apiResponse.success({
      products: (products.rows || products) as Record<string, unknown>[],
      orders: (orders.rows || orders) as Record<string, unknown>[],
      users: (users.rows || users) as Record<string, unknown>[],
      inquiries: (inquiries.rows || inquiries) as Record<string, unknown>[]
    });
  } catch (error) {
    console.error("Global search error:", error);
    return apiResponse.error("Search failed");
  }
}
