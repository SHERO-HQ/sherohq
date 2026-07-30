import PDFDocument from "pdfkit";
import { OrderItem, ShippingInfo } from "./notifications";
import { toReadableOrderId } from "@/utils/orderId";

export const generateInvoicePdf = async (
  orderId: string,
  shippingInfo: ShippingInfo,
  items: OrderItem[],
  total: number,
  paymentMethod: string,
  orderDate: Date = new Date(),
  paymentStatus: "CONFIRMED" | "FAILED" | "PENDING" = "CONFIRMED"
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const readableId = toReadableOrderId(orderId);

      // --- Header ---
      doc.fillColor("#059669").fontSize(22).font("Helvetica-Bold").text("SHERO TECHNOLOGIES", { align: "center" });
      doc.moveDown(0.2);
      
      const headerTitle = paymentStatus === "FAILED" ? "ORDER RECEIPT - PAYMENT FAILED" : "OFFICIAL ORDER RECEIPT & INVOICE";
      doc.fillColor("#0f172a").fontSize(13).font("Helvetica").text(headerTitle, { align: "center" });
      doc.moveDown(1.5);

      // --- Status Badge ---
      const badgeY = doc.y;
      if (paymentStatus === "FAILED") {
        doc.fillColor("#dc2626").fontSize(11).font("Helvetica-Bold").text("STATUS: PAYMENT FAILED", 50, badgeY);
      } else {
        doc.fillColor("#059669").fontSize(11).font("Helvetica-Bold").text("STATUS: PAYMENT CONFIRMED / PAID", 50, badgeY);
      }
      doc.moveDown(1);

      // --- Meta Info & Billing ---
      const startY = doc.y;

      // Left Column: Bill To
      doc.fillColor("#64748b").fontSize(9).font("Helvetica-Bold").text("CUSTOMER DETAILS", 50, startY);
      doc.fillColor("#0f172a").fontSize(10).font("Helvetica-Bold").text(`${shippingInfo.firstName} ${shippingInfo.lastName}`, 50, startY + 14);
      doc.font("Helvetica").fontSize(9).text(shippingInfo.address || "N/A", 50, startY + 28);
      doc.text(`${shippingInfo.city || "N/A"}, ${shippingInfo.region || "N/A"}`, 50, startY + 40);
      if (shippingInfo.phone) doc.text(`Phone: ${shippingInfo.phone}`, 50, startY + 52);
      if (shippingInfo.email) doc.text(`Email: ${shippingInfo.email}`, 50, startY + 64);

      // Right Column: Order Meta
      doc.fillColor("#64748b").fontSize(9).font("Helvetica-Bold").text("ORDER DETAILS", 350, startY);
      doc.fillColor("#0f172a").fontSize(9).font("Helvetica-Bold").text("Order Reference:", 350, startY + 14);
      doc.font("Helvetica").text(readableId, 450, startY + 14);

      doc.font("Helvetica-Bold").text("Order Date:", 350, startY + 28);
      doc.font("Helvetica").text(orderDate.toLocaleDateString("en-GH", { year: "numeric", month: "short", day: "numeric" }), 450, startY + 28);

      doc.font("Helvetica-Bold").text("Payment Method:", 350, startY + 40);
      doc.font("Helvetica").text((paymentMethod || "N/A").replace(/_/g, " ").toUpperCase(), 450, startY + 40);

      doc.moveDown(5);

      // --- Items Table ---
      const tableTop = doc.y;
      doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(9);
      
      // Table Headers
      doc.text("Item Description", 50, tableTop);
      doc.text("Qty", 340, tableTop, { align: "center", width: 40 });
      doc.text("Unit Price", 390, tableTop, { align: "right", width: 70 });
      doc.text("Total", 470, tableTop, { align: "right", width: 80 });

      // Header underline
      doc.moveTo(50, tableTop + 14).lineTo(550, tableTop + 14).strokeColor("#cbd5e1").stroke();
      
      let y = tableTop + 22;
      doc.font("Helvetica").fontSize(9).fillColor("#334155");

      items.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        
        doc.text(item.name, 50, y, { width: 280 });
        doc.text(item.quantity.toString(), 340, y, { align: "center", width: 40 });
        doc.text(`GHS ${item.price.toFixed(2)}`, 390, y, { align: "right", width: 70 });
        doc.text(`GHS ${itemTotal.toFixed(2)}`, 470, y, { align: "right", width: 80 });
        
        y = Math.max(doc.y + 8, y + 18);
      });

      // Bottom line of table
      doc.moveTo(50, y).lineTo(550, y).strokeColor("#e2e8f0").stroke();
      y += 12;

      // --- Totals ---
      doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(11);
      doc.text("Grand Total:", 350, y, { align: "right", width: 110 });
      doc.text(`GHS ${total.toFixed(2)}`, 470, y, { align: "right", width: 80 });

      // --- Footer ---
      doc.moveDown(5);
      doc.font("Helvetica-Oblique").fontSize(9).fillColor("#64748b");
      doc.text("Thank you for choosing SHERO TECHNOLOGIES!", { align: "center" });
      doc.text("For questions regarding this receipt, please contact support@sherohq.com or WhatsApp +233 54 871 1582", { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
