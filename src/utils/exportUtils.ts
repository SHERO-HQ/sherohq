import Papa from "papaparse";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Utility to trigger a file download in the browser
 */
const downloadFile = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportToCSV = (
  data: Record<string, unknown>[],
  fileName: string,
) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadFile(blob, `${fileName}.csv`);
};

export const exportToExcel = (
  data: Record<string, unknown>[],
  fileName: string,
) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });
  downloadFile(blob, `${fileName}.xlsx`);
};

export const exportToPDF = (
  data: Record<string, unknown>[],
  columns: string[],
  fileName: string,
  title: string,
) => {
  const doc = new jsPDF();

  // Add Title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);

  // Add timestamp
  const dateStr = new Date().toLocaleString();
  doc.text(`Generated on: ${dateStr}`, 14, 30);

  // Add Table
  const body = data.map((row) => columns.map((col) => String(row[col] ?? "")));

  autoTable(doc, {
    startY: 40,
    head: [
      columns.map(
        (col) =>
          col.charAt(0).toUpperCase() +
          col.slice(1).replaceAll(/([A-Z])/g, " $1"),
      ),
    ],
    body: body,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [16, 185, 129] }, // Emerald-500
    alternateRowStyles: { fillColor: [248, 250, 252] }, // Slate-50
  });

  doc.save(`${fileName}.pdf`);
};
