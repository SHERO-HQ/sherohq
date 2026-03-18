import db from "../db/database";

/**
 * Generates a unique URL slug for a product.
 * If the provided slug exists, it appends a counter until a unique one is found.
 * 
 * @param baseSlug The initial slug to check
 * @param productId Optional ID to exclude from uniqueness check (for updates)
 * @returns A unique slug string
 */
export async function generateUniqueSlug(baseSlug: string, productId?: string): Promise<string> {
  let slug = baseSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
    
  let isUnique = false;
  let counter = 0;
  let currentSlug = slug;

  while (!isUnique) {
    const query = productId 
      ? "SELECT id FROM products WHERE slug = $1 AND id <> $2"
      : "SELECT id FROM products WHERE slug = $1";
    
    const params = productId ? [currentSlug, productId] : [currentSlug];
    const result = await db.query(query, params);

    if (result.rowCount === 0) {
      isUnique = true;
    } else {
      counter++;
      currentSlug = `${slug}-${counter}`;
    }
  }

  return currentSlug;
}
