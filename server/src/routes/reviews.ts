import express from "express";
import { rateLimit } from "express-rate-limit";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database";
import { adminAuth, AdminRequest } from "../middleware/adminAuth";
import { logActivity } from "./activity";

const router = express.Router();

// Rate limit review submission to prevent fake review spam
const reviewSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many review submissions, please try again later." },
});

// GET all reviews (Admin)
router.get("/", adminAuth, async (req: AdminRequest, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM reviews ORDER BY "createdAt" DESC',
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// GET all reviews for a product
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await db.query(
      'SELECT * FROM reviews WHERE "productId" = $1 ORDER BY "createdAt" DESC',
      [productId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST a new review
router.post("/:productId", reviewSubmitLimiter, async (req, res) => {
  try {
    const { productId } = req.params;
    const { userName, rating, comment } = req.body;

    if (!userName || !rating) {
      res.status(400).json({ error: "Name and rating are required" });
      return;
    }

    const reviewId = uuidv4();

    await db.query(
      `INSERT INTO reviews (id, "productId", "userName", rating, comment, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        reviewId,
        productId,
        userName,
        rating,
        comment || "",
        new Date().toISOString(),
      ],
    );

    // Update product rating and reviews count
    const statsRes = await db.query(
      'SELECT AVG(rating) as "avgRating", COUNT(*) as count FROM reviews WHERE "productId" = $1',
      [productId],
    );
    const stats = statsRes.rows[0];

    await db.query(
      "UPDATE products SET rating = $1, reviews = $2 WHERE id = $3",
      [
        Math.round((Number(stats.avgRating) || 0) * 10) / 10,
        Number(stats.count),
        productId,
      ],
    );

    res.status(201).json({
      success: true,
      review: {
        id: reviewId,
        productId,
        userName,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// DELETE a review (Admin)
router.delete("/:id", adminAuth, async (req: AdminRequest, res) => {
  try {
    const { id } = req.params;

    // Check if review exists
    const check = await db.query("SELECT * FROM reviews WHERE id = $1", [id]);
    if (check.rowCount === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    const review = check.rows[0];

    await db.query("DELETE FROM reviews WHERE id = $1", [id]);

    console.log(`🗑️ Review deleted by ${req.admin?.username}`);
    if (req.admin?.id) {
      await logActivity(
        req.admin.id,
        "review_delete",
        "warning",
        `Deleted review from ${review.userName} (ID: ${id}) on product ${review.productId}`,
      );
    }

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
