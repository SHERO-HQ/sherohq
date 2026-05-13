import { query } from "./db";

/**
 * Generates a Stock Keeping Unit (SKU) for a product.
 */
export function generateSku(productId: string, customSku?: string | null): string {
  if (customSku && customSku.trim().length > 0) {
    return customSku.trim();
  }
  const idPart = productId.split("-")[0].toUpperCase();
  return `SHERO-${idPart}`;
}

/**
 * Generates a unique URL slug for a product.
 */
export async function generateUniqueSlug(baseSlug: string, productId?: string): Promise<string> {
  const slug = baseSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
    
  let isUnique = false;
  let counter = 0;
  let currentSlug = slug;

  while (!isUnique) {
    const queryText = productId 
      ? "SELECT id FROM products WHERE slug = $1 AND id <> $2"
      : "SELECT id FROM products WHERE slug = $1";
    
    const params = productId ? [currentSlug, productId] : [currentSlug];
    const result = await query(queryText, params);

    if (result.rowCount === 0) {
      isUnique = true;
    } else {
      counter++;
      currentSlug = `${slug}-${counter}`;
    }
  }

  return currentSlug;
}
