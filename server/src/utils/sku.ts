/**
 * Generates a Stock Keeping Unit (SKU) for a product.
 * If a custom SKU is provided, it returns that.
 * Otherwise, it generates one based on the product ID.
 *
 * @param productId - The unique identifier of the product
 * @param customSku - Optional custom SKU provided by user
 * @returns The final SKU string
 */
export function generateSku(
  productId: string,
  customSku?: string | null,
): string {
  if (customSku && customSku.trim().length > 0) {
    return customSku.trim();
  }

  // Auto-generate: SHERO-XXXXXXX where XXXXXXX is the first part of the UUID
  const idPart = productId.split("-")[0].toUpperCase();
  return `SHERO-${idPart}`;
}
