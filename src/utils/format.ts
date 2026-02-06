/**
 * Formats a number as GHS currency.
 * @param amount - The numeric value to format.
 * @returns A formatted string like "GH₵1,234.56".
 */
export function formatCurrency(amount: number | string): string {
  const numericAmount =
    typeof amount === "string" ? Number.parseFloat(amount) : amount;

  if (Number.isNaN(numericAmount)) {
    return "GH₵0.00";
  }

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    currencyDisplay: "narrowSymbol",
  }).format(numericAmount);
}
