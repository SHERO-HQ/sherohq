import PDFDocument from "pdfkit";
import { OrderItem, ShippingInfo } from "./notifications";

export const generateInvoicePdf = async (
  orderId: string,
  shippingInfo: ShippingInfo,
  items: OrderItem[],
  total: number,
  paymentMethod: string,
  orderDate: Date = new Date()
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // --- Header ---
      doc.fontSize(24).font("Helvetica-Bold").text("SHERO TECHNOLOGIES", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(16).font("Helvetica").text("ORDER INVOICE", { align: "center" });
      doc.moveDown(2);

      // --- Meta Info & Billing ---
      const startY = doc.y;

      // Left Column: Bill To
      doc.fontSize(10).font("Helvetica-Bold").text("Bill To:", 50, startY);
      doc.font("Helvetica").text(`${shippingInfo.firstName} ${shippingInfo.lastName}`, 50, startY + 15);
      doc.text(shippingInfo.address || "N/A", 50, startY + 30);
      doc.text(`${shippingInfo.city || "N/A"}, ${shippingInfo.region || "N/A"}`, 50, startY + 45);
      if (shippingInfo.phone) doc.text(`Phone: ${shippingInfo.phone}`, 50, startY + 60);

      // Right Column: Order Meta
      doc.font("Helvetica-Bold").text("Order ID:", 350, startY);
      doc.font("Helvetica").text(orderId, 450, startY);

      doc.font("Helvetica-Bold").text("Order Date:", 350, startY + 15);
      doc.font("Helvetica").text(orderDate.toLocaleDateString(), 450, startY + 15);

      doc.font("Helvetica-Bold").text("Payment Method:", 350, startY + 30);
      doc.font("Helvetica").text((paymentMethod || "N/A").replace(/_/g, " ").toUpperCase(), 450, startY + 30);

      doc.moveDown(4);

      // --- Items Table ---
      const tableTop = doc.y;
      doc.font("Helvetica-Bold").fontSize(10);
      
      // Table Headers
      doc.text("Item Description", 50, tableTop);
      doc.text("Qty", 350, tableTop, { align: "center", width: 50 });
      doc.text("Unit Price", 400, tableTop, { align: "right", width: 70 });
      doc.text("Total", 470, tableTop, { align: "right", width: 80 });

      // Header underline
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      
      let y = tableTop + 25;
      doc.font("Helvetica").fontSize(10);

      items.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        
        // Handle long names by wrapping
        doc.text(item.name, 50, y, { width: 280 });
        doc.text(item.quantity.toString(), 350, y, { align: "center", width: 50 });
        doc.text(`$${item.price.toFixed(2)}`, 400, y, { align: "right", width: 70 });
        doc.text(`$${itemTotal.toFixed(2)}`, 470, y, { align: "right", width: 80 });
        
        y = doc.y + 15;
      });

      // Bottom line of table
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 15;

      // --- Totals ---
      doc.font("Helvetica-Bold").fontSize(12);
      doc.text("Grand Total:", 350, y, { align: "right", width: 120 });
      doc.text(`$${total.toFixed(2)}`, 470, y, { align: "right", width: 80 });

      // --- Footer ---
      doc.moveDown(6);
      doc.font("Helvetica-Oblique").fontSize(10).fillColor("gray");
      doc.text("Thank you for choosing SHERO TECHNOLOGIES!", { align: "center" });
      doc.text("If you have any questions about this invoice, please contact support@sherohq.com", { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
