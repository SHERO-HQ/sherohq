import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to verify webhook signatures using HMAC-SHA256
 * Protects against fake webhook requests
 */
export function verifyWebhookSignature(secret: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get signature from header
            const signature = req.headers["x-webhook-signature"] as string;

            if (!signature) {
                console.warn("🛑 Webhook request missing signature header");
                return res.status(401).json({
                    error: "Missing webhook signature",
                    details: "X-Webhook-Signature header is required",
                });
            }

            if (!secret) {
                console.error("❌ PAYMENT_WEBHOOK_SECRET not configured");
                return res.status(500).json({
                    error: "Webhook verification not configured",
                });
            }

            // Calculate expected signature
            const payload = JSON.stringify(req.body);
            const expectedSignature = crypto
                .createHmac("sha256", secret)
                .update(payload)
                .digest("hex");

            // Lengths must match before timingSafeEqual, or it throws a RangeError
            if (signature.length !== expectedSignature.length) {
                console.error("🔴 Webhook signature length mismatch");
                return res.status(401).json({
                    error: "Invalid webhook signature",
                });
            }

            // Use timing-safe comparison to prevent timing attacks
            const isValid = crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );

            if (!isValid) {
                console.error("🔴 Webhook signature verification failed");
                console.warn(`Received signature: ${signature.substring(0, 20)}...`);
                console.warn(`Expected signature: ${expectedSignature.substring(0, 20)}...`);
                return res.status(401).json({
                    error: "Invalid webhook signature",
                });
            }

            console.log("✅ Webhook signature verified");
            next();
        } catch (error) {
            console.error("Webhook verification error:", error);
            return res.status(500).json({
                error: "Webhook verification failed",
            });
        }
    };
}

/**
 * Middleware to verify Paystack webhook signatures
 * Uses the standard Paystack signature verification method
 */
export function verifyPaystackSignature(secret: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!secret) {
                console.error("❌ PAYMENT_WEBHOOK_SECRET not configured");
                return res.status(500).json({
                    error: "Webhook verification not configured",
                });
            }

            const signature = req.headers["x-paystack-signature"] as string;

            if (!signature) {
                console.warn("🛑 Paystack webhook missing signature");
                return res.status(401).json({
                    error: "Missing Paystack signature",
                });
            }

            const payload = JSON.stringify(req.body);
            const hash = crypto.createHmac("sha512", secret).update(payload).digest("hex");

            // Lengths must match before timingSafeEqual, or it throws a RangeError
            if (hash.length !== signature.length) {
                console.error("🔴 Paystack signature length mismatch");
                return res.status(401).json({
                    error: "Invalid Paystack signature",
                });
            }

            // Use timing-safe comparison to prevent timing attacks
            const isValid = crypto.timingSafeEqual(
                Buffer.from(hash),
                Buffer.from(signature),
            );

            if (!isValid) {
                console.error("🔴 Paystack signature verification failed");
                return res.status(401).json({
                    error: "Invalid Paystack signature",
                });
            }

            console.log("✅ Paystack webhook verified");
            next();
        } catch (error) {
            console.error("Paystack verification error:", error);
            return res.status(500).json({
                error: "Webhook verification failed",
            });
        }
    };
}

/**
 * Middleware to verify Hubtel webhook signatures
 */
export function verifyHubtelSignature(secret: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!secret) {
                console.error("❌ PAYMENT_WEBHOOK_SECRET not configured for Hubtel");
                return res.status(500).json({
                    error: "Webhook verification not configured",
                });
            }

            const signature = req.headers["x-hubtel-signature"] as string;

            if (!signature) {
                console.warn("🛑 Hubtel webhook missing signature");
                return res.status(401).json({
                    error: "Missing Hubtel signature",
                });
            }

            const payload = JSON.stringify(req.body);
            const hash = crypto.createHmac("sha256", secret).update(payload).digest("hex");

            // Lengths must match before timingSafeEqual, or it throws a RangeError
            if (hash.length !== signature.length) {
                console.error("🔴 Hubtel signature length mismatch");
                return res.status(401).json({
                    error: "Invalid Hubtel signature",
                });
            }

            // Use timing-safe comparison to prevent timing attacks
            const isValid = crypto.timingSafeEqual(
                Buffer.from(hash),
                Buffer.from(signature),
            );

            if (!isValid) {
                console.error("🔴 Hubtel signature verification failed");
                return res.status(401).json({
                    error: "Invalid Hubtel signature",
                });
            }

            console.log("✅ Hubtel webhook verified");
            next();
        } catch (error) {
            console.error("Hubtel verification error:", error);
            return res.status(500).json({
                error: "Webhook verification failed",
            });
        }
    };
}
/**
 * Unified middleware to verify webhooks from multiple providers
 */
export function verifyProviderWebhook() {
    return (req: Request, res: Response, next: NextFunction) => {
        const paystackSignature = req.headers["x-paystack-signature"];
        const hubtelSignature = req.headers["x-hubtel-signature"] || req.headers["authorization"];

        if (paystackSignature) {
            console.log("🔍 Detected Paystack webhook");
            return verifyPaystackSignature(process.env.PAYSTACK_SECRET_KEY || "")(req, res, next);
        }

        if (hubtelSignature) {
            console.log("🔍 Detected Hubtel webhook");
            // Hubtel can use HMAC or a static token in Authorization header
            const secret = process.env.HUBTEL_WEBHOOK_SECRET || process.env.HUBTEL_CLIENT_SECRET || "";
            return verifyHubtelSignature(secret)(req, res, next);
        }

        console.warn("🛑 Unknown webhook provider: No recognized signature headers found");
        return res.status(401).json({ error: "Unrecognized webhook provider" });
    };
}
