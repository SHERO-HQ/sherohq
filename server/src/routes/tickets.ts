import express from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database";
import { adminAuth } from "../middleware/adminAuth";

import { validateBody } from "../middleware/validate";
import { CreateTicketSchema, UpdateTicketSchema } from "../schemas";

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
router.post("/", validateBody(CreateTicketSchema), async (req, res) => {
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

// PATCH /api/tickets/:id - Update ticket (Admin)
router.patch("/:id", adminAuth, validateBody(UpdateTicketSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (priority) {
      updates.push(`priority = $${paramIndex}`);
      values.push(priority);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    const result = await db.query(
      `UPDATE tickets SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    res.json({
      success: true,
      message: "Ticket updated successfully",
      ticket: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ error: "Failed to update ticket" });
  }
});

// GET /api/tickets/track/:id - Public ticket tracking
router.get("/track/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Support tracking by UUID or ticket_no
    const query = isNaN(Number(id)) 
      ? 'SELECT id, ticket_no, name, subject, status, "createdAt", category FROM tickets WHERE id = $1'
      : 'SELECT id, ticket_no, name, subject, status, "createdAt", category FROM tickets WHERE ticket_no = $1';
    
    const result = await db.query(query, [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error tracking ticket:", error);
    res.status(500).json({ error: "Failed to track ticket" });
  }
});

export default router;
