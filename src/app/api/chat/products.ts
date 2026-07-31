/**
 * Product Search & Catalog Module
 * 
 * Handles all product-related DB queries, search logic,
 * and dynamic catalog generation for the AI system prompt.
 */

import type { Product } from "@/types/product";
import { query as dbQuery } from "@/lib/db";
import { CATALOG_SUMMARY } from "./knowledge";
import { getVariantTokens } from "./utils";

export const STOP_WORDS = new Set([
  "for", "with", "and", "the", "need", "want", "best", "good", "help", "my",
  "a", "an", "to", "in", "as", "at", "of", "by", "on", "is", "it", "me", "we",
  "he", "so", "be", "do", "go", "if", "no", "or", "up", "us", "am", "are", "can",
  "please", "thanks", "thank", "hello", "hi", "hey", "looking", "buy", "get"
]);

const KEYWORD_MAPPINGS: Array<{ pattern: RegExp; term: string }> = [
  { pattern: /laptop|notebook|macbook|pc/, term: "laptop" },
  { pattern: /router|switch|wifi|network/, term: "router" },
  { pattern: /printer|printing/, term: "printer" },
  { pattern: /server|hosting|infrastructure/, term: "server" },
  { pattern: /monitor|display|screen/, term: "monitor" },
  { pattern: /phone|mobile|smartphone/, term: "phone" },
  { pattern: /camera|webcam/, term: "camera" },
  { pattern: /audio|speaker|headset|earbuds/, term: "audio" },
];

// ---------------------------------------------------------------------------
// Core DB query
// ---------------------------------------------------------------------------

