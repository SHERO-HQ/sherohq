import express from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database";

const router = express.Router();

// Create a new support ticket
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message, category, productId, userId } =
      req.body;

    if (!name || !email || !subject || !message || !category) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const id = uuidv4();

    await db.query(
      `INSERT INTO tickets (id, name, email, subject, message, category, "productId", "userId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        name,
        email,
        subject,
        message,
        category,
        productId || null,
        userId || null,
      ],
    );

    res.json({
      success: true,
      message: "Ticket created successfully",
      ticketId: id,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

export default router;
