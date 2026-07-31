import { NextRequest} from "next/server";
import { query } from "@/lib/db";
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

    const products = await query(
      "SELECT id, name, sku, price, image FROM products WHERE name ILIKE $1 OR sku ILIKE $1 OR description ILIKE $1 LIMIT 5",
      [searchTerm]
    );

    const orders = await query(
      `SELECT id, total, status, "createdAt", "shippingInfo" FROM orders 
       WHERE id::text ILIKE $1 OR "shippingInfo"::text ILIKE $1 LIMIT 5`,
      [searchTerm]
    );

    const users = await query(
      `SELECT id, name, email, phone FROM users 
       WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 LIMIT 5`,
      [searchTerm]
    );

    const inquiries = await query(
      "SELECT id, name, email, subject FROM inquiries WHERE name ILIKE $1 OR email ILIKE $1 OR subject ILIKE $1 OR message ILIKE $1 LIMIT 5",
      [searchTerm]
    );

    return apiResponse.success({
      products: products.rows,
      orders: orders.rows,
      users: users.rows,
      inquiries: inquiries.rows});
  } catch (error) {
    console.error("Global search error:", error);
    return apiResponse.error("Search failed");
  }
}
