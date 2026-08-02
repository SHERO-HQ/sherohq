import PDFDocument from "pdfkit";
import { OrderItem, ShippingInfo } from "./notifications";
import { toReadableOrderId } from "@/utils/orderId";
import fs from "fs";
import path from "path";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { COMPANY_EMAILS } from "@/constants/emails";

export const generateInvoicePdf = async (
  orderId: string,
  shippingInfo: ShippingInfo,
  items: OrderItem[],
  total: number,
  paymentMethod: string,
  orderDate: Date = new Date(),
  paymentStatus: "CONFIRMED" | "FAILED" | "PENDING" = "CONFIRMED"
): Promise<Buffer> => {
  let qrBuffer: Buffer | null = null;
  try {
    const QRCode = (await import("qrcode")).default;
    const qrUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com"}/track/${orderId}`;
    const dataUrl = await QRCode.toDataURL(qrUrl, { margin: 0, width: 80, color: { dark: '#1e293b', light: '#ffffff' } });
    qrBuffer = Buffer.from(dataUrl.split(',')[1], 'base64');
  } catch (err) {
    console.error("Failed to generate QR for PDF:", err);
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const readableId = toReadableOrderId(orderId);

      // --- Watermark ---
      const logoPath = path.join(process.cwd(), "public", "assets", "logo", "shero.png");
      if (fs.existsSync(logoPath)) {
        doc.save();
        doc.opacity(0.05);
        doc.image(logoPath, 150, 300, { width: 300 });
        doc.restore();
      }

      // --- Header ---
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 50, { width: 40 });
      }

      // Left Side Header Text
      let currentY = 100;
      doc.fillColor("#1e293b").fontSize(10).font("Helvetica-Bold").text("SHERO TECHNOLOGIES", 50, currentY);
      doc.fillColor("#64748b").fontSize(8).font("Helvetica");
      currentY += 14;
      doc.text(COMPANY_CONTACTS.HQ_LOCATION, 50, currentY);
      currentY += 12;
      doc.text(COMPANY_CONTACTS.PHONE_DISPLAY, 50, currentY);
      currentY += 12;
      doc.fillColor("#059669").text(COMPANY_CONTACTS.WEBSITE_DISPLAY, 50, currentY);

      // Right Side Header Text
      doc.fillColor("#e2e8f0").fontSize(24).font("Helvetica-Bold").text("RECEIPT", 350, 50, { align: "right" });
      
      doc.fillColor("#334155").fontSize(10).font("Helvetica-Bold").text(`Ref: ${readableId}`, 350, 85, { align: "right" });
      doc.fillColor("#64748b").fontSize(8).font("Helvetica").text(`Date: ${orderDate.toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}`, 350, 100, { align: "right" });

      const statusColors = {
        FAILED: { bg: "#fef2f2", text: "#b91c1c" },
        PENDING: { bg: "#fffbeb", text: "#b45309" },
        CONFIRMED: { bg: "#ecfdf5", text: "#047857" }
      };
      
      const statusText = paymentStatus === "FAILED" ? "PAYMENT FAILED" : (paymentStatus === "PENDING" ? "PAYMENT PENDING" : "PAID");
      const statusColor = statusColors[paymentStatus] || statusColors.CONFIRMED;

      doc.fillColor(statusColor.text).fontSize(8).font("Helvetica-Bold").text(statusText, 350, 115, { align: "right" });

      currentY = 160;

      // --- Billed To & Shipping Side-by-Side ---
      doc.roundedRect(50, currentY, 495, 100, 5).fillAndStroke("#f8fafc", "#e2e8f0");

      // Billed To Column (X: 70)
      doc.fillColor("#94a3b8").fontSize(7).font("Helvetica-Bold").text("BILLED TO", 70, currentY + 15, { characterSpacing: 1 });
      doc.fillColor("#1e293b").fontSize(10).font("Helvetica-Bold").text(`${shippingInfo.firstName} ${shippingInfo.lastName}`, 70, currentY + 30);
      doc.fillColor("#475569").fontSize(8).font("Helvetica").text(shippingInfo.email || "", 70, currentY + 45);
      doc.text(shippingInfo.phone || "", 70, currentY + 57);

      // Shipping Column (X: 300)
      doc.fillColor("#94a3b8").fontSize(7).font("Helvetica-Bold").text("SHIPPING ADDRESS", 300, currentY + 15, { characterSpacing: 1 });
      doc.fillColor("#475569").fontSize(8).font("Helvetica").text(shippingInfo.address || "N/A", 300, currentY + 30);
      doc.text(`${shippingInfo.city || ""}, ${shippingInfo.region || ""}`, 300, currentY + 42);

      currentY += 130;

      // --- Items Table ---
      doc.fillColor("#94a3b8").fontSize(7).font("Helvetica-Bold");
      
      doc.text("DESCRIPTION", 50, currentY, { characterSpacing: 1 });
      doc.text("QTY", 300, currentY, { align: "center", width: 40, characterSpacing: 1 });
      doc.text("UNIT PRICE", 350, currentY, { align: "right", width: 80, characterSpacing: 1 });
      doc.text("AMOUNT", 450, currentY, { align: "right", width: 95, characterSpacing: 1 });

      currentY += 12;
      doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor("#e2e8f0").lineWidth(1).stroke();
      currentY += 15;

      items.forEach((item) => {
        // Automatically add page if we are near the bottom
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }

        const itemTotal = item.price * item.quantity;
        
        doc.fillColor("#1e293b").font("Helvetica-Bold").fontSize(9);
        doc.text(item.name, 50, currentY, { width: 240 });
        
        if (item.sku) {
          doc.fillColor("#94a3b8").font("Courier").fontSize(7);
          doc.text(`SKU: ${item.sku}`, 50, currentY + 12);
        }

        doc.fillColor("#475569").font("Helvetica").fontSize(9);
        doc.text(item.quantity.toString(), 300, currentY, { align: "center", width: 40 });
        doc.font("Courier").text(`GH₵${item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 350, currentY, { align: "right", width: 80 });
        doc.fillColor("#1e293b").font("Helvetica-Bold").text(`GH₵${itemTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 450, currentY, { align: "right", width: 95 }); 
        
        currentY += 30; // Row height

        // Draw soft divider
        doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor("#f1f5f9").lineWidth(1).stroke();
        currentY += 15;
      });

      // --- Totals ---
      if (currentY > 650) {
        doc.addPage();
        currentY = 50;
      }

      currentY += 10;
      doc.moveTo(350, currentY).lineTo(545, currentY).strokeColor("#e2e8f0").lineWidth(1).stroke();
      currentY += 15;

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = total - subtotal;

      // QR Code
      if (qrBuffer) {
        doc.image(qrBuffer, 50, currentY - 10, { width: 60 });
        doc.fillColor("#94a3b8").fontSize(7).font("Helvetica-Bold").text("SCAN TO VERIFY", 50, currentY + 55, { characterSpacing: 1 });
      }

      doc.fillColor("#475569").font("Helvetica").fontSize(9);
      doc.text("Subtotal", 350, currentY);
      doc.font("Courier").text(`GH₵${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 450, currentY, { align: "right", width: 95 });

      currentY += 15;
      doc.font("Helvetica").text("Shipping", 350, currentY);
      doc.font("Courier").text(shipping <= 0 ? "FREE" : `GH₵${shipping.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 450, currentY, { align: "right", width: 95 });

      currentY += 20;
      doc.moveTo(350, currentY).lineTo(545, currentY).strokeColor("#e2e8f0").lineWidth(1).stroke();
      currentY += 12;

      doc.fillColor("#059669").font("Helvetica-Bold").fontSize(10);
      doc.text("GRAND TOTAL", 350, currentY, { characterSpacing: 1 });
      doc.fillColor("#1e293b").font("Helvetica-Bold").fontSize(14).text(`GH₵${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 400, currentY - 2, { align: "right", width: 145 });

      // --- Footer ---
      let footerY = 740;
      if (currentY > 700) {
        doc.addPage();
      }
      
      doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor("#f1f5f9").lineWidth(1).stroke();
      
      doc.fillColor("#94a3b8").font("Helvetica-Bold").fontSize(7);
      doc.text("THANK YOU FOR YOUR BUSINESS!", 50, footerY + 15, { align: "center", characterSpacing: 1 });
      
      doc.font("Helvetica").fontSize(6);
      doc.text("This document is a computer-generated invoice and requires no signature. Subject to our standard Terms & Conditions of Sale. Returns and exchanges are governed by our return policy available at " + COMPANY_CONTACTS.WEBSITE_DISPLAY + "/terms.", 50, footerY + 28, { align: "center", width: 495 });
      
      doc.fillColor("#64748b").font("Helvetica-Bold").text(`SHERO TECHNOLOGIES | ${COMPANY_CONTACTS.HQ_LOCATION}`, 50, footerY + 42, { align: "center", width: 495 });
      
      const cleanPhone = COMPANY_CONTACTS.PHONE_DISPLAY.replace(/[^0-9]/g, '');
      doc.fillColor("#059669").font("Helvetica").fontSize(7);
      doc.text(COMPANY_EMAILS.SUPPORT, 50, footerY + 52, { align: "center", width: 495, link: `mailto:${COMPANY_EMAILS.SUPPORT}`, underline: true });
      doc.text(`WhatsApp: ${COMPANY_CONTACTS.PHONE_DISPLAY}`, 50, footerY + 62, { align: "center", width: 495, link: `https://wa.me/${cleanPhone}`, underline: true });
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
