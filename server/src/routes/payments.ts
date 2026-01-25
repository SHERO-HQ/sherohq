import { Router, Request, Response } from "express";
import { paymentService } from "../services/PaymentService";
import db from "../db/database";

const router = Router();

// POST /api/payments/initialize - Start payment flow
router.post("/initialize", async (req: Request, res: Response) => {
  try {
    const { orderId, totalAmount, description } = req.body;

    if (!orderId || !totalAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const returnUrl = `${process.env.PUBLIC_URL || "http://localhost:5173"}/checkout/success?orderId=${orderId}`;
    const cancellationUrl = `${process.env.PUBLIC_URL || "http://localhost:5173"}/checkout?canceled=true`;
    const callbackUrl = `${process.env.API_URL || "http://localhost:5000"}/api/payments/webhook`;

    const checkoutUrl = await paymentService.initiatePayment({
      totalAmount,
      description: description || `Order #${orderId}`,
      callbackUrl,
      returnUrl,
      cancellationUrl,
      clientReference: orderId,
    });

    res.json({ success: true, checkoutUrl });
  } catch (error: any) {
    console.error("Payment initialization error:", error);
    res
      .status(500)
      .json({ error: "Failed to initialize payment", details: error.message });
  }
});

// POST /api/payments/webhook - Handle Hubtel notifications
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const data = req.body;
    console.log("💰 Hubtel Webhook Received:", JSON.stringify(data, null, 2));

    const { ClientReference, Status } = data; // Hubtel sends PascalCase keys

    if (Status === "Success") {
      // Update order status to 'processing' (paid)
      await db.query("UPDATE orders SET status = $1 WHERE id = $2", [
        "processing",
        ClientReference,
      ]);
      console.log(`✅ Order ${ClientReference} marked as PAID via Webhook`);

      // Trigger notifications if not already sent (optional check logic here)
      // Note: In our current flow, we send notifications immediately on creation.
      // You might want to move that logic here for "Paid" confirmation only.
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook handling error:", error);
    res.sendStatus(500);
  }
});

export default router;
