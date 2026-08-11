import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/drizzle/schema";
import { sql, eq, like, desc, or, and } from "drizzle-orm";
import { z } from "zod";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { generateUniqueSlug } from "@/lib/productUtils";
import { logActivity } from "@/lib/activity";

const ProductQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().max(200).optional(),
  stock: z.enum(["low", "out"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0)});

const CreateProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  costPrice: z.number().nonnegative().optional().nullable(),
  category: z.string().uuid(),
  description: z.string().optional(),
  stockQuantity: z.number().int().nonnegative().default(0),
  inStock: z.boolean().default(true),
  sku: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  condition: z.enum(["New", "Used", "Refurbished"]).default("New"),
  isSpotlight: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(100).optional().nullable(),
  metaDescription: z.string().max(200).optional().nullable(),
});

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parsed = ProductQuerySchema.safeParse(Object.fromEntries(searchParams));
    
    if (!parsed.success) {
      return apiResponse.error("Invalid query parameters", 400);
    }

    const { category, search, stock, limit, offset } = parsed.data;

    const conditions = [];

    if (category && category !== "All") {
      conditions.push(or(eq(products.category, category), eq(categories.name, category)));
    }

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(or(
        like(products.name, searchTerm),
        like(products.description, searchTerm),
        like(products.sku, searchTerm),
        like(products.slug, searchTerm)
      ));
    }

    if (stock === "low") {
      conditions.push(sql`${products.stockQuantity} > 0 AND ${products.stockQuantity} <= 5`);
    } else if (stock === "out") {
      conditions.push(or(eq(products.stockQuantity, 0), eq(products.inStock, false)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db.select({
      product: products,
      categoryName: categories.name,
      categoryId: categories.id,
      total_count: sql`count(*) over()`
    })
    .from(products)
    .leftJoin(categories, or(
      eq(products.category, categories.id),
      eq(products.category, categories.name)
    ))
    .where(whereClause)
    .orderBy(desc(products.createdAt))
    .limit(limit)
    .offset(offset);

    let total = 0;
    const parsedProducts = result.map(row => {
      total = Number(row.total_count);
      const formattedRow = {
        ...row.product,
        category_name: row.categoryName,
        resolved_category_id: row.categoryId,
      };
      return parseProduct(formattedRow);
    });

    return apiResponse.success(
      { products: parsedProducts, total },
      200,
      { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return apiResponse.error("Failed to fetch products", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || !["admin", "superadmin", "manager"].includes(admin.role)) {
      return apiResponse.unauthorized();
    }

    const body = await request.json();
    const validated = CreateProductSchema.parse(body);

    const productId = uuidv4();
    
    let finalSlug = validated.slug;
    if (!finalSlug) {
      finalSlug = await generateUniqueSlug(validated.name, productId);
    }

    await db.insert(products).values({
      id: productId,
      name: validated.name,
      price: validated.price.toString(),
      costPrice: validated.costPrice?.toString(),
      category: validated.category,
      description: validated.description,
      stockQuantity: validated.stockQuantity,
      inStock: validated.inStock,
      sku: validated.sku,
      slug: finalSlug,
      image: validated.image,
      images: validated.images ? JSON.stringify(validated.images) : null,
      features: validated.features ? JSON.stringify(validated.features) : null,
      specifications: validated.specifications ? JSON.stringify(validated.specifications) : null,
      condition: validated.condition,
      isSpotlight: validated.isSpotlight,
      isFeatured: validated.isFeatured,
      metaTitle: validated.metaTitle,
      metaDescription: validated.metaDescription,
    });

    logActivity(
      admin.id,
      "product_create",
      "success",
      `Admin ${admin.username} added product: ${validated.name}`
    ).catch(console.error);

    return apiResponse.success({ id: productId }, 201);
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error.name === "ZodError") {
      return apiResponse.validationError(error);
    }
    return apiResponse.error(error instanceof Error ? error.message : "Failed to create product", 500);
  }
}
