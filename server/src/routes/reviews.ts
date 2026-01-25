import express from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database";

const router = express.Router();

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
router.post("/:productId", async (req, res) => {
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

export default router;
