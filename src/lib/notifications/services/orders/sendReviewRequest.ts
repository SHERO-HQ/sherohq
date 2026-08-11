import { sendEmail, wrapEmailHtml } from "../../core/email";
import { toReadableOrderId } from "@/utils/orderId";
import { ShippingInfo } from "../../types";

export async function sendReviewRequestNotification(
  orderId: string,
  shippingInfo: ShippingInfo,
) {
  const readableOrderId = toReadableOrderId(orderId);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
  const trackUrl = baseUrl.includes("shop.") ? baseUrl.replace("shop.", "") : baseUrl;

  const bodyHtml = `
    <h1 style="color: #059669; text-align: center; margin: 0 0 20px; font-size: 18px;">How did we do?</h1>
    <p style="margin: 0 0 16px;">Hi ${shippingInfo.firstName},</p>
    <p style="margin: 0 0 16px;">Your order <strong>${readableOrderId}</strong> was recently delivered. We'd love to hear about your experience!</p>
    <p style="text-align: center; margin-top: 24px;">
      <a href="${trackUrl}/feedback?order=${orderId}" style="display: inline-block; padding: 12px 32px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Leave a Review</a>
    </p>
  `;

  const htmlContent = wrapEmailHtml(bodyHtml, {
    preheader: "How was your experience with SHERO?",
  });

  await sendEmail(
    shippingInfo.email,
    `How was your order ${readableOrderId}?`,
    htmlContent,
  );
}
