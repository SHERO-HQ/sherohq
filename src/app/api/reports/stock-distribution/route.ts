import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const inStockRes = await query('SELECT COUNT(*) as count FROM products WHERE "inStock" = true AND "stockQuantity" > 10');
    const lowStockRes = await query('SELECT COUNT(*) as count FROM products WHERE "stockQuantity" <= 10 AND "stockQuantity" > 0');
    const outOfStockRes = await query('SELECT COUNT(*) as count FROM products WHERE "inStock" = false OR "stockQuantity" = 0');

    const inStock = parseInt(inStockRes.rows[0]?.count || "0", 10);
    const lowStock = parseInt(lowStockRes.rows[0]?.count || "0", 10);
    const outOfStock = parseInt(outOfStockRes.rows[0]?.count || "0", 10);

    return NextResponse.json([
      { name: "In Stock", value: inStock, color: "#10b981" },
      { name: "Low Stock", value: lowStock, color: "#f59e0b" },
      { name: "Out of Stock", value: outOfStock, color: "#ef4444" },
    ]);
  } catch (error) {
    console.error("Stock Distribution API Error:", error);
    return apiResponse.error("Failed to fetch stock distribution");
  }
}
