import { COMPANY_CONTACTS } from "@/constants/contacts";
import { COMPANY_EMAILS } from "@/constants/emails";
import { sendEmail, wrapEmailHtml } from "../core/email";
import { sendWhatsAppNotification, formatToInternationalPhone } from "../core/whatsapp";
import { generateInvoicePdf } from "../../pdfInvoice";
import { toReadableOrderId } from "@/utils/orderId";
import { OrderItem, ShippingInfo } from "../types";

export const ordersNotifications = {
  async sendOrderConfirmation(
    orderId: string,
    shippingInfo: ShippingInfo,
    items: OrderItem[],
    total: number,
    paymentMethod?: string,
  ) {
    const readableOrderId = toReadableOrderId(orderId);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
    const trackUrl = baseUrl.includes("shop.") ? baseUrl.replace("shop.", "") : baseUrl;

    // Derive subtotal and shipping from items vs. the stored total
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const shipping = Math.max(0, Math.round((total - subtotal) * 100) / 100);
    const isFreeShipping = shipping === 0;

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
          ? `<img src="${imgUrl}" alt="${item.name}" width="40" height="40" style="border-radius: 4px; object-fit: cover; margin-right: 12px; border: 1px solid #e2e8f0; vertical-align: middle;" />`
          : "";

        return `
          <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">
              <table style="border: 0; padding: 0; margin: 0; border-collapse: collapse;">
                <tr>
                  <td style="padding: 0;">${imgHtml}</td>
                  <td style="padding: 0; vertical-align: middle;">
                    <strong style="display: block; margin-bottom: 4px; font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: bold;">${item.name}</strong>
                    ${item.sku ? `<span style="font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #94a3b8;">SKU: ${item.sku}</span>` : ""}
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9; text-align: center; color: #475569; font-family: Helvetica, Arial, sans-serif; font-size: 12px;">
              ${item.quantity}
            </td>
            <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9; text-align: right; color: #475569; font-family: 'Courier New', Courier, monospace; font-size: 12px;">
              GHC${item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </td>
            <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9; text-align: right; color: #1e293b; font-family: Helvetica, Arial, sans-serif; font-weight: bold; font-size: 12px;">
              GHC${(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </td>
          </tr>`;
      })
      .join("");

    const orderDate = new Date().toLocaleString("en-GH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const statusText = paymentMethod === "cash_on_delivery" ? "PAYMENT PENDING" : (paymentMethod === "store_pickup" ? "PAYMENT PENDING" : "PAID");
    const statusBg = paymentMethod === "cash_on_delivery" || paymentMethod === "store_pickup" ? "#fffbeb" : "#ecfdf5";
    const statusColor = paymentMethod === "cash_on_delivery" || paymentMethod === "store_pickup" ? "#b45309" : "#047857";

    const bodyHtml = `
      <!-- Header Area -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
        <tr>
          <td valign="top" style="width: 50%;">
            <img src="${baseUrl}/assets/logo/shero.png" alt="SHERO" width="40" style="margin-bottom: 12px; display: block;" />
            <div style="font-family: Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; color: #1e293b; margin-bottom: 4px;">SHERO TECHNOLOGIES</div>
            <div style="font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #64748b; line-height: 1.6;">
              ${COMPANY_CONTACTS.HQ_LOCATION}<br />
              ${COMPANY_CONTACTS.PHONE_DISPLAY}<br />
              <span style="color: #059669;">${COMPANY_CONTACTS.WEBSITE_DISPLAY}</span>
            </div>
          </td>
          <td valign="top" style="width: 50%; text-align: right;">
            <div style="font-family: Helvetica, Arial, sans-serif; font-size: 28px; font-weight: bold; color: #e2e8f0; margin-bottom: 16px; letter-spacing: 1px;">RECEIPT</div>
            <div style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: bold; color: #334155; margin-bottom: 2px;">Ref: ${readableOrderId}</div>
            <div style="font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #64748b; margin-bottom: 8px;">Date: ${orderDate}</div>
            <div style="display: inline-block; background-color: ${statusBg}; color: ${statusColor}; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 4px;">${statusText}</div>
          </td>
        </tr>
      </table>

      <!-- Billed To & Shipping Side-by-Side -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 32px;">
        <tr>
          <td valign="top" style="width: 50%; padding: 20px;">
            <div style="font-family: Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; color: #94a3b8; letter-spacing: 1px; margin-bottom: 12px;">BILLED TO</div>
            <div style="font-family: Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; color: #1e293b; margin-bottom: 4px;">${shippingInfo.firstName} ${shippingInfo.lastName}</div>
            <div style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #475569; margin-bottom: 2px;">${shippingInfo.email || "N/A"}</div>
            <div style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #475569;">${shippingInfo.phone || "N/A"}</div>
          </td>
          <td valign="top" style="width: 50%; padding: 20px;">
            <div style="font-family: Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; color: #94a3b8; letter-spacing: 1px; margin-bottom: 12px;">SHIPPING ADDRESS</div>
            <div style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #475569; margin-bottom: 2px;">${shippingInfo.address || "N/A"}</div>
            <div style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #475569; margin-bottom: 8px;">${shippingInfo.city || ""}, ${shippingInfo.region || ""}</div>
            <div style="font-family: Helvetica, Arial, sans-serif; font-size: 11px; font-weight: bold; color: #059669;">Est. Delivery: ${deliveryRange}</div>
          </td>
        </tr>
      </table>

      <!-- Items Table -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
        <thead>
          <tr>
            <th style="padding: 0 0 12px 0; text-align: left; font-family: Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; color: #94a3b8; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0;">DESCRIPTION</th>
            <th style="padding: 0 0 12px 0; text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; color: #94a3b8; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; width: 60px;">QTY</th>
            <th style="padding: 0 0 12px 0; text-align: right; font-family: Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; color: #94a3b8; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; width: 100px;">UNIT PRICE</th>
            <th style="padding: 0 0 12px 0; text-align: right; font-family: Helvetica, Arial, sans-serif; font-size: 10px; font-weight: bold; color: #94a3b8; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; width: 100px;">AMOUNT</th>
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
                <td style="padding: 8px 0; text-align: right; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #1e293b;">GHC${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; text-align: left; font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #475569;">Shipping</td>
                <td style="padding: 8px 0; text-align: right; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #1e293b;">
                  ${isFreeShipping ? '<span style="color: #059669; font-family: Helvetica, Arial, sans-serif; font-weight: bold;">FREE</span>' : `GHC${shipping.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                </td>
              </tr>
              <tr>
                <td colspan="2" style="border-bottom: 1px solid #e2e8f0;"></td>
              </tr>
              <tr>
                <td style="padding: 16px 0 0 0; text-align: left; font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: bold; color: #059669; letter-spacing: 1px;">GRAND TOTAL</td>
                <td style="padding: 16px 0 0 0; text-align: right; font-family: Helvetica, Arial, sans-serif; font-size: 18px; font-weight: bold; color: #1e293b;">GHC${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
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
      `Order Confirmation - ${readableOrderId}`,
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
        <p><strong>Total:</strong> GH₵${total.toFixed(2)}</p>
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

      sendWhatsAppNotification(customerPhone, customerMsg).catch((err) =>
        console.error("Customer WhatsApp notification failed:", err),
      );
    }
  },

  async sendOrderStatusUpdateNotification(
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
      if (newStatus === "intransit")
        waMessage = `Hi ${shippingInfo.firstName} 🚚\n\nYour order *${readableOrderId}* from *SHERO TECHNOLOGIES* has been dispatched and is in transit to you!\n\n`;
      if (newStatus === "delivered")
        waMessage = `Hi ${shippingInfo.firstName} 🎉\n\nYour order *${readableOrderId}* from *SHERO TECHNOLOGIES* has been delivered!\n\nWe hope you love it.\n\n`;

      waMessage += `🔗 *Track your order:* ${trackUrl}/track/${orderId}`;

      sendWhatsAppNotification(customerPhone, waMessage).catch((err) =>
        console.error(
          "Customer WhatsApp status update notification failed:",
          err,
        ),
      );
    }
  },

  async sendPaymentFailureNotification(
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

      sendWhatsAppNotification(customerPhone, customerMsg).catch((err) =>
        console.error("Customer WhatsApp failure notification failed:", err),
      );
    }
  },

  async sendReviewRequestNotification(
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
};
