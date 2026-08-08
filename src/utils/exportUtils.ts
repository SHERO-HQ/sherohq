/**
 * Utility to trigger a file download in the browser
 */
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

const DEFAULT_EXPORT_NAME = "export";

const normalizeDownloadFileName = (
  fileName: string | undefined,
  extension: string,
) => {
  const trimmedName = typeof fileName === "string" ? fileName.trim() : "";
  const safeBaseName = trimmedName || DEFAULT_EXPORT_NAME;
  const normalizedExtension = extension.startsWith(".")
    ? extension
    : `.${extension}`;

  if (safeBaseName.toLowerCase().endsWith(normalizedExtension.toLowerCase())) {
    return safeBaseName;
  }

  return `${safeBaseName}${normalizedExtension}`;
};

const getFileHandle = async (fileName: string) => {
  if (
    typeof window !== "undefined" &&
    "showSaveFilePicker" in window &&
    typeof window.showSaveFilePicker === "function"
  ) {
    try {
      return await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: "Export file",
            accept: {
              "text/csv": [".csv"],
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [".xlsx"],
              "application/pdf": [".pdf"],
            },
          },
        ],
      });
    } catch {
      return null;
    }
  }

  return null;
};

const saveBlob = async (blob: Blob, fileName: string) => {
  const normalizedFileName = fileName.trim() || DEFAULT_EXPORT_NAME;
  const fileHandle = await getFileHandle(normalizedFileName);

  if (fileHandle) {
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    return;
  }

  saveAs(blob, normalizedFileName);
};

const normalizePdfText = (value: unknown) => {
  return String(value ?? "").replaceAll("GHS", "GHS");
};

export const exportToCSV = async (
  data: Record<string, unknown>[],
  fileName?: string,
) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  await saveBlob(blob, normalizeDownloadFileName(fileName, "csv"));
};

export const exportToExcel = async (
  data: Record<string, unknown>[],
  fileName?: string,
) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });
  await saveBlob(blob, normalizeDownloadFileName(fileName, "xlsx"));
};

export const exportToPDF = async (
  data: Record<string, unknown>[],
  columns: string[],
  fileName: string | undefined,
  title: string,
) => {
  const doc = new jsPDF();

  // Add Title
  doc.setFontSize(18);
  doc.text(normalizePdfText(title), 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);

  // Add timestamp
  const dateStr = new Date().toLocaleString();
  doc.text(normalizePdfText(`Generated on: ${dateStr}`), 14, 30);

  // Add Table
  const body = data.map((row) =>
    columns.map((col) => normalizePdfText(row[col])),
  );

  autoTable(doc, {
    startY: 40,
    head: [
      columns.map((col) =>
        normalizePdfText(
          col.charAt(0).toUpperCase() +
          col.slice(1).replaceAll(/([A-Z])/g, " $1"),
        ),
      ),
    ],
    body: body,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [16, 185, 129] }, // Emerald-500
    alternateRowStyles: { fillColor: [248, 250, 252] }, // Slate-50
  });

  const blob = doc.output("blob");
  await saveBlob(blob, normalizeDownloadFileName(fileName, "pdf"));
};
