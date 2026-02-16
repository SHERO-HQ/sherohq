import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import fs from "node:fs";
import path from "node:path";
import db from "../db/database";
import { adminAuth, AdminRequest, requireRole } from "../middleware/adminAuth";
import { logActivity } from "./activity";
import { generateSku } from "../utils/sku";

const router = Router();

// Database row type for products
// Database row type for products
interface ProductRow {
  id: string;
  name: string;
  sku: string | null;
  slug: string | null; // Added slug
  category: string; // This is the UUID from DB
  category_name?: string; // Joined name
  price: string; // Postgres returns decimals as strings
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
  createdAt: Date;
}

// Helper to parse JSON fields and numbers
function parseProduct(row: ProductRow) {
  const safeParse = (val: unknown): unknown => {
    if (!val) return null;
    if (typeof val !== "string") return val;
    try {
      return JSON.parse(val);
    } catch (e) {
      console.error("Failed to parse JSON field:", e);
      return val;
    }
  };

  // Debug log for category mismatch investigation
  if (!row.category_name && row.category) {
    console.warn(
      `⚠️ Product ${row.id} has category ID '${row.category}' but no matching category name found.`,
    );
  }

  return {
    ...row,
    id: row.id,
    // Frontend expects "category" to be the Display Name
    category: row.category_name || row.category,
    // We add "categoryId" to hold the UUID for forms
    categoryId: row.category,
    price: Number(row.price),
    originalPrice: row.originalPrice ? Number(row.originalPrice) : null,
    rating: Number(row.rating),
    images: safeParse(row.images),
    features: safeParse(row.features),
    specifications: safeParse(row.specifications),
    inStock: Boolean(row.inStock),
    sku: row.sku || null,
    slug: row.slug || null, // Return slug
    quantity: row.stockQuantity, // Alias for frontend compatibility
    condition: row.condition || "New",
  };
}

