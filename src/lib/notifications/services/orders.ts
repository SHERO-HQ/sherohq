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
            <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #334155;">
              <table style="border: 0; padding: 0; margin: 0; border-collapse: collapse;">
                <tr>
                  <td style="padding: 0;">${imgHtml}</td>
                  <td style="padding: 0; vertical-align: middle;">
                    <strong style="display: block; margin-bottom: 2px;">${item.name}</strong>
                    <span style="font-size: 12px; color: #94a3b8;">Qty: ${item.quantity} × GH₵${item.price.toFixed(2)}</span>
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-weight: 600; white-space: nowrap; vertical-align: top;">
              GH₵${(item.price * item.quantity).toFixed(2)}
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

    const bodyHtml = `
      <h1 style="color: #059669; text-align: center; margin: 0 0 8px; font-size: 18px;">Order Confirmed!</h1>
      <p style="text-align: center; color: #64748b; font-size: 12px; margin: 0 0 24px;">Order <strong style="color: #0f172a;">${readableOrderId}</strong> &middot; ${orderDate}</p>

      <p style="margin: 0 0 20px;">Hi ${shippingInfo.firstName},</p>
      <p style="margin: 0 0 24px;">Thank you for your order at <strong>SHERO TECHNOLOGIES</strong>. Here's your receipt:</p>

      <!-- Items Table -->
      <div style="background: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Item</th>
              <th style="padding: 10px 8px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Summary Rows -->
        <div style="padding: 12px 8px 4px; border-top: 2px solid #e2e8f0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 12px;">Subtotal</td>
              <td style="padding: 6px 0; text-align: right; color: #334155; font-size: 12px;">GH₵${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 12px;">Shipping</td>
              <td style="padding: 6px 0; text-align: right; font-size: 12px;">
                ${
                  isFreeShipping
                    ? '<span style="color: #059669; font-weight: 600;">FREE</span>'
                    : `<span style="color: #334155;">GH₵${shipping.toFixed(2)}</span>`
                }
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 8px 0 0;"><div style="border-top: 1px solid #e2e8f0;"></div></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: 700; font-size: 13px; color: #0f172a;">Total</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 700; font-size: 13px; color: #059669;">GH₵${total.toFixed(2)}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Delivery Info -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; width: 50%; padding: 4px 8px 4px 0;">
              <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #16a34a; font-weight: 600;">Estimated Delivery</p>
              <p style="margin: 0; font-size: 12px; color: #0f172a; font-weight: 600;">${deliveryRange}</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">24hrs to 5 days</p>

              ${
                paymentMethod
                  ? `
                <p style="margin: 16px 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #16a34a; font-weight: 600;">Payment Method</p>
                <p style="margin: 0; font-size: 12px; color: #0f172a; font-weight: 600;">${
                  paymentMethod === "cash_on_delivery"
                    ? "Cash on Delivery"
                    : paymentMethod === "store_pickup"
                      ? "Store Pickup"
                      : paymentMethod === "card"
                        ? "Card Payment"
                        : paymentMethod === "momo"
                          ? "Mobile Money"
                          : "Paid"
                }</p>
              `
                  : ""
              }
            </td>
            <td style="vertical-align: top; width: 50%; padding: 4px 0 4px 8px; border-left: 1px solid #bbf7d0;">
              <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #16a34a; font-weight: 600;">Delivery Address</p>
              <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1;">${shippingInfo.address}<br />${shippingInfo.city}, ${shippingInfo.region}</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <p style="text-align: center; margin: 0 0 24px;">
        <a href="${baseUrl}/track/${orderId}" style="display: inline-block; padding: 12px 32px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">Track Your Order</a>
      </p>

      <!-- Referral Nudge -->
      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 12px; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 8px; font-size: 10px; font-weight: 600; color: #0f172a;">Love SHERO?</p>
        <p style="margin: 0 0 16px; font-size: 11px; color: #64748b;">Share the experience with a friend and they'll thank you later.</p>
        <a href="${baseUrl}" style="color: #059669; font-weight: 600; text-decoration: none;">Share with friend</a>
      </div>
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
        `🔗 *Live Track:* ${baseUrl}/track/${orderId}\n\n` +
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
        <a href="${baseUrl}/track/${orderId}" style="display: inline-block; padding: 12px 32px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Your Order</a>
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

      waMessage += `🔗 *Track your order:* ${baseUrl}/track/${orderId}`;

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

    const bodyHtml = `
      <h1 style="color: #dc2626; text-align: center; margin: 0 0 20px; font-size: 18px;">Payment Was Not Completed</h1>
      <p>Hi ${shippingInfo.firstName},</p>
      <p>Unfortunately, your payment for order <strong>${readableOrderId}</strong> could not be processed successfully.</p>
      <p>Don't worry, no money was deducted from your account. You can try again or contact our support team for assistance.</p>
      <p style="text-align: center; margin-top: 20px;">
        <a href="${baseUrl}/shop/checkout?retry=${orderId}" style="display: inline-block; padding: 10px 28px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Try Again</a>
      </p>
      <p style="text-align: center; margin-top: 8px;">
        <a href="${baseUrl}/track/${orderId}" style="color: #059669; text-decoration: none;">View your order details →</a>
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
        `🔗 *View Order:* ${baseUrl}/track/${orderId}`;

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

    const bodyHtml = `
      <h1 style="color: #059669; text-align: center; margin: 0 0 20px; font-size: 18px;">How did we do?</h1>
      <p style="margin: 0 0 16px;">Hi ${shippingInfo.firstName},</p>
      <p style="margin: 0 0 16px;">Your order <strong>${readableOrderId}</strong> was recently delivered. We'd love to hear about your experience!</p>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${baseUrl}/feedback?order=${orderId}" style="display: inline-block; padding: 12px 32px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Leave a Review</a>
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
