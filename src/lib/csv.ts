// CSV for spreadsheet exports. Cells that start like a formula (=, +, -, @)
// get a leading apostrophe, so a signup typed as "=HYPERLINK(…)" stays text
// when the file is opened in Excel or Sheets.
export function toCsv(header: string[], rows: Array<Array<string | number | null>>): string {
  const cell = (value: string | number | null) => {
    let text = value === null ? "" : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  // A byte-order mark so Excel reads the file as UTF-8 (names like "Ɔ" or "é").
  return "﻿" + [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
}
