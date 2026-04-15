import { Router, Request, Response } from "express";
import { createHash } from "node:crypto";
import { paymentService } from "../services/PaymentService";
import db from "../db/database";
import { validateBody } from "../middleware/validate";
import { InitializePaymentSchema } from "../schemas";
import { verifyPaystackSignature } from "../middleware/webhookAuth";
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
  verifyPaystackSignature(process.env.PAYMENT_WEBHOOK_SECRET || ""),
  async (req: Request, res: Response) => {
    try {
      const data = req.body;
      console.log(
        "💰 Payment Webhook Received:",
        JSON.stringify(data, null, 2),
      );

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

        // 🔥 Send Payment Receipt (Async)
        try {
          const orderResult = await db.query(
            "SELECT * FROM orders WHERE id = $1",
            [orderId],
          );
          if (orderResult && orderResult.rowCount && orderResult.rowCount > 0) {
            const order = orderResult.rows[0];
            const items =
              typeof order.items === "string"
                ? JSON.parse(order.items)
                : order.items;
            const shippingInfo =
              typeof order.shippingInfo === "string"
                ? JSON.parse(order.shippingInfo)
                : order.shippingInfo;

            const { notificationService } =
              await import("../services/NotificationService");
            notificationService
              .sendPaymentReceipt(
                orderId,
                shippingInfo,
                items,
                Number(order.total),
                {
                  method: order.paymentMethod,
                  transactionId: data.data?.id || data.TransactionId || "N/A",
                },
              )
              .catch((err) =>
                console.error("Receipt notification trigger failed:", err),
              );
          }
        } catch (err) {
          console.error("Failed to fetch order for receipt:", err);
        }
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("Webhook handling error:", error);
      res.sendStatus(500);
    }
  },
);

export default router;
