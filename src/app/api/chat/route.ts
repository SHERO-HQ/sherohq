import { NextResponse } from "next/server";
import type { Product } from "@/types/product";
import { CATALOG_SUMMARY, GUIDE_MAPPING, SUPPORT_KNOWLEDGE } from "./knowledge";
import { query as dbQuery } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";
import { getUserFromSession } from "@/lib/auth";

const STOP_WORDS = new Set([
  "for", "with", "and", "the", "need", "want", "best", "good", "help", "my",
  "a", "an", "to", "in", "as", "at", "of", "by", "on", "is", "it", "me", "we",
  "he", "so", "be", "do", "go", "if", "no", "or", "up", "us", "am", "are", "can",
  "please", "thanks", "thank", "hello", "hi", "hey", "looking", "buy", "get"
]);

/** Resolve the internal backend URL (server-side only) */
const BACKEND_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://api.sherohq.com"
    : "http://127.0.0.1:5000")
).replace(/\/$/, "");

export function getVariantTokens(token: string): string[] {
  const variants = [token];
  if (token.endsWith("es") && token.length > 4) {
    variants.push(token.slice(0, -2)); // e.g. switches -> switch
  } else if (token.endsWith("s") && token.length > 3) {
    variants.push(token.slice(0, -1)); // e.g. laptops -> laptop
  }
  return variants;
}

