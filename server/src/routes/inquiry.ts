import express from "express";
import { notificationService } from "../services/NotificationService";

const router = express.Router();

// Schedule Consultation
router.post("/schedule", async (req, res) => {
  try {
    const { email, firstName, lastName, service, date, time } = req.body;

    if (!email || !firstName || !service || !date || !time) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const name = `${firstName} ${lastName}`.trim();

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

export default router;
