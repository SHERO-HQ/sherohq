import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || !["admin", "superadmin", "manager"].includes(admin.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;
    const body = await request.json();
    const { stockQuantity } = body;

    if (stockQuantity === undefined || typeof stockQuantity !== "number") {
      return NextResponse.json(
        { error: "Valid stockQuantity number is required" },
        { status: 400 }
      );
    }

    const check = await query(
      "SELECT id, name FROM products WHERE id = $1 OR sku = $1 OR slug = $1",
      [id]
    );
    if (check.rowCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existing = check.rows[0];
    const productId = existing.id;
    const inStock = stockQuantity > 0;

    const result = await query(
      `UPDATE products 
       SET "stockQuantity" = $1, "inStock" = $2 
       WHERE id = $3 
       RETURNING *`,
      [stockQuantity, inStock, productId]
    );

    const { logActivity } = await import("@/lib/activity");
    await logActivity(
      admin.id,
      "product_update",
      "info",
      `Updated stock for product "${existing.name}": quantity=${stockQuantity}, inStock=${inStock}`
    );

    const product = result.rows[0];
    
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

    return NextResponse.json({ success: true, product: parsedProduct });
  } catch (error) {
    console.error("Error updating product stock:", error);
    return NextResponse.json(
      { error: "Failed to update product stock" },
      { status: 500 }
    );
  }
}
