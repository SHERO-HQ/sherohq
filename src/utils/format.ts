/**
 * Formats a number as S currency.
 * @param amount - The numeric value to format.
 * @returns A formatted string like "S1,234.56".
 */
export function formatCurrency(amount: number | string): string {
  const numericAmount =
    typeof amount === "string" ? Number.parseFloat(amount) : amount;

  if (Number.isNaN(numericAmount)) {
    return "GHS 0.00";
  }

  return `GHS ${numericAmount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
