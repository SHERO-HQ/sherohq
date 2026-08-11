import { db } from "@/lib/db";
import { products } from "@/lib/drizzle/schema";
import { count, eq, gt, lte, and, or } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const [inStockRes] = await db
      .select({ count: count() })
      .from(products)
      .where(and(eq(products.inStock, true), gt(products.stockQuantity, 10)));

    const [lowStockRes] = await db
      .select({ count: count() })
      .from(products)
      .where(and(lte(products.stockQuantity, 10), gt(products.stockQuantity, 0)));

    const [outOfStockRes] = await db
      .select({ count: count() })
      .from(products)
      .where(or(eq(products.inStock, false), eq(products.stockQuantity, 0)));

    const inStock = inStockRes?.count ?? 0;
    const lowStock = lowStockRes?.count ?? 0;
    const outOfStock = outOfStockRes?.count ?? 0;

    return apiResponse.success([
      { name: "In Stock", value: inStock, color: "#10b981" },
      { name: "Low Stock", value: lowStock, color: "#f59e0b" },
      { name: "Out of Stock", value: outOfStock, color: "#ef4444" },
    ]);
  } catch (error) {
    console.error("Stock Distribution API Error:", error);
    return apiResponse.error("Failed to fetch stock distribution");
  }
}
