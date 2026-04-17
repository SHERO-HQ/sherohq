import { Router, Request, Response } from "express";
import { createHash } from "node:crypto";
import { v4 as uuidv4 } from "uuid";
import { paymentService } from "../services/PaymentService";
import db from "../db/database";
import { validateBody } from "../middleware/validate";
import { InitializePaymentSchema } from "../schemas";
import { verifyProviderWebhook } from "../middleware/webhookAuth";
import {
  ADMIN_SESSION_COOKIE,
  USER_SESSION_COOKIE,
  getTokenFromRequest,
} from "../utils/sessionAuth";

const router = Router();

const hashOrderAccessToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

const readOrderAccessToken = (req: Request): string | null => {
  const tokenHeader = req.headers["x-order-access-token"];
  if (typeof tokenHeader !== "string") return null;
  const token = tokenHeader.trim();
  return token.length > 0 ? token : null;
};

async function resolveUserIdFromRequest(req: Request): Promise<string | null> {
  const token = getTokenFromRequest(req, USER_SESSION_COOKIE);
  if (!token) return null;

  const result = await db.query(
    `SELECT "userId" FROM user_sessions WHERE token = $1 AND "expiresAt" > NOW()`,
    [token],
  );

  return result.rows[0]?.userId || null;
}

async function resolveAdminIdFromRequest(req: Request): Promise<string | null> {
  const token = getTokenFromRequest(req, ADMIN_SESSION_COOKIE);
  if (!token) return null;

  const result = await db.query(
    `SELECT "adminId" FROM sessions WHERE token = $1 AND "expiresAt" > NOW()`,
    [token],
  );

  return result.rows[0]?.adminId || null;
}

// POST /api/payments/initialize - Start payment flow
router.post(
  "/initialize",
  validateBody(InitializePaymentSchema),
  async (req: Request, res: Response) => {
    try {
      const { orderId, description, provider } = req.body;

      // Fetch order to get customer email, total, and ownership context
      const orderRes = await db.query(
        `SELECT "shippingInfo", total, status, "userId", "orderAccessTokenHash" FROM orders WHERE id = $1`,
        [orderId],
      );

      if (orderRes.rowCount === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      const order = orderRes.rows[0] as {
        shippingInfo: string | Record<string, unknown>;
        total: string | number;
        status: string;
        userId?: string | null;
        orderAccessTokenHash?: string | null;
      };

      const [requesterUserId, requesterAdminId] = await Promise.all([
        resolveUserIdFromRequest(req),
        resolveAdminIdFromRequest(req),
      ]);

      const providedOrderAccessToken = readOrderAccessToken(req);
      const hasValidOrderAccessToken =
        Boolean(providedOrderAccessToken) &&
        Boolean(order.orderAccessTokenHash) &&
        hashOrderAccessToken(String(providedOrderAccessToken)) ===
          order.orderAccessTokenHash;

      const isAuthorized =
        Boolean(requesterAdminId) ||
        (Boolean(requesterUserId) &&
          Boolean(order.userId) &&
          requesterUserId === order.userId) ||
        hasValidOrderAccessToken;

      if (!isAuthorized) {
        return res
          .status(403)
          .json({ error: "Unauthorized to initialize payment for this order" });
      }

      if (order.status !== "pending") {
        return res.status(400).json({
          error: "Payment can only be initialized for pending orders",
        });
      }

      const shippingInfo =
        typeof order.shippingInfo === "string"
          ? JSON.parse(order.shippingInfo)
          : order.shippingInfo;

      const totalAmount = Number(order.total);

      const email = shippingInfo.email || "guest@sherohq.com";

      const publicUrl = (
        process.env.PUBLIC_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        "http://localhost:3000"
      ).replace(/\/$/, "");

      const returnUrl = `${publicUrl}/checkout/success?orderId=${orderId}`;
      const cancellationUrl = `${publicUrl}/checkout?canceled=true`;
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
      const isDev = process.env.NODE_ENV === "development";
      res.status(500).json({
        error: "Failed to initialize payment",
        ...(isDev && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    }
  },
);

// POST /api/payments/webhook - Handle Payment notifications (Hubtel & Paystack)
router.post(
  "/webhook",
  verifyProviderWebhook(),
  async (req: Request, res: Response) => {
    let client: any = null;
    try {
      const data = req.body;
      let orderId = "";
      let provider = "";
      let status = "";

      // 1. Identify Provider and Basic Info
      if (data.event?.startsWith("charge.") && data.data) {
        provider = "paystack";
        orderId = data.data.reference;
        status = data.data.status === "success" ? "Success" : "Failed";
      } else if (data.ClientReference && data.Status) {
        provider = "hubtel";
        orderId = data.ClientReference;
        status = data.Status;
      } else {
        console.warn("⚠️ Unknown webhook format received");
        return res.sendStatus(400);
      }

      console.log(`💰 Webhook [${provider}]: Order ${orderId}, Status: ${status}`);

      if (status !== "Success") {
        console.warn(`🔴 Payment failed for order ${orderId} via ${provider}`);
        return res.sendStatus(200); // Still 200 to acknowledge receipt
      }

      // 2. Fetch Order and Verify Amount
      const orderRes = await db.query(
        'SELECT total, status, items, "shippingInfo", "paymentMethod" FROM orders WHERE id = $1 FOR UPDATE',
        [orderId]
      );

      if (orderRes.rowCount === 0) {
        console.error(`❌ Webhook error: Order ${orderId} not found`);
        return res.sendStatus(200);
      }

      const order = orderRes.rows[0];

      // Idempotency check: Ignore if already processed
      if (order.status !== "pending") {
        console.log(`ℹ️ Webhook: Order ${orderId} already in ${order.status} status. Skipping.`);
        return res.sendStatus(200);
      }

      const receivedAmount = paymentService.parseWebhookAmount(provider, data);
      const expectedAmount = Number(order.total);

      // Amount verification (allow for tiny floating point differences if any, but should be exact decimals)
      if (Math.abs(receivedAmount - expectedAmount) > 0.01) {
        console.error(`🚨 FRAUD ALERT: Amount mismatch for order ${orderId}. Expected ${expectedAmount}, Received ${receivedAmount}`);
        return res.status(400).json({ error: "Amount mismatch detected" });
      }

      // 3. Atomically Update Order and Log
      client = await db.getClient();
      await client.query("BEGIN");

      await client.query("UPDATE orders SET status = $1 WHERE id = $2", ["processing", orderId]);

      const transactionId = paymentService.getTransactionId(provider, data);
      
      // Log success activity
      await client.query(
        `INSERT INTO activity_logs (id, "adminId", action, status, details, "createdAt")
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [uuidv4(), null, "order_payment", "success", `Payment received via ${provider}. Transaction: ${transactionId}`]
      );

      await client.query("COMMIT");
      console.log(`✅ Order ${orderId} marked as PAID and verified`);

      // 4. Trigger Notifications (Non-blocking)
      const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
      const shippingInfo = typeof order.shippingInfo === "string" ? JSON.parse(order.shippingInfo) : order.shippingInfo;

      const { notificationService } = await import("../services/NotificationService");
      notificationService.sendPaymentReceipt(
        orderId,
        shippingInfo,
        items,
        expectedAmount,
        {
          method: order.paymentMethod || provider,
          transactionId
        }
      ).catch(err => console.error("Receipt notification trigger failed:", err));

      res.sendStatus(200);
    } catch (error) {
      if (client) await client.query("ROLLBACK");
      console.error("❌ Webhook handling internal error:", error);
      res.sendStatus(500);
    } finally {
      if (client) client.release();
    }
  }
);

export default router;