async function dbFetchProducts(search?: string, category?: string, limit: number = 40): Promise<Product[]> {
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

async function fetchDynamicCatalogSummary(userQuery?: string): Promise<string> {
  try {
    let products: Product[] = [];
    if (userQuery) {
      // Look for query-specific keywords before running RAG search
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
    return result;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to fetch dynamic catalog:", error);
    }
    return CATALOG_SUMMARY;
  }
}

function getSystemPrompt(catalog: string) {
  return `You are SHERO's product and IT support assistant for Ghana-based users.

OBJECTIVE
- Give a direct, useful answer first.
- Be concise (1-3 short sentences) but not robotic.
- Ask one clarifying question only when needed.

TAGGING RULES
- Use [RECOMMEND: query] when the user is asking for products, options, pricing, or comparisons.
- Use [BOOK: topic] when the user wants to consult or speak to an expert but hasn't provided booking details yet.
- Use [BOOK_DIRECT: {"name": "...", "email": "...", "phone": "...", "service": "...", "date": "YYYY-MM-DD", "time": "...", "message": "..."}] when the user wants to book/schedule a consultation and has provided their booking details (name, email, date, time, and service like Managed IT, Custom Software, Cyber Security, etc.).
- Use [TICKET] only when the user wants to create a support ticket but hasn't provided details (name, email, subject, message) yet.
- Use [TICKET_DIRECT: {"name": "...", "email": "...", "phone": "...", "subject": "...", "message": "...", "priority": "medium", "category": "General"}] when you tried troubleshooting but it failed, and the user wants to open a support ticket and has provided their details (name, email, subject, message).
- Use [CART: product name] only when user explicitly asks to buy/add/order now.
- Use [TRACK_ORDER: id] or [TRACK_TICKET: id] only when the user provides a valid ID.

IMPORTANT
- Do NOT default to [BOOK] or [TICKET] for normal product questions.
- Do NOT claim actions were completed unless a tag indicates the action.
- If tracking is requested without an ID, ask for the order/ticket ID.
- For booking/scheduling: If they say they want to book a call/consultation but haven't provided details, ask them to provide their name, email, preferred date (YYYY-MM-DD), time, and service so you can book it for them directly.
- For support tickets: If they say they want to open a support ticket or speak to support but haven't provided details, ask them to provide their name, email, ticket subject, and a description of the issue so you can create the ticket directly.
- For budget requests, reflect Ghana cedi context (GHS).
- Never recommend products above the user's stated budget cap.
- If no SHERO troubleshooting guide is available, provide concise general troubleshooting steps before escalating to support.
- When recommending, present product choices in a clear, formatted bulleted list with GHS price and stock status.

KNOWLEDGE
${catalog}
${SUPPORT_KNOWLEDGE}`;
}

type ChatHistoryMessage = {
  role: string;
  content: string;
};

const GEMINI_MODEL_CANDIDATES = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

function extractBudgetGhs(input: string): number | null {
  const normalized = input.toLowerCase();

  const hasCurrencySignal =
    /\bghs?\b/.test(normalized) ||
    /\bcedi(?:s)?\b/.test(normalized) ||
    normalized.includes("¢");

  const hasBudgetKeyword =
    normalized.includes("budget") ||
    normalized.includes("under") ||
    normalized.includes("below") ||
    normalized.includes("max") ||
    normalized.includes("maximum") ||
    normalized.includes("up to") ||
    normalized.includes("upto") ||
    normalized.includes("within") ||
    normalized.includes("less than") ||
    normalized.includes("at most") ||
    normalized.includes("not exceed") ||
    normalized.includes("no more than") ||
    normalized.includes("<=");

  const hasBudgetSignal =
    hasCurrencySignal ||
    hasBudgetKeyword ||
    /^\s*\d[\d,]*(?:\.\d+)?\s*$/.test(normalized);

  if (!hasBudgetSignal) return null;

  const kMatch = normalized.match(/(\d+(?:\.\d+)?)\s*k\b/);
  if (kMatch) {
    const parsedK = Number(kMatch[1]);
    if (Number.isFinite(parsedK)) {
      return parsedK * 1000;
    }
  }

  const match = normalized.match(/(\d[\d,]*(?:\.\d+)?)/);
  if (!match) return null;

  const parsed = Number(match[1].replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveBudgetFromConversation(
  message: string,
  history: ChatHistoryMessage[] = [],
): number | null {
  const currentBudget = extractBudgetGhs(message);
  if (currentBudget && currentBudget > 0) return currentBudget;

  for (let i = history.length - 1; i >= 0; i--) {
    const turn = history[i];
    if (turn.role !== "user") continue;

    const historicalBudget = extractBudgetGhs(turn.content);
    if (historicalBudget && historicalBudget > 0) {
      return historicalBudget;
    }
  }

  return null;
}

function formatGhs(amount: number): string {
  return `GHS ${amount.toLocaleString("en-GH")}`;
}

function inferGuideSlug(userMessage: string): string | undefined {
  const normalized = userMessage.toLowerCase();
  let bestMatch: { slug: string; score: number } | null = null;

  for (const guide of GUIDE_MAPPING) {
    const score = guide.keywords.reduce((acc, keyword) => {
      return acc + (normalized.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);

    if (score <= 0) continue;
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { slug: guide.slug, score };
    }
  }

  return bestMatch?.slug;
}

function hasGuideAttemptContext(history: ChatHistoryMessage[] = []): boolean {
  return history.some((message) => {
    if (message.role !== "assistant") return false;

    const content = message.content.toLowerCase();
    return (
      content.includes("guide") ||
      content.includes("troubleshoot") ||
      content.includes("step") ||
      content.includes("try this")
    );
  });
}

function shouldEscalateToSupport(
  userMessage: string,
  history: ChatHistoryMessage[] = [],
): boolean {
  const normalized = userMessage.toLowerCase();

  const unableSignals = [
    "didn't work",
    "didnt work",
    "not working",
    "still broken",
    "still not",
    "still failing",
    "can't fix",
    "cant fix",
    "cannot fix",
    "can't follow",
    "cant follow",
    "cannot follow",
    "too hard",
    "too difficult",
    "confusing",
    "not able",
    "unable to",
    "i tried",
    "tried that",
    "followed the guide",
    "guide didn't",
    "guide did not",
    "nothing works",
  ];

  const hasUnableSignal = unableSignals.some((signal) =>
    normalized.includes(signal),
  );
  if (!hasUnableSignal) return false;

  return hasGuideAttemptContext(history) || normalized.includes("guide");
}

function hasTroubleshootingIntent(userMessage: string): boolean {
  const normalized = userMessage.toLowerCase();

  const issueSignals = [
    "fix",
    "issue",
    "problem",
    "error",
    "slow",
    "sluggish",
    "lag",
    "laggy",
    "freez",
    "broken",
    "crash",
    "boot",
    "not turning on",
    "won't",
    "wont",
    "overheating",
    "troubleshoot",
    "repair",
  ];

  const productSignals = [
    "laptop",
    "pc",
    "router",
    "switch",
    "network",
    "printer",
    "phone",
    "monitor",
    "storage",
    "audio",
    "accessory",
    "recommend",
    "buy",
    "order",
    "price",
    "budget",
  ];

  const hasIssueSignal = issueSignals.some((signal) =>
    normalized.includes(signal),
  );

  if (hasIssueSignal) return true;

  const asksForHelp =
    normalized.includes("help") || normalized.includes("assist");
  const isShoppingIntent = productSignals.some((signal) =>
    normalized.includes(signal),
  );

  return asksForHelp && !isShoppingIntent;
}

function buildInlineTroubleshootingSteps(userMessage: string): string {
  const normalized = userMessage.toLowerCase();

  if (
    normalized.includes("slow") ||
    normalized.includes("sluggish") ||
    normalized.includes("lag")
  ) {
    return "Try this first: 1) Restart and disable heavy startup apps. 2) Keep at least 15% free storage and install OS updates. 3) Run a full malware scan. If still slow, share your OS and laptop model for deeper checks.";
  }

  if (
    normalized.includes("boot") ||
    normalized.includes("not turning on") ||
    normalized.includes("black screen") ||
    normalized.includes("power")
  ) {
    return "Try this first: 1) Disconnect charger and peripherals, hold power for 15 seconds, then restart. 2) Try another charger or outlet. 3) Run BIOS or hardware diagnostics if available. If it still fails, share any lights, beeps, or error messages.";
  }

  if (normalized.includes("overheating") || normalized.includes("hot")) {
    return "Try this first: 1) Clean vents and use the laptop on a hard surface. 2) Close heavy apps and apply system and driver updates. 3) Check fan health with diagnostics. If temperature still spikes, tell me when it happens and the exact model.";
  }

  return "Let's troubleshoot this: 1) Restart the device and install pending updates. 2) Check storage, memory, and background apps. 3) Run built-in diagnostics and share any error code so I can guide the next fix.";
}

export async function fetchRecommendedProducts(query: string, budgetCap?: number) {
  try {
    const normalizedQuery = query.trim().toLowerCase();
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `🔍 AI Fetching products for: "${normalizedQuery || query}" using ${BACKEND_URL}`,
      );
    }

    const genericQueries = new Set([
      "",
      "latest products",
      "featured",
      "products",
      "options",
    ]);

    const keywordMappings: Array<{ pattern: RegExp; term: string }> = [
      { pattern: /laptop|notebook|macbook|pc/, term: "laptop" },
      { pattern: /router|switch|wifi|network/, term: "router" },
      { pattern: /printer|printing/, term: "printer" },
      { pattern: /server|hosting|infrastructure/, term: "server" },
      { pattern: /monitor|display|screen/, term: "monitor" },
      { pattern: /phone|mobile|smartphone/, term: "phone" },
      { pattern: /camera|webcam/, term: "camera" },
      { pattern: /audio|speaker|headset|earbuds/, term: "audio" },
    ];

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
    // 1. Full query is most specific
    searchTerms.add(normalizedQuery);

    // 2. Individual tokens (like brand names) are second most specific
    for (const token of normalizedQuery.split(/\s+/)) {
      if (token.length < 2 || STOP_WORDS.has(token)) continue;
      searchTerms.add(token);
    }

    // 3. Mapped categories (like 'laptop') are least specific fallback terms
    for (const mapping of keywordMappings) {
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

function buildFallbackReply(
  userMessage: string,
  history: ChatHistoryMessage[] = [],
): string {
  const normalized = userMessage.toLowerCase().trim();
  const guideSlug = inferGuideSlug(userMessage) || GUIDE_MAPPING[0]?.slug;
  const escalatesToSupport = shouldEscalateToSupport(userMessage, history);

  // Tracking intents should be handled first to support quick actions reliably.
  const orderIdMatch = userMessage.match(
    /(?:order(?:\s*id)?[:#\s-]*)([a-zA-Z0-9-]{5,})/i,
  );
  const ticketIdMatch = userMessage.match(
    /(?:ticket(?:\s*id)?[:#\s-]*)([a-zA-Z0-9-]{4,})/i,
  );

  if (normalized.includes("track") && normalized.includes("order")) {
    if (orderIdMatch?.[1]) {
      return `Got it. Tracking your order now. [TRACK_ORDER:${orderIdMatch[1]}]`;
    }
    return "Sure. Share your order ID and I will track it for you.";
  }

  if (normalized.includes("track") && normalized.includes("ticket")) {
    if (ticketIdMatch?.[1]) {
      return `Got it. Tracking your ticket now. [TRACK_TICKET:${ticketIdMatch[1]}]`;
    }
    return "Sure. Share your ticket ID and I will check the status.";
  }

  // Repetition guard: robust against clients that may include current message in history.
  const userHistory = history
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase().trim());

  const lastUser = userHistory[userHistory.length - 1] || null;
  const previousUser =
    lastUser === normalized
      ? userHistory[userHistory.length - 2] || null
      : lastUser;

  if (previousUser === normalized) {
    return "I understand. Give me one detail so I can help better: your use case, budget (GHS), or exact issue.";
  }

  // Intent-based hardcoding (Smarter triggers)
  if (
    normalized.includes("book") ||
    normalized.includes("consultation") ||
    normalized.includes("call") ||
    normalized.includes("meeting") ||
    normalized.includes("talk to someone")
  ) {
    return "I've flagged this for a professional consultation. You can schedule a time here: [BOOK: Enterprise IT Consultation]";
  }

  const supportKeywords = [
    "crash",
    "broken",
    "os",
    "boot",
    "won't boot",
    "wont boot",
    "blue screen",
    "not turning on",
    "overheating",
    "error",
    "problem",
    "issue",
    "failing",
    "trouble",
    "don't work",
    "repair",
  ];
  if (escalatesToSupport) {
    return "I see those troubleshooting steps didn't resolve the issue. I can help you open a support ticket directly from this chat. Would you like me to do that? Please click 'Open Support Ticket Inline' below or provide your Name, Email, Subject, and a brief description. [TICKET]";
  }

  if (supportKeywords.some((k) => normalized.includes(k))) {
    if (!guideSlug) {
      return buildInlineTroubleshootingSteps(userMessage);
    }
    return `Let's troubleshoot this first. Start with this step-by-step guide and tell me where you get stuck: [GUIDE: ${guideSlug}]`;
  }

  if (normalized.includes("help") && hasTroubleshootingIntent(userMessage)) {
    if (!guideSlug) {
      return buildInlineTroubleshootingSteps(userMessage);
    }
    return `I can help you fix this. Start with this guide and I will walk you through each step: [GUIDE: ${guideSlug}]`;
  }

  // 3. Product Discovery Fallback
  const laptopKeywords = ["laptop", "pc", "computer", "macbook", "hp", "dell"];
  if (laptopKeywords.some((k) => normalized.includes(k))) {
    const budget = extractBudgetGhs(userMessage);
    if (normalized.includes("slow")) {
      if (!guideSlug) {
        return buildInlineTroubleshootingSteps(userMessage);
      }
      return `I can help fix laptop performance first. Start with this troubleshooting guide, then tell me exactly which step didn't help: [GUIDE: ${guideSlug}]`;
    }

    let brand = "";
    if (normalized.includes("hp")) brand = "hp ";
    else if (normalized.includes("dell")) brand = "dell ";
    else if (normalized.includes("lenovo")) brand = "lenovo ";
    else if (normalized.includes("apple") || normalized.includes("macbook")) brand = "apple ";

    if (budget && budget < 6000)
      return `I recommend these entry-level ${brand}laptops within your ${formatGhs(budget)} budget: [RECOMMEND: ${brand}student laptop]`;
    if (budget)
      return `I've found some premium options for your ${formatGhs(budget)} budget: [RECOMMEND: ${brand}laptop]`;
    return `I can help you browse our current ${brand}laptop inventory: [RECOMMEND: ${brand}laptop]`;
  }

  const networkKeywords = ["network", "router", "switch", "wifi", "internet"];
  if (networkKeywords.some((k) => normalized.includes(k))) {
    return "Check out our networking hardware including routers and switches: [RECOMMEND: router switch]";
  }

  // 4. Budget-only check
  const budgetOnly = extractBudgetGhs(userMessage);
  if (budgetOnly) {
    return `Noted budget: ${formatGhs(budgetOnly)}. What specifically are you looking for? (Laptops, Networking, or Repair)`;
  }

  // 5. Generic catch-all with variety based on history length
  if (history.length > 4) {
    return "I can narrow this quickly. Tell me your exact use case and budget (GHS), and I will recommend the best options.";
  }

  return "I can help you find hardware or IT services. What's your need and budget (GHS)? [RECOMMEND: laptops]";
}

export async function POST(request: Request) {
  try {
    const { message, history, imageData, audioData } = await request.json();
    const safeHistory: ChatHistoryMessage[] = Array.isArray(history)
      ? history
      : [];
    const budgetCap = resolveBudgetFromConversation(message, safeHistory);
    const catalogSummary = await fetchDynamicCatalogSummary(message);

    let replyContent = "";

    if (!process.env.GEMINI_API_KEY) {
      replyContent = buildFallbackReply(message, safeHistory);
    } else {
      // Gemini uses "user" and "model" roles for conversational turns.
      type ContentPart =
        | { text: string }
        | { inline_data: { mime_type: string; data: string } };
      const contents = safeHistory.map(
        (msg: { role: string; content: string; imageData?: string }) => {
          const parts: ContentPart[] = [{ text: msg.content }];
          if (msg.imageData) {
            const mimeType = msg.imageData.split(";")[0].split(":")[1];
            const data = msg.imageData.split(",")[1];
            parts.push({
              inline_data: {
                mime_type: mimeType,
                data: data,
              },
            });
          }
          return {
            role: msg.role === "assistant" ? "model" : "user",
            parts,
          };
        },
      );

      const currentParts: ContentPart[] = [{ text: message }];
      if (imageData) {
        const mimeType = imageData.split(";")[0].split(":")[1];
        const data = imageData.split(",")[1];
        currentParts.push({
          inline_data: {
            mime_type: mimeType,
            data: data,
          },
        });
      }

      if (audioData) {
        const mimeType = audioData.split(";")[0].split(":")[1];
        const data = audioData.split(",")[1];
        currentParts.push({
          inline_data: {
            mime_type: mimeType,
            data: data,
          },
        });
      }

      contents.push({
        role: "user",
        parts: currentParts,
      });

      let response: Response | null = null;
      let lastError: unknown = null;

      for (const model of GEMINI_MODEL_CANDIDATES) {
        const currentResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: getSystemPrompt(catalogSummary) }],
              },
              contents,
              tools: [
                {
                  googleSearch: {}
                }
              ],
              generationConfig: {
                temperature: 0.7,
              },
            }),
          },
        );

        // Stop at first success
        if (currentResponse.ok) {
          response = currentResponse;
          break;
        }

        const errorData = await currentResponse.json();
        lastError = {
          model,
          status: errorData?.error?.status,
          message: errorData?.error?.message,
          httpStatus: currentResponse.status,
        };

        // Retry next model only for model/quota/provider availability cases
        const status = errorData?.error?.status as string | undefined;
        if (
          status !== "RESOURCE_EXHAUSTED" &&
          status !== "NOT_FOUND" &&
          currentResponse.status !== 404 &&
          currentResponse.status !== 429
        ) {
          // Non-re-triable provider failure; stop trying additional models.
          break;
        }
      }

      if (response) {
        const data = await response.json();
        replyContent =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "I'm sorry, I couldn't generate a response.";
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.error(
            "Chat API provider error: no successful model",
            lastError,
          );
        }
        replyContent = buildFallbackReply(message, safeHistory);
      }
    }

    // Extract query and search for products
    let recommendedProducts: Product[] = [];
    let supportAction: "ticket" | "contact" | undefined = undefined;
    let guideSlug: string | undefined = undefined;
    let cartProduct: string | undefined = undefined;
    let trackOrder: string | undefined = undefined;
    let trackTicket: string | undefined = undefined;
    let bookStore: string | undefined = undefined;
    let bookDirect: any = undefined;
    let ticketDirect: any = undefined;

    // Detect new Elite tags
    const cartMatch = replyContent.match(/\[CART:\s*["']?([\s\S]*?)["']?\]/i);
    if (cartMatch) {
      cartProduct = cartMatch[1].trim();
      replyContent = replyContent.replace(/\[CART:[\s\S]*?\]/gi, "").trim();
    }

    const orderMatch = replyContent.match(/\[TRACK_ORDER:\s*([\s\S]*?)\]/i);
    if (orderMatch) {
      trackOrder = orderMatch[1].trim();
      replyContent = replyContent.replace(/\[TRACK_ORDER:[\s\S]*?\]/gi, "").trim();
    }

    const ticketTrackMatch = replyContent.match(/\[TRACK_TICKET:\s*([\s\S]*?)\]/i);
    if (ticketTrackMatch) {
      trackTicket = ticketTrackMatch[1].trim();
      replyContent = replyContent.replace(/\[TRACK_TICKET:[\s\S]*?\]/gi, "").trim();
    }

    const ticketDirectMatch = replyContent.match(/\[TICKET_DIRECT:\s*(\{[\s\S]*?\})\]/i);
    if (ticketDirectMatch) {
      try {
        const jsonStr = ticketDirectMatch[1].trim();
        ticketDirect = JSON.parse(jsonStr);
        replyContent = replyContent.replace(/\[TICKET_DIRECT:[\s\S]*?\]/gi, "").trim();
      } catch (e) {
        console.error("Failed to parse TICKET_DIRECT JSON:", e);
      }
    }

    const bookDirectMatch = replyContent.match(/\[BOOK_DIRECT:\s*(\{[\s\S]*?\})\]/i);
    if (bookDirectMatch) {
      try {
        const jsonStr = bookDirectMatch[1].trim();
        bookDirect = JSON.parse(jsonStr);
        replyContent = replyContent.replace(/\[BOOK_DIRECT:[\s\S]*?\]/gi, "").trim();
      } catch (e) {
        console.error("Failed to parse BOOK_DIRECT JSON:", e);
      }
    }

    const bookMatch = replyContent.match(/\[BOOK:\s*([\s\S]*?)\]/i);
    if (bookMatch) {
      bookStore = bookMatch[1].trim();
      replyContent = replyContent.replace(/\[BOOK:[\s\S]*?\]/gi, "").trim();
    }

    // Detect [GUIDE: slug] tags
    const guideMatch = replyContent.match(/\[GUIDE:\s*([\s\S]*?)\]/i);
    if (guideMatch) {
      guideSlug = guideMatch[1].trim();
      replyContent = replyContent.replace(/\[GUIDE:\s*[\s\S]*?\]/gi, "").trim();
    }

    // Detect [TICKET] or [CONTACT] tags
    if (replyContent.includes("[TICKET]")) {
      supportAction = "ticket";
      replyContent = replyContent.replace("[TICKET]", "").trim();
    } else if (replyContent.includes("[CONTACT]")) {
      supportAction = "contact";
      replyContent = replyContent.replace("[CONTACT]", "").trim();
    }

    let queryMatch = replyContent.match(
      /\[(?:RECOMMEND|QUERY|SEARCH):\s*(.*?)\]/i,
    );

    // Fallback: If AI forgot the tag or didn't trigger
    if (!queryMatch && !supportAction && !guideSlug) {
      const lowerReply = replyContent.toLowerCase();
      const lowerMessage = message.toLowerCase();

      const isOrderTrackIntent =
        lowerMessage.includes("track") && lowerMessage.includes("order");
      const isTicketTrackIntent =
        lowerMessage.includes("track") && lowerMessage.includes("ticket");

      if (isOrderTrackIntent) {
        const extractedOrderId = message.match(
          /(?:order(?:\s*id)?[:#\s-]*)([a-zA-Z0-9-]{5,})/i,
        );
        if (extractedOrderId?.[1]) {
          trackOrder = extractedOrderId[1];
        } else {
          replyContent =
            "Please share your order ID so I can track it for you.";
        }
      } else if (isTicketTrackIntent) {
        const extractedTicketId = message.match(
          /(?:ticket(?:\s*id)?[:#\s-]*)([a-zA-Z0-9-]{4,})/i,
        );
        if (extractedTicketId?.[1]) {
          trackTicket = extractedTicketId[1];
        } else {
          replyContent =
            "Please share your ticket ID so I can check the latest status.";
        }
      } else {
        // 1. Check for specific product names from current catalog summary
        const catalogNames = catalogSummary
          .split("\n")
          .filter((line) => line.includes("("))
          .map((line) => {
            const match = line.match(/^\s*-\s*(.*?)\s*\(/);
            return match ? match[1].trim() : null;
          })
          .filter(Boolean) as string[];

        let mentionedProduct = catalogNames.find(
          (name) =>
            lowerReply.includes(name.toLowerCase()) ||
            lowerMessage.includes(name.toLowerCase()),
        );

        // 2. If nothing found in current turn, scan history
        if (!mentionedProduct && safeHistory.length > 0) {
          for (let i = safeHistory.length - 1; i >= 0; i--) {
            const histContent = safeHistory[i].content.toLowerCase();
            const found = catalogNames.find((name) =>
              histContent.includes(name.toLowerCase()),
            );
            if (found) {
              mentionedProduct = found;
              break;
            }
          }
        }

        if (mentionedProduct) {
          queryMatch = ["", mentionedProduct] as RegExpMatchArray;
        } else {
          // 3. Escalation Detection
          const wantsHuman =
            lowerMessage.includes("human") ||
            lowerMessage.includes("agent") ||
            lowerMessage.includes("representative");
          const asksExpert =
            lowerMessage.includes("expert") || lowerMessage.includes("consult");

          const inferredGuide = inferGuideSlug(message);
          const shouldOfferInlineTroubleshooting =
            hasTroubleshootingIntent(message);

          const canEscalateNow = shouldEscalateToSupport(message, safeHistory);

          if (canEscalateNow) {
            supportAction = "ticket";
            if (!replyContent) {
              replyContent =
                "I see those troubleshooting steps didn't resolve the issue. I can help you open a support ticket directly from this chat. Please click 'Open Support Ticket Inline' below or provide your Name, Email, Subject, and a brief description to proceed.";
            }
          } else if (inferredGuide) {
            guideSlug = inferredGuide;
            if (!replyContent) {
              replyContent =
                "Let's try a guided fix first. Open this troubleshooting guide and tell me what happens at each step.";
            }
          } else if (shouldOfferInlineTroubleshooting) {
            if (!replyContent) {
              replyContent = buildInlineTroubleshootingSteps(message);
            }
          } else if (asksExpert) {
            bookStore = "Expert Support";
          } else if (wantsHuman) {
            supportAction = "contact";
          }

          if (!supportAction && !bookStore && !guideSlug) {
            // 4. Generic Product keywords
            const productKeywords = [
              "laptop",
              "pc",
              "router",
              "switch",
              "networking",
              "server",
              "printer",
              "phone",
              "monitor",
              "storage",
              "audio",
              "accessory",
            ];
            const intentSignals = [
              "here are",
              "options",
              "recommend",
              "look at",
              "check out",
              "available",
              "find",
              "budget",
              "ghs",
              "cost",
            ];

            const hasProduct = productKeywords.some(
              (k) => lowerMessage.includes(k) || lowerReply.includes(k),
            );
            const hasIntent = intentSignals.some(
              (s) => lowerReply.includes(s) || lowerMessage.includes(s),
            );

            if (hasProduct || hasIntent) {
              const found = productKeywords.filter(
                (k) => lowerMessage.includes(k) || lowerReply.includes(k),
              );
              const query = found[0] || "featured";
              queryMatch = ["", query] as RegExpMatchArray;
            }
          }
        }
      }
    }

    const hasRecommendationIntent = Boolean(queryMatch);

    if (queryMatch) {
      const query = queryMatch[1].trim();
      recommendedProducts = await fetchRecommendedProducts(
        query,
        budgetCap || undefined,
      );
      // Clean up the reply content
      replyContent = replyContent
        .replace(/\[(?:RECOMMEND|QUERY|SEARCH):\s*.*?\]/gi, "")
        .trim();
    }

    if (
      hasRecommendationIntent &&
      budgetCap &&
      recommendedProducts.length === 0
    ) {
      replyContent = `I could not find products at or below ${formatGhs(budgetCap)} right now. If you share a higher budget or another category, I can refine the shortlist.`;
    }

    // Direct background DB status checks for live tracking inquiries
    if (trackOrder) {
      try {
        const orderResult = await dbQuery(
          `SELECT status, total, "createdAt" FROM orders WHERE id = $1 OR replace(lower(id), '-', '') LIKE $1 || '%' LIMIT 1`,
          [trackOrder.toLowerCase()]
        );
        const order = orderResult.rows[0];
        if (order) {
          const statusText = order.status.toUpperCase();
          const orderDate = new Date(order.createdAt).toLocaleDateString("en-GH");
          replyContent = `Found order #${trackOrder.slice(0, 8)}. Status: **${statusText}** (Created: ${orderDate}). Here are your tracking details:`;
        } else {
          replyContent = `I searched our system but could not find an order matching identifier **#${trackOrder}**. Please verify your order ID.`;
        }
      } catch (e) {
        replyContent = "Here is the status of your order:";
      }
    }

    if (trackTicket) {
      try {
        const ticketResult = await dbQuery(
          `SELECT status, subject, "createdAt" FROM tickets WHERE id = $1 OR ticket_no = $2 LIMIT 1`,
          [trackTicket, /^\d+$/.test(trackTicket) ? parseInt(trackTicket, 10) : -1]
        );
        const ticket = ticketResult.rows[0];
        if (ticket) {
          const statusText = ticket.status.toUpperCase();
          const ticketDate = new Date(ticket.createdAt).toLocaleDateString("en-GH");
          replyContent = `Found ticket #${trackTicket}. Subject: **"${ticket.subject}"** | Status: **${statusText}** (Opened: ${ticketDate}). Here is the live ticket card:`;
        } else {
          replyContent = `I searched our records but could not find a ticket matching **#${trackTicket}**. Please check the ticket number.`;
        }
      } catch (e) {
        replyContent = "Here is the status of your support ticket:";
      }
    }

    if (bookDirect) {
      try {
        const { name, email, phone, service, date, time, message: bookMsg } = bookDirect;
        if (name && email && service && date && time) {
          const id = uuidv4();
          await dbQuery(
            `INSERT INTO consultations (id, name, email, phone, service, date, time, message, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')`,
            [id, name, email, phone || null, service, date, time, bookMsg || "Booked via AI Chat Assistant"]
          );
          
          await logActivity(null, "Consultation Requested", "info", `New consultation for ${service} from ${name} (via AI Chat)`);
          
          const formattedDate = new Date(date).toLocaleDateString("en-GH", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          replyContent = `I have scheduled your consultation for **${service}** on **${formattedDate}** at **${time}**. We look forward to speaking with you, ${name}!`;
          
          // Re-assign bookDirect to contain the resolved info for frontend rendering
          bookDirect = {
            id,
            name,
            email,
            phone,
            service,
            date,
            time,
            status: "pending"
          };
        } else {
          replyContent = "I wanted to book a consultation for you, but some details (name, email, service, date, or time) were missing.";
          bookDirect = undefined;
        }
      } catch (error) {
        console.error("Direct booking failed:", error);
        replyContent = "I encountered an issue while scheduling your consultation. Please try again or visit our booking page.";
        bookDirect = undefined;
      }
    }

    if (ticketDirect) {
      try {
        const { name, email, phone, subject, message: ticketMsg, priority, category } = ticketDirect;
        if (name && email && subject && ticketMsg) {
          const id = uuidv4();
          
          // Retrieve next ticket number safely
          const numResult = await dbQuery("SELECT COALESCE(MAX(ticket_no), 1000) + 1 AS next_no FROM tickets");
          const nextTicketNo = numResult.rows[0]?.next_no || 1001;

          // Resolve userId from session
          let finalUserId = null;
          const userSession = await getUserFromSession();
          if (userSession) {
            finalUserId = userSession.id;
          }

          await dbQuery(
            `INSERT INTO tickets (
              id, ticket_no, name, email, phone, subject, message, category, priority, status, "userId", "createdAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open', $10, NOW())`,
            [
              id,
              nextTicketNo,
              name,
              email,
              phone || null,
              subject,
              ticketMsg,
              category || "General",
              priority || "medium",
              finalUserId
            ]
          );

          await logActivity(null, "Support Ticket Created", "info", `New support ticket #${nextTicketNo} created from ${name} (via AI Chat)`);
          
          replyContent = `I have successfully opened support ticket **#${nextTicketNo}** for you. Our technicians have been notified and will contact you via email at **${email}** shortly.`;
          
          ticketDirect = {
            id,
            ticket_no: nextTicketNo,
            name,
            email,
            phone,
            subject,
            message: ticketMsg,
            category: category || "General",
            priority: priority || "medium",
            status: "open"
          };
        } else {
          replyContent = "I wanted to create a support ticket for you, but some details (name, email, subject, or message) were missing.";
          ticketDirect = undefined;
        }
      } catch (error) {
        console.error("Direct ticketing failed:", error);
        replyContent = "I encountered an issue while creating your support ticket. Please try again or visit our support page to submit a ticket.";
        ticketDirect = undefined;
      }
    }

    if (!replyContent) {
      if (recommendedProducts.length > 0) {
        replyContent = "Here are the best matches I found for you:";
      } else if (guideSlug) {
        replyContent =
          "Start with this troubleshooting guide, then tell me exactly where you get stuck so I can help further.";
      } else if (trackOrder) {
        replyContent = "Here is your latest order status:";
      } else if (trackTicket) {
        replyContent = "Here is your latest ticket status:";
      } else if (supportAction === "ticket") {
        replyContent =
          "I can help you open a support ticket directly from this chat. Please click 'Open Support Ticket Inline' below or provide your Name, Email, Subject, and a brief description to get started.";
      } else if (supportAction === "contact") {
        replyContent = "I can connect you with our support team.";
      } else if (bookStore) {
        replyContent = "You can schedule a consultation from here.";
      } else {
        replyContent =
          "Tell me what you need and your budget (GHS), and I will recommend the best fit.";
      }
    }

    // FINAL GUARDRAIL: Force brevity but allow more helpfulness
    const wordCount = replyContent.split(/\s+/).length;
    if (recommendedProducts.length > 0 && wordCount > 30) {
      replyContent = "I've found these recommendations for you:";
    } else if (wordCount > 50) {
      replyContent = replyContent.split(/\s+/).slice(0, 40).join(" ") + "...";
    }

    // GOD TIER: AI Analytics Logging
    try {
      const intent = cartProduct
        ? "cart_add"
        : trackOrder
          ? "track_order"
          : trackTicket
            ? "track_ticket"
            : bookStore
              ? "book_consult"
              : guideSlug
                ? "view_guide"
                : recommendedProducts.length > 0
                  ? "product_recommend"
                  : "casual";

      // Fire and forget (don't await to avoid delaying response)
      fetch(`${BACKEND_URL}/api/analytics/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Protection": "1",
        },
        body: JSON.stringify({
          query: message,
          response: replyContent,
          intent,
          recommendedProducts: recommendedProducts.map((p) => p.id),
          hasImage: !!imageData,
        }),
      }).catch((e) => console.error("Analytics log failed:", e));
    } catch (e) {
      console.error("Analytics preparation failed:", e);
    }

    return NextResponse.json({
      id: crypto.randomUUID(),
      role: "assistant",
      content: replyContent,
      recommendedProducts,
      supportAction,
      guideSlug,
      cartProduct,
      trackOrder,
      trackTicket,
      bookStore,
      bookDirect,
      ticketDirect,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I can still help you shortlist the right options. Tell me your use case and budget in Ghana cedis (GHS), and I will guide you to the best fit.",
      },
      { status: 200 },
    );
  }
}
