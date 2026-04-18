import { Router, Request, Response } from "express";
import db from "../db/database";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

/**
 * GET /api/admin/search
 * Global admin search across products, orders, customers, and inquiries.
 */
router.get("/", adminAuth, async (req: Request, res: Response) => {
  const queryText = req.query.q as string;
  
  if (!queryText || queryText.trim().length < 2) {
    return res.json({
      products: [],
      orders: [],
      users: [],
      inquiries: [],
    });
  }

  const searchTerm = `%${queryText.trim()}%`;

  try {
    // 1. Search Products (name, sku)
    const productsRes = await db.query(
      `SELECT id, name, sku, price, image, category 
       FROM products 
       WHERE name ILIKE $1 OR sku ILIKE $1 
       LIMIT 5`,
      [searchTerm]
    );

    // 2. Search Orders (id, shippingInfo JSONB)
    const ordersRes = await db.query(
      `SELECT id, total, status, "createdAt", "shippingInfo" 
       FROM orders 
       WHERE id::text ILIKE $1 
       OR "shippingInfo"->>'firstName' ILIKE $1 
       OR "shippingInfo"->>'lastName' ILIKE $1 
       OR "shippingInfo"->>'email' ILIKE $1 
       LIMIT 5`,
      [searchTerm]
    );

    // 3. Search Customers (Users table - name, email, phone)
    const usersRes = await db.query(
      `SELECT id, name, email, phone, avatar 
       FROM users 
       WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 
       LIMIT 5`,
      [searchTerm]
    );

    // 4. Search Inquiries (name, email, subject)
    const inquiriesRes = await db.query(
      `SELECT id, name, email, subject, status 
       FROM inquiries 
       WHERE name ILIKE $1 OR email ILIKE $1 OR subject ILIKE $1 
       LIMIT 5`,
      [searchTerm]
    );

    res.json({
      products: productsRes.rows,
      orders: ordersRes.rows,
      users: usersRes.rows,
      inquiries: inquiriesRes.rows,
    });
  } catch (error) {
    console.error("Global admin search error:", error);
    res.status(500).json({ error: "Failed to perform search" });
  }
});

export default router;
