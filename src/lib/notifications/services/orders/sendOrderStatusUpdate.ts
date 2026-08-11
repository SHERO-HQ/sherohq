import { sendEmail, wrapEmailHtml } from "../../core/email";
import { formatToInternationalPhone } from "../../core/whatsapp";
import { sendWhatsAppMessageDirect, storeOutgoingMessage } from "@/lib/whatsapp-messages";
import { toReadableOrderId } from "@/utils/orderId";
import { ShippingInfo } from "../../types";

export async function sendOrderStatusUpdateNotification(
  orderId: string,
  newStatus: string,
  shippingInfo: ShippingInfo,
) {
  const readableOrderId = toReadableOrderId(orderId);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
  const trackUrl = baseUrl.includes("shop.") ? baseUrl.replace("shop.", "") : baseUrl;

  let title = "Order Update";
  let message = `There is an update on your order <strong>${readableOrderId}</strong>.`;
  let preheader = "Update on your SHERO order.";

  if (newStatus === "intransit") {
    title = "Your Order is on the Way!";
    message = `Great news, ${shippingInfo.firstName.trim()}! Your order <strong>${readableOrderId}</strong> has been dispatched and is in transit to you.`;
    preheader = "Your SHERO order is in transit!";
  } else if (newStatus === "delivered") {
    title = "Your Order has been Delivered!";
    message = `Hi ${shippingInfo.firstName.trim()}, your order <strong>${readableOrderId}</strong> has been delivered. We hope you love your new gear!`;
    preheader = "Your SHERO order has been delivered!";
  }

  let feedbackNudge = "";
  if (newStatus === "delivered") {
    feedbackNudge = `
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; text-align: center; margin-top: 32px; border: 1px solid #e2e8f0;">
      <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #0f172a;">How did we do?</p>
      <p style="margin: 0 0 16px; font-size: 13px; color: #64748b;">We'd love to hear about your experience.</p>
      <a href="${baseUrl}/feedback?order=${orderId}" style="display: inline-block; padding: 10px 24px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px;">Share Feedback</a>
    </div>
    `;
  }

  const bodyHtml = `
    <h1 style="color: #059669; text-align: center; margin: 0 0 20px; font-size: 18px;">${title}</h1>
    <p style="margin: 0 0 16px;">${message}</p>
    <p style="text-align: center; margin-top: 24px;">
      <a href="${trackUrl}/track/${orderId}" style="display: inline-block; padding: 12px 32px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Your Order</a>
    </p>
    ${feedbackNudge}
  `;

  const htmlContent = wrapEmailHtml(bodyHtml, { preheader });

  await sendEmail(
    shippingInfo.email,
    `Order Update: ${title}`,
    htmlContent,
  );

  // WhatsApp Notification
  const customerPhone = formatToInternationalPhone(shippingInfo.phone);
  if (customerPhone) {
    let waMessage = `Hi ${shippingInfo.firstName},\n\nThere is an update on your order *${readableOrderId}* at *SHERO TECHNOLOGIES*.\n\n`;
    let statusDesc = "updated";
    if (newStatus === "intransit") {
      waMessage = `Hi ${shippingInfo.firstName} 🚚\n\nYour order *${readableOrderId}* from *SHERO TECHNOLOGIES* has been dispatched and is in transit to you!\n\n`;
      statusDesc = "in transit";
    }
    if (newStatus === "delivered") {
      waMessage = `Hi ${shippingInfo.firstName} 🎉\n\nYour order *${readableOrderId}* from *SHERO TECHNOLOGIES* has been delivered!\n\nWe hope you love it.\n\n`;
      statusDesc = "delivered";
    }

    waMessage += `🔗 *Track your order:* ${trackUrl}/track/${orderId}`;

    sendWhatsAppMessageDirect(
      customerPhone,
      waMessage,
      "order_update",
      "en",
      [shippingInfo.firstName, readableOrderId, statusDesc]
    ).then((res) => {
      if (res.success && res.messageId) {
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "system";
        storeOutgoingMessage(
          res.messageId,
          null,
          customerPhone,
          phoneNumberId,
          waMessage,
          { template: "order_update", orderId, newStatus }
        ).catch(e => console.error("Failed to store WhatsApp order update", e));
      }
    }).catch((err) =>
      console.error(
        "Customer WhatsApp status update notification failed:",
        err,
      ),
    );
  }
}
