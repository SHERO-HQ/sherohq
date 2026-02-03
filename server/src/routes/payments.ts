import { Router, Request, Response } from "express";
import { paymentService } from "../services/PaymentService";
import db from "../db/database";

const router = Router();

// POST /api/payments/initialize - Start payment flow
router.post("/initialize", async (req: Request, res: Response) => {
  try {
    const { orderId, totalAmount, description, provider } = req.body;

    if (!orderId || !totalAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch order to get customer email
    const orderRes = await db.query(
      `SELECT "shippingInfo" FROM orders WHERE id = $1`,
      [orderId],
    );

    if (orderRes.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const shippingInfo =
      typeof orderRes.rows[0].shippingInfo === "string"
        ? JSON.parse(orderRes.rows[0].shippingInfo)
        : orderRes.rows[0].shippingInfo;

    const email = shippingInfo.email || "guest@sherotech.com";

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
      email,
      provider,
    });

    res.json({ success: true, checkoutUrl });
  } catch (error: unknown) {
    console.error("Payment initialization error:", error);
    res.status(500).json({
      error: "Failed to initialize payment",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST /api/payments/webhook - Handle Payment notifications (Hubtel & Paystack)
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const data = req.body;
    console.log("💰 Payment Webhook Received:", JSON.stringify(data, null, 2));

    let orderId = "";
    let status = "";

    // Check if it's Paystack (event based)
    if (data.event === "charge.success" && data.data) {
      orderId = data.data.reference;
      status = data.data.status === "success" ? "Success" : "Failed";
      console.log(`Processing Paystack webhook for order: ${orderId}`);
    }
    // Check if it's Hubtel (Status/ClientReference based)
    else if (data.ClientReference && data.Status) {
      orderId = data.ClientReference;
      status = data.Status;
      console.log(`Processing Hubtel webhook for order: ${orderId}`);
    } else {
      console.warn("Unknown webhook format");
      return res.sendStatus(400);
    }

    if (status === "Success" && orderId) {
      // Update order status to 'processing' (paid)
      await db.query("UPDATE orders SET status = $1 WHERE id = $2", [
        "processing",
        orderId,
      ]);
      console.log(`✅ Order ${orderId} marked as PAID via Webhook`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook handling error:", error);
    res.sendStatus(500);
  }
});

export default router;