export async function dbFetchProducts(
  search?: string,
  category?: string,
  limit: number = 40,
): Promise<Product[]> {
  const runSearch = async (joinType: "AND" | "OR" = "AND"): Promise<Product[]> => {
    try {
      let queryText = `
        SELECT
          p.*,
          COALESCE(c_by_id.name, c_by_name.name) as category_name,
          COALESCE(c_by_id.id, c_by_name.id) as resolved_category_id
        FROM products p
        LEFT JOIN categories c_by_id ON p.category = c_by_id.id
        LEFT JOIN categories c_by_name ON p.category = c_by_name.name
      `;

      const sqlParams: (string | number)[] = [];
      const conditions: string[] = [];
      let paramIndex = 1;

      if (category && category !== "all") {
        conditions.push(
          `(p.category = $${paramIndex} OR c_by_id.id = $${paramIndex} OR c_by_name.name ILIKE $${paramIndex})`,
        );
        sqlParams.push(`%${category}%`);
        paramIndex++;
      }

      if (search) {
        const tokens = search
          .toLowerCase()
          .split(/\s+/)
          .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));

        if (tokens.length > 0) {
          const tokenConditions: string[] = [];
          tokens.forEach((token) => {
            const variants = getVariantTokens(token);
            const orParts: string[] = [];
            
            variants.forEach((v) => {
              orParts.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.specifications::text ILIKE $${paramIndex} OR p.features::text ILIKE $${paramIndex} OR c_by_id.name ILIKE $${paramIndex} OR c_by_name.name ILIKE $${paramIndex})`);
              sqlParams.push(`%${v}%`);
              paramIndex++;
            });
            
            tokenConditions.push(`(${orParts.join(" OR ")})`);
          });
          
          conditions.push(`(${tokenConditions.join(` ${joinType} `)})`);
        } else {
          conditions.push(
            `(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.specifications::text ILIKE $${paramIndex} OR p.features::text ILIKE $${paramIndex} OR c_by_id.name ILIKE $${paramIndex} OR c_by_name.name ILIKE $${paramIndex})`,
          );
          sqlParams.push(`%${search}%`);
          paramIndex++;
        }
      }

      if (conditions.length > 0) {
        queryText += " WHERE " + conditions.join(" AND ");
      }

      queryText += ` ORDER BY p.inStock DESC, p."createdAt" DESC LIMIT $${paramIndex}`;
      sqlParams.push(limit);

      const result = await dbQuery(queryText, sqlParams);
      
      return result.rows.map((row: any) => {
        const safeParse = (val: unknown): unknown => {
          if (!val) return null;
          if (typeof val !== "string") return val;
          try {
            return JSON.parse(val);
          } catch (e) {
            return val;
          }
        };

        return {
          ...row,
          category: row.category_name || row.category,
          categoryId: row.resolved_category_id || row.category,
          price: Number(row.price),
          originalPrice: row.originalPrice ? Number(row.originalPrice) : null,
          rating: Number(row.rating),
          images: safeParse(row.images),
          features: safeParse(row.features),
          specifications: safeParse(row.specifications),
          inStock: Boolean(row.inStock),
          sku: row.sku || null,
          slug: row.slug || null,
          stockQuantity: row.stockQuantity,
          quantity: row.stockQuantity,
          condition: row.condition || "New",
          isSpotlight: Boolean(row.isSpotlight),
          isFeatured: Boolean(row.isFeatured),
        } as Product;
      });
    } catch (error) {
      console.error(`Direct DB fetch (${joinType}) failed:`, error);
      return [];
    }
  };

  // Try strict AND search first
  let results = await runSearch("AND");
  if (results.length === 0 && search) {
    // Relax search to OR matching if AND returned nothing
    results = await runSearch("OR");
  }
  return results;
}

// ---------------------------------------------------------------------------
// Dynamic catalog summary for system prompt
// ---------------------------------------------------------------------------

let cachedCatalogSummary: { text: string; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function fetchDynamicCatalogSummary(userQuery?: string): Promise<string> {
  try {
    // Return cached summary if available and not expired
    if (cachedCatalogSummary && Date.now() - cachedCatalogSummary.timestamp < CACHE_TTL_MS) {
      return cachedCatalogSummary.text;
    }

    let products: Product[] = [];
    if (userQuery) {
      const hasProductKeywords = /\b(laptop|notebook|macbook|pc|router|switch|wifi|network|printer|server|adapter|headset|earbuds|screen|monitor|jbl|hp|dell|lenovo|samsung|price|buy|cost|get)\b/i.test(userQuery);
      if (hasProductKeywords) {
        products = await dbFetchProducts(userQuery, undefined, 15);
      }
    }

    // Fill details with newest products if search yielded too few items
    if (products.length < 10) {
      const recentProducts = await dbFetchProducts(undefined, undefined, 30);
      const seen = new Set(products.map((p) => p.id));
      recentProducts.forEach((p) => {
        if (!seen.has(p.id)) {
          products.push(p);
          seen.add(p.id);
        }
      });
    }

    if (!Array.isArray(products) || products.length === 0) return CATALOG_SUMMARY;

    // Group by category and build a clean bulleted list
    const categories: Record<string, string[]> = {};
    products.forEach((p) => {
      const cat = p.category || "Other";
      if (!categories[cat]) categories[cat] = [];
      const stockStatus = p.inStock ? "In Stock" : "Out of Stock";
      const specsSummary = p.specifications
        ? Object.entries(p.specifications)
            .map(([k, v]) => `${k}: ${v}`)
            .slice(0, 3)
            .join(", ")
        : "";
      const specsPart = specsSummary ? ` (${specsSummary})` : "";
      categories[cat].push(`${p.name}${specsPart} - GHS ${p.price} - ${stockStatus} [ID: ${p.id}]`);
    });

    let result = "CURRENT INVENTORY:\n";
    for (const [cat, items] of Object.entries(categories)) {
      result += `- ${cat}:\n`;
      items.forEach((item) => {
        result += `  - ${item}\n`;
      });
    }

    cachedCatalogSummary = { text: result, timestamp: Date.now() };
    return result;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to fetch dynamic catalog:", error);
    }
    return CATALOG_SUMMARY;
  }
}

// ---------------------------------------------------------------------------
// Product recommendations (post-LLM response)
// ---------------------------------------------------------------------------

export async function fetchRecommendedProducts(
  query: string,
  budgetCap?: number,
): Promise<Product[]> {
  try {
    const normalizedQuery = query.trim().toLowerCase();

    const genericQueries = new Set([
      "",
      "latest products",
      "featured",
      "products",
      "options",
    ]);

    const dedupeProducts = (products: Product[]): Product[] => {
      const seen = new Set<string>();
      return products.filter((product) => {
        if (!product?.id || seen.has(product.id)) return false;
        seen.add(product.id);
        return true;
      });
    };

    const applyBudgetCap = (products: Product[]): Product[] => {
      if (!budgetCap || budgetCap <= 0) return products;
      return products.filter((product) => {
        const price = Number(product.price);
        return Number.isFinite(price) && price <= budgetCap;
      });
    };

    const finalizeRecommendations = (products: Product[]): Product[] => {
      const deduped = dedupeProducts(products);
      const inStock = deduped.filter((product) => product.inStock);
      const prioritized = inStock.length > 0 ? inStock : deduped;
      return applyBudgetCap(prioritized).slice(0, 4);
    };

    const fetchByParam = async (
      param: "search" | "category",
      term: string,
    ): Promise<Product[]> => {
      if (param === "search") {
        return dbFetchProducts(term, undefined, 40);
      } else {
        return dbFetchProducts(undefined, term, 40);
      }
    };

    const fetchFeatured = async (): Promise<Product[]> => {
      const products = await dbFetchProducts(undefined, undefined, 40);
      return finalizeRecommendations(products);
    };

    if (genericQueries.has(normalizedQuery)) {
      return fetchFeatured();
    }

    const searchTerms = new Set<string>();
    searchTerms.add(normalizedQuery);

    for (const token of normalizedQuery.split(/\s+/)) {
      if (token.length < 2 || STOP_WORDS.has(token)) continue;
      searchTerms.add(token);
    }

    for (const mapping of KEYWORD_MAPPINGS) {
      if (mapping.pattern.test(normalizedQuery)) {
        searchTerms.add(mapping.term);
      }
    }

    const terms = [...searchTerms].slice(0, 6);
    const collected: Product[] = [];

    for (const term of terms) {
      const searchResults = await fetchByParam("search", term);
      if (searchResults.length > 0) {
        collected.push(...searchResults);
      }
      if (collected.length >= 4) break;
    }

    if (collected.length < 3) {
      for (const term of terms) {
        const categoryResults = await fetchByParam("category", term);
        if (categoryResults.length > 0) {
          collected.push(...categoryResults);
        }
        if (collected.length >= 4) break;
      }
    }

    const finalizedFromCollected = finalizeRecommendations(collected);
    if (finalizedFromCollected.length > 0) {
      return finalizedFromCollected;
    }

    return fetchFeatured();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error fetching recommended products:", error);
    }
    return [];
  }
}
