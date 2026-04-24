import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { z } from "zod";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { generateSku, generateUniqueSlug } from "@/lib/productUtils";
import { logActivity } from "@/lib/activity";

const ProductQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

const CreateProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  category: z.string().uuid(),
  description: z.string().optional(),
  stockQuantity: z.number().int().nonnegative(),
  inStock: z.boolean().default(true),
  sku: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
});

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paramsObj = {
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    };

    const validated = ProductQuerySchema.parse(paramsObj);
    const { category, search, limit, offset } = validated;

    let queryText = `
      SELECT
        p.*,
        COALESCE(c_by_id.name, c_by_name.name) as category_name,
        COALESCE(c_by_id.id, c_by_name.id) as resolved_category_id
      FROM products p
      LEFT JOIN categories c_by_id ON p.category = c_by_id.id
      LEFT JOIN categories c_by_name ON p.category = c_by_name.name
    `;

    const sqlParams: (string | number)[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (category && category !== "all") {
      conditions.push(`(p.category = $${paramIndex} OR c_by_id.id = $${paramIndex} OR c_by_name.name = $${paramIndex})`);
      sqlParams.push(category);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR c_by_id.name ILIKE $${paramIndex} OR c_by_name.name ILIKE $${paramIndex})`);
      sqlParams.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += " WHERE " + conditions.join(" AND ");
    }

    queryText += ` ORDER BY p."createdAt" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    sqlParams.push(limit, offset);

    const result = await query(queryText, sqlParams);
    return NextResponse.json(result.rows.map(parseProduct), {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || !["admin", "superadmin", "manager"].includes(admin.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = CreateProductSchema.parse(body);
    const { name, price, category, description, stockQuantity, inStock, sku, slug } = validated;

    const productId = uuidv4();
    const finalSku = generateSku(productId, sku);
    const finalSlug = await generateUniqueSlug(slug || name);

    await query(
      `INSERT INTO products (id, name, sku, category, price, "stockQuantity", "inStock", description, slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [productId, name, finalSku, category, price, stockQuantity, inStock, description || null, finalSlug]
    );

    await logActivity(admin.id, "product_create", "success", `Created product: ${name} (SKU: ${finalSku})`);

    const result = await query("SELECT * FROM products WHERE id = $1", [productId]);
    return NextResponse.json({ success: true, product: parseProduct(result.rows[0]) }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create product" }, { status: 500 });
  }
}
