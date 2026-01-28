import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database";
import { adminAuth, AdminRequest } from "../middleware/adminAuth";

const router = Router();

// Database row type for products
interface ProductRow {
  id: string;
  name: string;
  category: string;
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
  createdAt: Date;
}

// Helper to parse JSON fields and numbers
function parseProduct(row: ProductRow) {
  const safeParse = (str: string | null) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error("Failed to parse JSON field:", e);
      return null;
    }
  };

  return {
    ...row,
    price: Number(row.price),
    originalPrice: row.originalPrice ? Number(row.originalPrice) : null,
    rating: Number(row.rating),
    images: safeParse(row.images),
    features: safeParse(row.features),
    specifications: safeParse(row.specifications),
    inStock: Boolean(row.inStock),
  };
}

// GET /api/products - List all products
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let queryText = "SELECT * FROM products";
    const params: (string | number)[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (category && category !== "all") {
      conditions.push(`category = $${paramIndex}`);
      params.push(String(category));
      paramIndex++;
    }

    if (search) {
      conditions.push(
        `(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`,
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += " WHERE " + conditions.join(" AND ");
    }

    queryText += ' ORDER BY "createdAt" DESC';

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
    const { id } = req.params;
    const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);
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

// ============ ADMIN ROUTES (Protected) ============

// POST /api/products - Create new product (Admin)
router.post("/", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const {
      name,
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
    } = req.body;

    if (!name || !category || !price) {
      return res
        .status(400)
        .json({ error: "Name, category, and price are required" });
    }

    const productId = uuidv4();

    await db.query(
      `
      INSERT INTO products (id, name, category, price, "originalPrice", image, images, rating, reviews, badge, "inStock", "stockQuantity", description, features, specifications)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `,
      [
        productId,
        name,
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
      ],
    );

    console.log(`📦 Product created: ${name} by ${req.admin?.username}`);

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

// PUT /api/products/:id - Update product (Admin)
router.put("/:id", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      price,
      originalPrice,
      image,
      images,
      rating,
      reviews,
      badge,
      inStock,
      stockQuantity,
      description,
      features,
      specifications,
    } = req.body;

    // Check if product exists
    const check = await db.query("SELECT id FROM products WHERE id = $1", [id]);
    if (check.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    await db.query(
      `
      UPDATE products SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        price = COALESCE($3, price),
        "originalPrice" = $4,
        image = COALESCE($5, image),
        images = $6,
        rating = COALESCE($7, rating),
        reviews = COALESCE($8, reviews),
        badge = $9,
        "inStock" = COALESCE($10, "inStock"),
        "stockQuantity" = COALESCE($11, "stockQuantity"),
        description = COALESCE($12, description),
        features = $13,
        specifications = $14
      WHERE id = $15
    `,
      [
        name,
        category,
        price,
        originalPrice ?? null,
        image,
        images ? JSON.stringify(images) : null,
        rating,
        reviews,
        badge ?? null,
        inStock,
        stockQuantity,
        description,
        features ? JSON.stringify(features) : null,
        specifications ? JSON.stringify(specifications) : null,
        id,
      ],
    );

    console.log(`📦 Product updated: ${id} by ${req.admin?.username}`);

    const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);
    const product = result.rows[0] as ProductRow;

    res.json({
      success: true,
      product: parseProduct(product),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// PATCH /api/products/:id/stock - Update stock only (Admin)
router.patch(
  "/:id/stock",
  adminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { inStock, stockQuantity } = req.body;

      // Check if product exists
      const check = await db.query("SELECT id FROM products WHERE id = $1", [
        id,
      ]);
      if (check.rowCount === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

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
          [stockQuantity, newInStock, id],
        );
      } else if (inStock !== undefined) {
        await db.query(
          `
        UPDATE products SET "inStock" = $1 WHERE id = $2
      `,
          [inStock, id],
        );
      }

      console.log(`📦 Stock updated: ${id} by ${req.admin?.username}`);

      const result = await db.query("SELECT * FROM products WHERE id = $1", [
        id,
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

// DELETE /api/products/:id - Delete product (Admin)
router.delete("/:id", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const result = await db.query("SELECT name FROM products WHERE id = $1", [
      id,
    ]);
    const existing = result.rows[0];

    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    await db.query("DELETE FROM products WHERE id = $1", [id]);

    console.log(
      `🗑️ Product deleted: ${existing.name} by ${req.admin?.username}`,
    );

    res.json({
      success: true,
      message: `Product "${existing.name}" deleted`,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
