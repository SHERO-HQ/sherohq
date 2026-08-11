import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/drizzle/schema";
import { eq, or } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || !["admin", "superadmin", "manager"].includes(admin.role)) {
      return apiResponse.unauthorized();
    }

    const id = (await params).id;
    const body = await request.json();
    const { stockQuantity } = body;

    if (stockQuantity === undefined || typeof stockQuantity !== "number") {
      return apiResponse.error("Valid stockQuantity number is required", 400);
    }

    const check = await db.select({ id: products.id, name: products.name })
      .from(products)
      .where(or(
        eq(products.id, id),
        eq(products.sku, id),
        eq(products.slug, id)
      ))
      .limit(1);

    if (check.length === 0) {
      return apiResponse.notFound("Product not found");
    }

    const existing = check[0];
    const productId = existing.id;
    const inStock = stockQuantity > 0;

    const result = await db.update(products)
      .set({
        stockQuantity: stockQuantity,
        inStock: inStock
      })
      .where(eq(products.id, productId))
      .returning();

    const { logActivity } = await import("@/lib/activity");
    await logActivity(
      admin.id,
      "product_update",
      "info",
      `Updated stock for product "${existing.name}": quantity=${stockQuantity}, inStock=${inStock}`
    );

    const product = result[0];
    
    // Transform to standard product format
    const parsedProduct = {
      ...product,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      rating: Number(product.rating),
      images: product.images ? (typeof product.images === "string" ? JSON.parse(product.images) : product.images) : null,
      features: product.features ? (typeof product.features === "string" ? JSON.parse(product.features) : product.features) : null,
      specifications: product.specifications ? (typeof product.specifications === "string" ? JSON.parse(product.specifications) : product.specifications) : null,
      inStock: Boolean(product.inStock),
      quantity: product.stockQuantity,
      isSpotlight: Boolean(product.isSpotlight),
      isFeatured: Boolean(product.isFeatured),
    };

    return apiResponse.success({ success: true, product: parsedProduct });
  } catch (error) {
    console.error("Error updating product stock:", error);
    return apiResponse.error("Failed to update product stock", 500);
  }
}