// GET /api/products - List all products
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let queryText = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category = c.id
    `;
    const params: (string | number)[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (category && category !== "all") {
      // If filtering by ID, check p.category
      conditions.push(`p.category = $${paramIndex}`);
      params.push(category as string);
      paramIndex++;
    }

    if (search) {
      conditions.push(
        `(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`,
      );
      params.push(`%${search as string}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += " WHERE " + conditions.join(" AND ");
    }

    queryText += ' ORDER BY p."createdAt" DESC';

    const result = await db.query(queryText, params);
    const products = result.rows as ProductRow[];
    res.json(products.map(parseProduct));
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id - Get single product
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    // Query by ID, SKU, or Slug - Cast ID to text to avoid UUID type mismatch
    const query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category = c.id
      WHERE p.id::text = $1 OR p.sku = $1 OR p.slug = $1
    `;

    const result = await db.query(query, [id]);
    const product = result.rows[0];

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(parseProduct(product as ProductRow));
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// GET /api/categories - List all categories
router.get("/categories/list", async (req: Request, res: Response) => {
  try {
    const result = await db.query("SELECT * FROM categories");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// POST /api/products/categories - Create new category (Admin)
router.post(
  "/categories",
  adminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      const { name, icon } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Category name is required" });
      }

      const id = uuidv4();
      await db.query(
        "INSERT INTO categories (id, name, icon) VALUES ($1, $2, $3)",
        [id, name, icon || "Package"],
      );

      if (req.admin?.id) {
        await logActivity(
          req.admin.id,
          "category_create",
          "success",
          `Created category: ${name}`,
        );
      }

      res.status(201).json({ id, name, icon: icon || "Package" });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  },
);

// PUT /api/products/categories/:id - Update category (Admin)
router.put(
  "/categories/:id",
  adminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, icon } = req.body;

      const check = await db.query("SELECT * FROM categories WHERE id = $1", [
        id,
      ]);
      if (check.rowCount === 0) {
        return res.status(404).json({ error: "Category not found" });
      }

      await db.query(
        "UPDATE categories SET name = $1, icon = $2 WHERE id = $3",
        [name, icon, id],
      );

      if (req.admin?.id) {
        await logActivity(
          req.admin.id,
          "category_update",
          "info",
          `Updated category: ${name}`,
        );
      }

      res.json({ id, name, icon });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  },
);

// DELETE /api/products/categories/:id - Delete category (Admin)
router.delete(
  "/categories/:id",
  adminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;

      const check = await db.query(
        "SELECT name FROM categories WHERE id = $1",
        [id],
      );
      if (check.rowCount === 0) {
        return res.status(404).json({ error: "Category not found" });
      }

      const categoryName = check.rows[0].name;

      await db.query("DELETE FROM categories WHERE id = $1", [id]);

      if (req.admin?.id) {
        await logActivity(
          req.admin.id,
          "category_delete",
          "warning",
          `Deleted category: ${categoryName}`,
        );
      }

      res.json({
        success: true,
        message: `Category "${categoryName}" deleted`,
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  },
);

// POST /api/products - Create new product (Admin)
router.post("/", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const {
      name,
      sku,
      category,
      price,
      originalPrice,
      image,
      images,
      rating = 0,
      reviews = 0,
      badge,
      inStock = true,
      stockQuantity = 100,
      description,
      features,
      specifications,
      condition,
      slug,
    } = req.body;

    if (!name || !category || !price) {
      return res
        .status(400)
        .json({ error: "Name, category, and price are required" });
    }

    const productId = uuidv4();

    // Auto-generate SKU if not provided
    const finalSku = generateSku(productId, sku);

    // Auto-generate Slug if not provided
    const finalSlug =
      slug ||
      name
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, "-")
        .replaceAll(/(^-|-$)/g, "");

    await db.query(
      `
      INSERT INTO products (id, name, sku, category, price, "originalPrice", image, images, rating, reviews, badge, "inStock", "stockQuantity", description, features, specifications, condition, slug)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    `,
      [
        productId,
        name,
        finalSku,
        category,
        price,
        originalPrice || null,
        image || null,
        images ? JSON.stringify(images) : null,
        rating,
        reviews,
        badge || null,
        inStock,
        stockQuantity,
        description || null,
        features ? JSON.stringify(features) : null,
        specifications ? JSON.stringify(specifications) : null,
        condition || "New",
        finalSlug,
      ],
    );

    console.log(`📦 Product created: ${name} by ${req.admin?.username}`);
    if (req.admin?.id) {
      await logActivity(
        req.admin.id,
        "product_create",
        "success",
        `Created product: ${name} (SKU: ${finalSku})`,
      );
    }

    const result = await db.query("SELECT * FROM products WHERE id = $1", [
      productId,
    ]);
    const product = result.rows[0] as ProductRow;

    res.status(201).json({
      success: true,
      product: parseProduct(product),
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Helper to format numeric fields for Postgres
function formatNumericValue(_field: string, value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const numValue = Number.parseFloat(value);
    return Number.isNaN(numValue) ? null : numValue;
  }
  return null;
}

// Helper to stringify JSON fields safely
function stringifyJsonValue(field: string, value: unknown): string | null {
  if (value === null) return null;
  try {
    return typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    console.error(`Invalid JSON for field ${field}`);
    return null;
  }
}

// Helper to process update fields
function processUpdateFields(body: Record<string, unknown>) {
  // Handle quantity/stockQuantity aliasing
  if (body.quantity !== undefined && body.stockQuantity === undefined) {
    body.stockQuantity = body.quantity;
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  // Fields allowed to be updated through the form
  const allowedFields = [
    "name",
    "sku",
    "category",
    "price",
    "originalPrice",
    "image",
    "images",
    "badge",
    "inStock",
    "stockQuantity",
    "description",
    "features",
    "specifications",
    "condition",
    "slug",
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      let value = body[field];

      if (field === "price" || field === "originalPrice") {
        value = formatNumericValue(field, value);
      } else if (["images", "features", "specifications"].includes(field)) {
        value = stringifyJsonValue(field, value);
      }

      updates.push(`"${field}" = $${paramIndex++}`);
      values.push(value);
    }
  }

  return { updates, values, paramIndex };
}

// PUT /api/products/:id - Update product (Admin) - supports ID or SKU
router.put("/:id", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const identifier = String(req.params.id);

    // Resilient lookup: check ID, SKU, or Slug - Cast ID to text for safety
    const lookupQuery =
      "SELECT id FROM products WHERE id::text = $1 OR sku = $1 OR slug = $1";

    const check = await db.query(lookupQuery, [identifier]);
    if (check.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const productId = check.rows[0].id;

    const { updates, values, paramIndex } = processUpdateFields(req.body);

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(productId);
    const queryText = `UPDATE products SET ${updates.join(", ")} WHERE id = $${paramIndex}`;
    console.log("🔍 Executing Update:", {
      query: queryText,
      paramCount: values.length,
      values: values.map((v) =>
        typeof v === "string" && v.length > 50 ? v.substring(0, 50) + "..." : v,
      ),
    });

    const updateResult = await db.query(queryText, values);

    console.log(`📦 Product update result for ${productId}:`, {
      rowCount: updateResult.rowCount,
      updates: updates.length,
    });

    if (updateResult.rowCount === 0) {
      console.warn(
        `⚠️ No product found with ID ${productId} during update attempt.`,
      );
      return res.status(404).json({ error: "Product not found" });
    }

    console.log(
      `📦 Product updated successfully: ${productId} by ${req.admin?.username}`,
    );
    if (req.admin?.id) {
      await logActivity(
        req.admin.id,
        "product_update",
        "info",
        `Updated product: ${productId}`,
      );
    }

    const result = await db.query(
      `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category = c.id
      WHERE p.id = $1
    `,
      [productId],
    );
    const product = result.rows[0] as ProductRow;

    res.json({
      success: true,
      product: parseProduct(product),
    });
  } catch (error) {
    // For debugging: also write to a file in the workspace
    const logPath = path.join(process.cwd(), "product_update_error.log");
    const logContent = JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        productId: req.params.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        body: req.body,
      },
      null,
      2,
    );
    fs.appendFileSync(logPath, logContent + "\n---\n");

    res.status(500).json({
      error:
        error instanceof Error
          ? `Failed: ${error.message}`
          : "Failed to update product",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// PATCH /api/products/:id/stock - Update stock only (Admin)
router.patch(
  "/:id/stock",
  adminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      const identifier = String(req.params.id);
      const { inStock, stockQuantity } = req.body;

      // Check if product exists - Cast id to text for safety
      const check = await db.query(
        "SELECT id FROM products WHERE id::text = $1 OR sku = $1 OR slug = $1",
        [identifier],
      );
      if (check.rowCount === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      const productId = check.rows[0].id;

      // Update stock fields
      if (stockQuantity !== undefined) {
        const newInStock = stockQuantity > 0;
        await db.query(
          `
        UPDATE products SET 
          "stockQuantity" = $1,
          "inStock" = $2
        WHERE id = $3
      `,
          [stockQuantity, newInStock, productId],
        );
      } else if (inStock !== undefined) {
        await db.query(
          `
        UPDATE products SET "inStock" = $1 WHERE id = $2
      `,
          [inStock, productId],
        );
      }

      console.log(`📦 Stock updated: ${productId} by ${req.admin?.username}`);
      if (req.admin?.id) {
        await logActivity(
          req.admin.id,
          "stock_update",
          "info",
          `Updated stock for product ID: ${productId}. New quantity: ${stockQuantity}`,
        );
      }

      const result = await db.query("SELECT * FROM products WHERE id = $1", [
        productId,
      ]);
      const product = result.rows[0] as ProductRow;

      res.json({
        success: true,
        product: parseProduct(product),
      });
    } catch (error) {
      console.error("Error updating stock:", error);
      res.status(500).json({ error: "Failed to update stock" });
    }
  },
);

// DELETE /api/products/:id - Delete product (Admin - Manager+)
router.delete(
  "/:id",
  adminAuth,
  requireRole("manager"),
  async (req: AdminRequest, res: Response) => {
    try {
      const identifier = String(req.params.id);

      // Resilient lookup: check ID, SKU, or Slug - Cast ID to text for safety
      const lookupQuery =
        "SELECT id, name FROM products WHERE id::text = $1 OR sku = $1 OR slug = $1";

      const result = await db.query(lookupQuery, [identifier]);
      const existing = result.rows[0];

      if (!existing) {
        return res.status(404).json({ error: "Product not found" });
      }

      await db.query("DELETE FROM products WHERE id = $1", [existing.id]);

      console.log(
        `🗑️ Product deleted: ${existing.name} by ${req.admin?.username}`,
      );
      if (req.admin?.id) {
        await logActivity(
          req.admin.id,
          "product_delete",
          "warning",
          `Deleted product: ${existing.name} (ID: ${existing.id})`,
        );
      }

      res.json({
        success: true,
        message: `Product "${existing.name}" deleted`,
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  },
);

export default router;
