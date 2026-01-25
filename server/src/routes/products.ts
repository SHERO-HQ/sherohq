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
  price: number;
  originalPrice: number | null;
  image: string | null;
  images: string | null;
  rating: number;
  reviews: number;
  badge: string | null;
  inStock: number;
  stockQuantity: number;
  description: string | null;
  features: string | null;
  specifications: string | null;
  createdAt: string;
}

// Helper to parse JSON fields
function parseProduct(row: ProductRow) {
  return {
    ...row,
    images: row.images ? JSON.parse(row.images) : null,
    features: row.features ? JSON.parse(row.features) : null,
    specifications: row.specifications ? JSON.parse(row.specifications) : null,
    inStock: Boolean(row.inStock),
  };
}

// GET /api/products - List all products
router.get("/", (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let query = "SELECT * FROM products";
    const params: (string | number)[] = [];
    const conditions: string[] = [];

    if (category && category !== "all") {
      conditions.push("category = ?");
      params.push(String(category));
    }

    if (search) {
      conditions.push("(name LIKE ? OR description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY createdAt DESC";

    const products = db.prepare(query).all(...params) as ProductRow[];
    res.json(products.map(parseProduct));
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id - Get single product
router.get("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);

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
router.get("/categories/list", (req: Request, res: Response) => {
  try {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// ============ ADMIN ROUTES (Protected) ============

// POST /api/products - Create new product (Admin)
router.post("/", adminAuth, (req: AdminRequest, res: Response) => {
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

    db.prepare(
      `
      INSERT INTO products (id, name, category, price, originalPrice, image, images, rating, reviews, badge, inStock, stockQuantity, description, features, specifications)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
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
      inStock ? 1 : 0,
      stockQuantity,
      description || null,
      features ? JSON.stringify(features) : null,
      specifications ? JSON.stringify(specifications) : null,
    );

    console.log(`📦 Product created: ${name} by ${req.admin?.username}`);

    const product = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(productId) as ProductRow;

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
router.put("/:id", adminAuth, (req: AdminRequest, res: Response) => {
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
    const existing = db.prepare("SELECT id FROM products WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    db.prepare(
      `
      UPDATE products SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        price = COALESCE(?, price),
        originalPrice = ?,
        image = COALESCE(?, image),
        images = ?,
        rating = COALESCE(?, rating),
        reviews = COALESCE(?, reviews),
        badge = ?,
        inStock = COALESCE(?, inStock),
        stockQuantity = COALESCE(?, stockQuantity),
        description = COALESCE(?, description),
        features = ?,
        specifications = ?
      WHERE id = ?
    `,
    ).run(
      name,
      category,
      price,
      originalPrice ?? null,
      image,
      images ? JSON.stringify(images) : null,
      rating,
      reviews,
      badge ?? null,
      inStock !== undefined ? (inStock ? 1 : 0) : undefined,
      stockQuantity,
      description,
      features ? JSON.stringify(features) : null,
      specifications ? JSON.stringify(specifications) : null,
      id,
    );

    console.log(`📦 Product updated: ${id} by ${req.admin?.username}`);

    const product = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(id) as ProductRow;

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
router.patch("/:id/stock", adminAuth, (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { inStock, stockQuantity } = req.body;

    // Check if product exists
    const existing = db.prepare("SELECT id FROM products WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update stock fields
    if (stockQuantity !== undefined) {
      const newInStock = stockQuantity > 0;
      db.prepare(
        `
        UPDATE products SET 
          stockQuantity = ?,
          inStock = ?
        WHERE id = ?
      `,
      ).run(stockQuantity, newInStock ? 1 : 0, id);
    } else if (inStock !== undefined) {
      db.prepare(
        `
        UPDATE products SET inStock = ? WHERE id = ?
      `,
      ).run(inStock ? 1 : 0, id);
    }

    console.log(`📦 Stock updated: ${id} by ${req.admin?.username}`);

    const product = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(id) as ProductRow;

    res.json({
      success: true,
      product: parseProduct(product),
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ error: "Failed to update stock" });
  }
});

// DELETE /api/products/:id - Delete product (Admin)
router.delete("/:id", adminAuth, (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existing = db
      .prepare("SELECT name FROM products WHERE id = ?")
      .get(id) as { name: string } | undefined;
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    db.prepare("DELETE FROM products WHERE id = ?").run(id);

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
