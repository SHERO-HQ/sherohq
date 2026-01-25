import express from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database";

const router = express.Router();

// GET all reviews for a product
router.get("/:productId", (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = db
      .prepare(
        "SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC",
      )
      .all(productId);
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST a new review
router.post("/:productId", (req, res) => {
  try {
    const { productId } = req.params;
    const { userName, rating, comment } = req.body;

    if (!userName || !rating) {
      res.status(400).json({ error: "Name and rating are required" });
      return;
    }

    const reviewId = uuidv4();

    db.prepare(
      `INSERT INTO reviews (id, productId, userName, rating, comment, createdAt)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    ).run(reviewId, productId, userName, rating, comment || "");

    // Update product rating and reviews count
    const stats = db
      .prepare(
        "SELECT AVG(rating) as avgRating, COUNT(*) as count FROM reviews WHERE productId = ?",
      )
      .get(productId) as { avgRating: number; count: number };

    db.prepare("UPDATE products SET rating = ?, reviews = ? WHERE id = ?").run(
      Math.round((stats.avgRating || 0) * 10) / 10,
      stats.count,
      productId,
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

export default router;
