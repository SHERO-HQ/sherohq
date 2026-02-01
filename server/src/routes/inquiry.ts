import express from "express";
import { notificationService } from "../services/NotificationService";
import db from "../db/database";
import { adminAuth } from "../middleware/adminAuth";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// GET /api/inquiry/consultations - Get all consultations (Admin)
router.get("/consultations", adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM consultations ORDER BY "createdAt" DESC',
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching consultations:", error);
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
});

// GET /api/inquiry/list - Get all contact inquiries (Admin)
router.get("/list", adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM inquiries ORDER BY "createdAt" DESC',
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

// Schedule Consultation
router.post("/schedule", async (req, res) => {
  try {
    const { email, firstName, lastName, service, date, time } = req.body;

    const name = `${firstName} ${lastName}`.trim();

    // Persist to database
    await db.query(
      "INSERT INTO consultations (id, name, email, phone, service, date, time) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        uuidv4(),
        name,
        email,
        req.body.phone || null,
        service,
        new Date(date),
        time,
      ],
    );

    // Send confirmation email
    await notificationService.sendScheduleConfirmation(
      email,
      name,
      service,
      new Date(date),
      time,
    );

    res.json({ success: true, message: "Consultation scheduled successfully" });
  } catch (error) {
    console.error("Schedule error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Contact Form
router.post("/contact", async (req, res) => {
  try {
    const { email, name, subject, message } = req.body;

    if (!email || !name || !message) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Persist to database
    await db.query(
      "INSERT INTO inquiries (id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)",
      [uuidv4(), name, email, subject || "General Inquiry", message],
    );

    // Send confirmation email
    await notificationService.sendContactConfirmation(
      email,
      name,
      subject || "General Inquiry",
      message,
    );

    res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/inquiry/consultations/:id/status - Update consultation status (Admin)
router.patch("/consultations/:id/status", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: "Missing status" });
      return;
    }

    const result = await db.query(
      "UPDATE consultations SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Consultation not found" });
      return;
    }

    res.json({
      success: true,
      message: "Consultation status updated successfully",
      consultation: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating consultation status:", error);
    res.status(500).json({ error: "Failed to update consultation status" });
  }
});

// DELETE /api/inquiry/consultations/:id - Delete consultation (Admin)
router.delete("/consultations/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM consultations WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Consultation not found" });
      return;
    }

    res.json({ success: true, message: "Consultation deleted successfully" });
  } catch (error) {
    console.error("Error deleting consultation:", error);
    res.status(500).json({ error: "Failed to delete consultation" });
  }
});

// PATCH /api/inquiry/inquiries/:id/status - Update inquiry status (Admin)
router.patch("/inquiries/:id/status", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: "Missing status" });
      return;
    }

    const result = await db.query(
      "UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Inquiry not found" });
      return;
    }

    res.json({
      success: true,
      message: "Inquiry status updated successfully",
      inquiry: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    res.status(500).json({ error: "Failed to update inquiry status" });
  }
});

// DELETE /api/inquiry/inquiries/:id - Delete inquiry (Admin)
router.delete("/inquiries/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM inquiries WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Inquiry not found" });
      return;
    }

    res.json({ success: true, message: "Inquiry deleted successfully" });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    res.status(500).json({ error: "Failed to delete inquiry" });
  }
});

export default router;
