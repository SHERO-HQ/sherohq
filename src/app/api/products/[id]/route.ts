import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
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
}

function parseProduct(row: ProductRow) {
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
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const queryText = `
      SELECT
        p.*,
        COALESCE(c_by_id.name, c_by_name.name) as category_name,
        COALESCE(c_by_id.id, c_by_name.id) as resolved_category_id
      FROM products p
      LEFT JOIN categories c_by_id ON p.category = c_by_id.id
      LEFT JOIN categories c_by_name ON p.category = c_by_name.name
      WHERE p.id = $1 OR p.sku = $1 OR p.slug = $1
    `;

    const result = await query(queryText, [id]);
    const product = result.rows[0] as ProductRow | undefined;

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(parseProduct(product), {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
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

    const check = await query(
      "SELECT id FROM products WHERE id = $1 OR sku = $1 OR slug = $1",
      [id]
    );
    if (check.rowCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productId = check.rows[0].id;

    if (body.name || body.slug) {
      const { generateUniqueSlug } = await import("@/lib/productUtils");
      const baseSlug = body.slug || body.name;
      body.slug = await generateUniqueSlug(baseSlug, productId);
    }

    const allowedFields = [
      "name", "sku", "category", "price", "originalPrice", "image", "images",
      "badge", "inStock", "stockQuantity", "description", "features",
      "specifications", "condition", "slug", "isSpotlight", "isFeatured"
    ];

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        let value = body[field];
        if (["images", "features", "specifications"].includes(field) && typeof value !== "string") {
          value = JSON.stringify(value);
        }
        updates.push(`"${field}" = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(productId);
    await query(`UPDATE products SET ${updates.join(", ")} WHERE id = $${paramIndex}`, values);
    
    const { logActivity } = await import("@/lib/activity");
    await logActivity(admin.id, "product_update", "info", `Updated product: ${productId}`);

    const result = await query("SELECT * FROM products WHERE id = $1", [productId]);
    return NextResponse.json({ success: true, product: parseProduct(result.rows[0]) });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || !["admin", "superadmin", "manager"].includes(admin.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;
    const result = await query("SELECT id, name FROM products WHERE id = $1 OR sku = $1 OR slug = $1", [id]);
    const existing = result.rows[0];

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await query("DELETE FROM products WHERE id = $1", [existing.id]);
    
    const { logActivity } = await import("@/lib/activity");
    await logActivity(admin.id, "product_delete", "warning", `Deleted product: ${existing.name}`);

    return NextResponse.json({ success: true, message: `Product "${existing.name}" deleted` });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
