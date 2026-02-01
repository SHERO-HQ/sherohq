import express from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database";
import { adminAuth } from "../middleware/adminAuth";

const router = express.Router();

// GET /api/tickets - Get all support tickets (Admin)
router.get("/", adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM tickets ORDER BY "createdAt" DESC',
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// Create a new support ticket
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      category,
      productId,
      userId,
    } = req.body;

    if (!name || !email || !subject || !message || !category) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const id = uuidv4();

    const result = await db.query(
      `INSERT INTO tickets (id, name, email, phone, subject, message, category, "productId", "userId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ticket_no`,
      [
        id,
        name,
        email,
        phone || null,
        subject,
        message,
        category,
        productId || null,
        userId && userId !== "authenticated" ? userId : null,
      ],
    );

    res.json({
      success: true,
      message: "Ticket created successfully",
      ticketId: id,
      ticketNo: result.rows[0].ticket_no,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

// PATCH /api/tickets/:id/status - Update ticket status (Admin)
router.patch("/:id/status", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: "Missing status" });
      return;
    }

    const result = await db.query(
      "UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    res.json({
      success: true,
      message: "Ticket status updated successfully",
      ticket: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({ error: "Failed to update ticket status" });
  }
});

export default router;
