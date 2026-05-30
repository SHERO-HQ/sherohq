/**
 * Formats a number as Ghanaian Cedi (GHS) currency with the Cedi sign (GH₵).
 * @param amount - The numeric value to format.
 * @returns A formatted string like "GH₵1,234.56".
 */
export function formatCurrency(amount: number | string): string {
  const numericAmount =
    typeof amount === "string" ? Number.parseFloat(amount) : amount;

  if (Number.isNaN(numericAmount)) {
    return "GH₵0.00";
  }

  return `GH₵${numericAmount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
