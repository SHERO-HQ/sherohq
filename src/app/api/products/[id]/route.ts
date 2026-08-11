import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/drizzle/schema";
import { eq, or } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";

interface ProductRow {
  id: string;
  name: string;
  sku: string | null;
  slug: string | null;
  category: string;
  category_name?: string;
  price: string;
  originalPrice: string | null;
  image: string | null;
  images: string | null;
  rating: string;
  reviews: number;
  badge: string | null;
  inStock: boolean;
  stockQuantity: number;
  description: string | null;
  features: string | null;
  specifications: string | null;
  condition: "New" | "Used" | "Refurbished" | null;
  isSpotlight: boolean;
  isFeatured: boolean;
  createdAt: Date;
  resolved_category_id?: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

function parseProduct(row: any) {
  const safeParse = (val: unknown): unknown => {
    if (!val) return null;
    if (typeof val !== "string") return val;
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  };

  return {
    ...row,
    category: row.category_name || row.category,
    categoryId: row.resolved_category_id || row.category,
    price: Number(row.price),
    originalPrice: row.originalPrice ? Number(row.originalPrice) : null,
    rating: Number(row.rating),
    images: safeParse(row.images),
    features: safeParse(row.features),
    specifications: safeParse(row.specifications),
    inStock: Boolean(row.inStock),
    sku: row.sku || null,
    slug: row.slug || null,
    stockQuantity: row.stockQuantity,
    quantity: row.stockQuantity,
    condition: row.condition || "New",
    isSpotlight: Boolean(row.isSpotlight),
    isFeatured: Boolean(row.isFeatured),
    metaTitle: row.metaTitle || null,
    metaDescription: row.metaDescription || null
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    // Use Drizzle left join
    const result = await db.select({
      product: products,
      categoryName: categories.name,
      categoryId: categories.id,
    })
    .from(products)
    .leftJoin(categories, or(
      eq(products.category, categories.id),
      eq(products.category, categories.name)
    ))
    .where(or(
      eq(products.id, id),
      eq(products.sku, id),
      eq(products.slug, id)
    ))
    .limit(1);

    const match = result[0];

    if (!match) {
      return apiResponse.notFound("Product not found");
    }

    const formattedRow = {
      ...match.product,
      category_name: match.categoryName,
      resolved_category_id: match.categoryId,
    };

    return apiResponse.success(parseProduct(formattedRow), 200, {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600"
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return apiResponse.error("Failed to fetch product", 500);
  }
}

export async function PUT(
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

    const check = await db.select({ id: products.id }).from(products)
      .where(or(
        eq(products.id, id),
        eq(products.sku, id),
        eq(products.slug, id)
      ))
      .limit(1);

    if (check.length === 0) {
      return apiResponse.notFound("Product not found");
    }

    const productId = check[0].id;

    if (body.name || body.slug) {
      const { generateUniqueSlug } = await import("@/lib/productUtils");
      const baseSlug = body.slug || body.name;
      body.slug = await generateUniqueSlug(baseSlug, productId);
    }

    const allowedFields = [
      "name", "sku", "category", "price", "originalPrice", "costPrice", "image", "images",
      "badge", "inStock", "stockQuantity", "description", "features",
      "specifications", "condition", "slug", "isSpotlight", "isFeatured",
      "metaTitle", "metaDescription"
    ];

    const updates: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        let value = body[field];
        if (["images", "features", "specifications"].includes(field) && typeof value !== "string") {
          value = JSON.stringify(value);
        }
        updates[field] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return apiResponse.error("No fields to update", 400);
    }

    await db.update(products).set(updates).where(eq(products.id, productId));
    
    const { logActivity } = await import("@/lib/activity");
    await logActivity(admin.id, "product_update", "info", `Updated product: ${productId}`);

    const result = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    return apiResponse.success({ success: true, product: parseProduct(result[0]) });
  } catch (error) {
    console.error("Error updating product:", error);
    return apiResponse.error("Failed to update product", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || !["admin", "superadmin", "manager"].includes(admin.role)) {
      return apiResponse.unauthorized();
    }

    const id = (await params).id;
    const existing = await db.select({ id: products.id, name: products.name })
      .from(products)
      .where(or(
        eq(products.id, id),
        eq(products.sku, id),
        eq(products.slug, id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return apiResponse.notFound("Product not found");
    }

    await db.delete(products).where(eq(products.id, existing[0].id));
    
    const { logActivity } = await import("@/lib/activity");
    await logActivity(admin.id, "product_delete", "warning", `Deleted product: ${existing[0].name}`);

    return apiResponse.success({ success: true, message: `Product "${existing[0].name}" deleted` });
  } catch (error) {
    console.error("Error deleting product:", error);
    return apiResponse.error("Failed to delete product", 500);
  }
}
