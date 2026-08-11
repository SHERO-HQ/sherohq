import { sendEmail, wrapEmailHtml } from "../../core/email";
import { formatToInternationalPhone } from "../../core/whatsapp";
import { sendWhatsAppMessageDirect, storeOutgoingMessage } from "@/lib/whatsapp-messages";
import { generateInvoicePdf } from "../../../pdfInvoice";
import { toReadableOrderId } from "@/utils/orderId";
import { OrderItem, ShippingInfo } from "../../types";

export async function sendPaymentFailureNotification(
  orderId: string,
  shippingInfo: ShippingInfo,
  items?: OrderItem[],
  total?: number,
  paymentMethod?: string,
) {
  const readableOrderId = toReadableOrderId(orderId);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
  const trackUrl = baseUrl.includes("shop.") ? baseUrl.replace("shop.", "") : baseUrl;

  const bodyHtml = `
    <h1 style="color: #dc2626; text-align: center; margin: 0 0 20px; font-size: 18px;">Payment Was Not Completed</h1>
    <p>Hi ${shippingInfo.firstName},</p>
    <p>Unfortunately, your payment for order <strong>${readableOrderId}</strong> could not be processed successfully.</p>
    <p>Don't worry, no money was deducted from your account. You can try again or contact our support team for assistance.</p>
    <p style="text-align: center; margin-top: 20px;">
      <a href="${baseUrl}/shop/checkout?retry=${orderId}" style="display: inline-block; padding: 10px 28px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Try Again</a>
    </p>
    <p style="text-align: center; margin-top: 8px;">
      <a href="${trackUrl}/track/${orderId}" style="color: #059669; text-decoration: none;">View your order details →</a>
    </p>
  `;
  const htmlContent = wrapEmailHtml(bodyHtml);

  let attachments;
  if (items && items.length > 0 && total !== undefined) {
    try {
      const pdfBuffer = await generateInvoicePdf(
        orderId,
        shippingInfo,
        items,
        total,
        paymentMethod || "card",
        new Date(),
        "FAILED"
      );
      attachments = [
        { filename: `Receipt-FAILED-${readableOrderId}.pdf`, content: pdfBuffer },
      ];
    } catch (e) {
      console.error("Failed to generate PDF failure receipt:", e);
    }
  }

  await sendEmail(
    shippingInfo.email,
    `Payment Failed - Order ${readableOrderId}`,
    htmlContent,
    { attachments }
  );

  // Alert Customer via WhatsApp
  const customerPhone = formatToInternationalPhone(shippingInfo.phone);
  if (customerPhone) {
    const customerMsg =
      `Hi ${shippingInfo.firstName},\n\n` +
      `Unfortunately, the payment for your order *${readableOrderId}* at *SHERO TECHNOLOGIES* failed.\n\n` +
      `You can try again or contact us for help.\n\n` +
      `🔗 *View Order:* ${trackUrl}/track/${orderId}`;

    sendWhatsAppMessageDirect(
      customerPhone,
      customerMsg,
      "payment_failed",
      "en",
      [shippingInfo.firstName, readableOrderId]
    ).then((res) => {
      if (res.success && res.messageId) {
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "system";
        storeOutgoingMessage(
          res.messageId,
          null,
          customerPhone,
          phoneNumberId,
          customerMsg,
          { template: "payment_failed", orderId }
        ).catch(e => console.error("Failed to store WhatsApp payment failure", e));
      }
    }).catch((err) =>
      console.error("Customer WhatsApp failure notification failed:", err),
    );
  }
}
