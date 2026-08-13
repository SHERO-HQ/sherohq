import { COMPANY_CONTACTS } from "@/constants/contacts";
import { sendEmail, wrapEmailHtml } from "../../core/email";
import { formatToInternationalPhone } from "../../core/whatsapp";
import { sendWhatsAppMessageDirect, storeOutgoingMessage } from "@/lib/whatsapp-messages";
import { toReadableOrderId } from "@/utils/orderId";
import { OrderItem, ShippingInfo } from "../../types";

export interface SendPendingOrderReminderParams {
  orderId: string;
  shippingInfo: ShippingInfo;
  items: OrderItem[];
  total: number;
  paymentMethod?: string;
  createdAt?: string | Date;
  stage: "1hr" | "24hr";
  securityToken?: string;
}

export async function sendPendingOrderReminderNotification({
  orderId,
  shippingInfo,
  items,
  total,
  paymentMethod,
  stage,
  securityToken,
}: SendPendingOrderReminderParams) {
  const readableOrderId = toReadableOrderId(orderId);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
  const payUrl = `${baseUrl}/checkout/pay?id=${orderId}${securityToken ? `&token=${encodeURIComponent(securityToken)}` : ""}`;
  const trackUrl = `${baseUrl}/track/${orderId}${securityToken ? `&token=${encodeURIComponent(securityToken)}` : ""}`;

  const isFirstReminder = stage === "1hr";
  const subject = isFirstReminder
    ? `Action Required: Complete your order ${readableOrderId}`
    : `Final Reminder: Your reserved order ${readableOrderId} is awaiting payment`;

  const bannerTitle = isFirstReminder
    ? "Complete Your Order 🛒"
    : "Your Reservation is Expiring Soon ⏳";

  const bannerText = isFirstReminder
    ? `Hi <strong>${shippingInfo.firstName}</strong>, we noticed you started an order for <strong>${readableOrderId}</strong> but payment was not finalized. We have reserved your items so you won't miss out.`
    : `Hi <strong>${shippingInfo.firstName}</strong>, this is a quick reminder that your order <strong>${readableOrderId}</strong> is still waiting for payment. Complete your checkout today before stock is released.`;

  // Build items rows
  const itemsHtml = (items || [])
    .map((item) => {
      const imgUrl =
        item.image && !item.image.startsWith("http")
          ? `${baseUrl}${item.image}`
          : item.image || "";

      const imgHtml = imgUrl
        ? `<img src="${imgUrl}" alt="${item.name}" width="40" height="40" style="border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0; display: block;" />`
        : "";

      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
              <tr>
                ${imgHtml ? `<td style="padding-right: 12px; vertical-align: middle; width: 40px;">${imgHtml}</td>` : ""}
                <td style="vertical-align: middle;">
                  <strong style="display: block; font-family: Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 2px;">${item.name}</strong>
                  ${item.sku ? `<span style="font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #64748b;">SKU: ${item.sku}</span>` : ""}
                </td>
              </tr>
            </table>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; color: #475569; font-family: Helvetica, Arial, sans-serif; font-size: 12px; width: 45px;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; color: #475569; font-family: 'Courier New', Courier, monospace; font-size: 12px; width: 85px;">
            GHS${Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; color: #1e293b; font-family: Helvetica, Arial, sans-serif; font-weight: bold; font-size: 12px; width: 90px;">
            GHS${(Number(item.price) * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
        </tr>`;
    })
    .join("");

  const bodyHtml = `
    <!-- Top Summary Banner -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 20px;">
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; color: #92400e; margin-bottom: 4px;">${bannerTitle}</div>
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #78350f; line-height: 1.5;">
            ${bannerText}
          </div>
        </td>
      </tr>
    </table>

    <!-- Items Table -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
      <thead>
        <tr>
          <th style="padding: 0 0 12px 0; text-align: left; font-family: Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; color: #94a3b8; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0;">ITEM</th>
          <th style="padding: 0 0 12px 0; text-align: right; font-family: Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; color: #94a3b8; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; width: 45px;">QTY</th>
          <th style="padding: 0 0 12px 0; text-align: right; font-family: Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; color: #94a3b8; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; width: 85px;">PRICE</th>
          <th style="padding: 0 0 12px 0; text-align: right; font-family: Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; color: #94a3b8; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; width: 90px;">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Total -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
      <tr>
        <td style="text-align: right; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #64748b; padding-right: 12px;">Total Due:</td>
        <td style="text-align: right; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: bold; color: #043284; width: 110px;">
          GHS${Number(total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
    </table>

    <!-- Primary Action Button -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
      <tr>
        <td style="text-align: center;">
          <a href="${payUrl}" style="display: inline-block; background-color: #043284; color: #ffffff; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; padding: 14px 36px; border-radius: 6px; text-decoration: none; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(4, 50, 132, 0.2);">
            Complete Payment Now →
          </a>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding-top: 12px;">
          <a href="${trackUrl}" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #64748b; text-decoration: underline;">
            View order details
          </a>
        </td>
      </tr>
    </table>

    <!-- Assistance Note -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-top: 16px;">
      <tr>
        <td style="padding: 14px 16px; font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #64748b; line-height: 1.5;">
          <strong>Need help completing your payment?</strong><br />
          If you experienced issues with Mobile Money network prompts or card authorization, reach out to our team directly on WhatsApp at <a href="https://wa.me/${COMPANY_CONTACTS.WHATSAPP}" style="color: #059669; font-weight: bold; text-decoration: none;">${COMPANY_CONTACTS.PHONE_DISPLAY}</a>.
        </td>
      </tr>
    </table>
  `;

  const htmlContent = wrapEmailHtml(bodyHtml, {
    preheader: `Your reserved items for order ${readableOrderId} are awaiting payment confirmation.`,
  });

  if (shippingInfo.email) {
    try {
      await sendEmail(shippingInfo.email, subject, htmlContent);
    } catch (emailErr) {
      console.error(`Failed to send pending order reminder email to ${shippingInfo.email}:`, emailErr);
    }
  }

  // Send WhatsApp notification if customer phone is available
  const customerPhone = formatToInternationalPhone(shippingInfo.phone);
  if (customerPhone) {
    const waMessage =
      `Hi ${shippingInfo.firstName},\n\n` +
      `We noticed your order *${readableOrderId}* (GHS ${Number(total).toFixed(2)}) at *SHERO TECHNOLOGIES* is pending payment.\n\n` +
      `Complete your payment securely here to confirm your order:\n` +
      `🔗 ${payUrl}\n\n` +
      `If you need any assistance, feel free to reply directly to this message!`;

    sendWhatsAppMessageDirect(
      customerPhone,
      waMessage,
      "pending_order_reminder",
      "en",
      [shippingInfo.firstName, readableOrderId]
    )
      .then((res) => {
        if (res.success && res.messageId) {
          const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "system";
          storeOutgoingMessage(
            res.messageId,
            null,
            customerPhone,
            phoneNumberId,
            waMessage,
            { template: "pending_order_reminder", orderId, stage }
          ).catch((e) => console.error("Failed to store WhatsApp pending reminder", e));
        }
      })
      .catch((err) =>
        console.error("Customer WhatsApp pending reminder failed:", err)
      );
  }
}
