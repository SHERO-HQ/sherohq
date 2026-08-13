import { COMPANY_CONTACTS } from "@/constants/contacts";
import { COMPANY_EMAILS } from "@/constants/emails";
import { sendEmail, wrapEmailHtml } from "../../core/email";
import { sendWhatsAppNotification, formatToInternationalPhone } from "../../core/whatsapp";
import { sendWhatsAppMessageDirect, storeOutgoingMessage } from "@/lib/whatsapp-messages";
import { generateInvoicePdf } from "../../../pdfInvoice";
import { toReadableOrderId } from "@/utils/orderId";
import { OrderItem, ShippingInfo } from "../../types";

export async function sendOrderConfirmation(
  orderId: string,
  shippingInfo: ShippingInfo,
  items: OrderItem[],
  total: number,
  paymentMethod?: string,
) {
  const readableOrderId = toReadableOrderId(orderId);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
  const trackUrl = baseUrl.includes("shop.") ? baseUrl.replace("shop.", "") : baseUrl;

  // Estimated delivery: 24hrs to 5 business days from now
  const deliveryStart = new Date();
  let addedDays = 0;
  while (addedDays < 1) {
    deliveryStart.setDate(deliveryStart.getDate() + 1);
    if (deliveryStart.getDay() !== 0 && deliveryStart.getDay() !== 6)
      addedDays++;
  }
  const deliveryEnd = new Date(deliveryStart);
  addedDays = 0;
  while (addedDays < 4) {
    deliveryEnd.setDate(deliveryEnd.getDate() + 1);
    if (deliveryEnd.getDay() !== 0 && deliveryEnd.getDay() !== 6) addedDays++;
  }
  const dateOpts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const deliveryRange = `${deliveryStart.toLocaleDateString("en-GH", dateOpts)} – ${deliveryEnd.toLocaleDateString("en-GH", dateOpts)}`;

  // Build item rows
  const itemsHtml = items
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
            GHS${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; color: #1e293b; font-family: Helvetica, Arial, sans-serif; font-weight: bold; font-size: 12px; width: 90px;">
            GHS${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
        </tr>`;
    })
    .join("");

  const bodyHtml = `
    <!-- Top Summary Banner -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 20px;">
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 4px;">Order Confirmed! 🎉</div>
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #475569;">
            Hi <strong>${shippingInfo.firstName}</strong>, we've received order <strong>${readableOrderId}</strong>. Estimated delivery: <span style="color: #059669; font-weight: bold;">${deliveryRange}</span>
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

    <!-- Totals -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 40px;">
      <tr>
        <td style="width: 50%;"></td>
        <td style="width: 50%;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 8px 0; text-align: left; font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #475569;">Subtotal</td>
              <td style="padding: 8px 0; text-align: right; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #1e293b;">GHS${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; text-align: left; font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #475569;">Tax (0%)</td>
              <td style="padding: 8px 0; text-align: right; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #1e293b;">GHS0.00</td>
            </tr>
            <tr>
              <td colspan="2" style="border-bottom: 1px solid #e2e8f0;"></td>
            </tr>
            <tr>
              <td style="padding: 16px 0 0 0; text-align: left; font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: bold; color: #059669; letter-spacing: 1px;">GRAND TOTAL</td>
              <td style="padding: 16px 0 0 0; text-align: right; font-family: Helvetica, Arial, sans-serif; font-size: 18px; font-weight: bold; color: #1e293b;">GHS${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <p style="text-align: center; margin: 0 0 32px;">
      <a href="${trackUrl}/track/${orderId}" style="display: inline-block; padding: 14px 36px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-family: Helvetica, Arial, sans-serif; font-size: 14px;">Track Your Order</a>
    </p>

    <!-- Footer -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #f1f5f9; padding-top: 24px; text-align: center;">
      <tr>
        <td style="font-family: Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; color: #94a3b8; letter-spacing: 1px; margin-bottom: 12px;">THANK YOU FOR YOUR BUSINESS!</td>
      </tr>
      <tr>
        <td style="font-family: Helvetica, Arial, sans-serif; font-size: 10px; color: #64748b; line-height: 1.5; padding: 12px 0;">
          This document is a computer-generated invoice and requires no signature. Subject to our standard Terms & Conditions of Sale. Returns and exchanges are governed by our return policy available at ${COMPANY_CONTACTS.WEBSITE_DISPLAY}/terms.
        </td>
      </tr>
      <tr>
        <td style="font-family: Helvetica, Arial, sans-serif; font-size: 11px; font-weight: bold; color: #64748b; padding-bottom: 8px;">
          SHERO TECHNOLOGIES | ${COMPANY_CONTACTS.HQ_LOCATION}
        </td>
      </tr>
      <tr>
        <td style="font-family: Helvetica, Arial, sans-serif; font-size: 11px;">
          <a href="mailto:${COMPANY_EMAILS.SUPPORT}" style="color: #059669; text-decoration: underline;">${COMPANY_EMAILS.SUPPORT}</a>
          &nbsp;|&nbsp;
          <a href="https://wa.me/${COMPANY_CONTACTS.PHONE_DISPLAY.replace(/[^0-9]/g, '')}" style="color: #059669; text-decoration: underline;">WhatsApp: ${COMPANY_CONTACTS.PHONE_DISPLAY}</a>
        </td>
      </tr>
    </table>
  `;
  const htmlContent = wrapEmailHtml(bodyHtml, {
    preheader: "Thank you for your order! Here's your receipt.",
  });

  let attachments;
  try {
    const pdfBuffer = await generateInvoicePdf(
      orderId,
      shippingInfo,
      items,
      total,
      paymentMethod || "cash_on_delivery",
    );
    attachments = [
      { filename: `${readableOrderId}.pdf`.slice(1), content: pdfBuffer },
    ];
  } catch (e) {
    console.error("Failed to generate PDF invoice:", e);
  }

  await sendEmail(
    shippingInfo.email,
    `Order Confirmation: ${readableOrderId}`,
    htmlContent,
    { attachments },
  );

  // Admin alert
  const adminEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL || COMPANY_EMAILS.HELLO;
  await sendEmail(
    adminEmail,
    `🚨 NEW ORDER: ${readableOrderId}`,
    wrapEmailHtml(`
      <h2 style="color: #059669; margin: 0 0 16px;">🚨 New Order Received!</h2>
      <p><strong>Customer:</strong> ${shippingInfo.firstName} ${shippingInfo.lastName}</p>
      <p><strong>Phone:</strong> ${shippingInfo.phone}</p>
      <p><strong>Total:</strong> GHS${total.toFixed(2)}</p>
      <p style="text-align: center; margin-top: 20px;">
        <a href="${baseUrl}/admin/orders/${orderId}" style="display: inline-block; padding: 10px 28px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">View in Admin Panel</a>
      </p>
    `),
  );

  // -------------------------------------------------------------------------
  // WhatsApp Notifications (Meta Business Cloud API)
  // -------------------------------------------------------------------------

  // 1. Alert Admin
  const adminWhatsapp =
    process.env.ADMIN_WHATSAPP_NUMBER || COMPANY_CONTACTS.WHATSAPP;
  const adminAlertText =
    `🚨 *NEW ORDER RECEIVED!*\n\n` +
    `📦 *Order ID:* ${readableOrderId}\n` +
    `👤 *Customer:* ${shippingInfo.firstName} ${shippingInfo.lastName}\n` +
    `💰 *Total:* GHS ${total.toFixed(2)}\n` +
    `📞 *Phone:* ${shippingInfo.phone}\n` +
    `📍 *Region:* ${shippingInfo.region} - ${shippingInfo.city}\n\n` +
    `🔗 _View in Admin:_ ${baseUrl}/admin/orders/${orderId}`;

  sendWhatsAppNotification(adminWhatsapp, adminAlertText).catch((err) =>
    console.error("Admin WhatsApp notification failed:", err),
  );

  // 2. Alert Customer
  const customerPhone = formatToInternationalPhone(shippingInfo.phone);
  if (customerPhone) {
    const customerMsg =
      `Hi ${shippingInfo.firstName},\n\n` +
      `Thank you for shopping at *SHERO TECHNOLOGIES*!\n\n` +
      `We have successfully received your order *${readableOrderId}*.\n\n` +
      `💰 *Total:* GHS ${total.toFixed(2)}\n` +
      `📍 *Delivery Details:* ${shippingInfo.address}, ${shippingInfo.city}\n\n` +
      `🔗 *Live Track:* ${trackUrl}/track/${orderId}\n\n` +
      `If you need immediate support, reply directly to this chat. Thank you for choosing SHERO!`;

    sendWhatsAppMessageDirect(
      customerPhone,
      customerMsg,
      "order_confirmation",
      "en",
      [shippingInfo.firstName, readableOrderId, total.toFixed(2)]
    ).then((res) => {
      if (res.success && res.messageId) {
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "system";
        storeOutgoingMessage(
          res.messageId,
          null,
          customerPhone,
          phoneNumberId,
          customerMsg,
          { template: "order_confirmation", orderId }
        ).catch(e => console.error("Failed to store WhatsApp order confirmation", e));
      } else if (!res.success) {
         console.error("WhatsApp template delivery failed:", res.error);
      }
    }).catch((err) =>
      console.error("Customer WhatsApp notification failed:", err),
    );
  }
}
