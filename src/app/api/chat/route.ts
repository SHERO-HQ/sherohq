import { NextResponse } from "next/server";
import type { Product } from "@/types/product";
import { CATALOG_SUMMARY, SUPPORT_KNOWLEDGE } from "./knowledge";

/** Resolve the internal backend URL (server-side only) */
const BACKEND_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000"
).replace(/\/$/, "");

async function fetchDynamicCatalogSummary(): Promise<string> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/products`);
    if (!res.ok) return CATALOG_SUMMARY; // Fallback
    const products: Product[] = await res.json();
    
    // Group by category and pick top items
    const summary = products.slice(0, 10).map(p => 
      `- ${p.name} (GHS ${p.price}) ID: ${p.id}`
    ).join("\n");

    return summary || CATALOG_SUMMARY;
  } catch (error) {
    console.error("Failed to fetch dynamic catalog:", error);
    return CATALOG_SUMMARY;
  }
}

function getSystemPrompt(catalog: string) {
  return `DIRECT DISPATCHER (SHERO TECH). 
RULE 1: Be EXTREMELY BRIEF (Under 20 words). No pleasantries.
RULE 2: Your GOAL is to trigger a TAG ([RECOMMEND], [BOOK], [CART], [TICKET]) as fast as possible.
RULE 3: If a user mentions a product category or need, immediately output [RECOMMEND: "query"].
RULE 4: If a user is frustrated, angry, or has a technical fault, immediately output [TICKET].
RULE 5: If a user mentions "meeting", "call", "consult", or "expert", output [BOOK: "Consultation"].
RULE 6: Use [CART: "Name"] only if they explicitly say "buy", "add to cart", or "order".
RULE 7: If the user message is vague, ask ONLY one clarifying question (e.g., "GHS budget?").

KNOWLEDGE:
${catalog}
${SUPPORT_KNOWLEDGE}

EXAMPLES:
User: "I need a fast laptop for coding" -> "I recommend these high-performance options for developers: [RECOMMEND: coding laptop]"
User: "My windows is corrupted" -> "I'm sorry to hear that. Please open a support ticket for technical repair. [TICKET]"
User: "Can we talk about a server setup?" -> "I've scheduled a professional consultation for your infrastructure needs. [BOOK: Server Infrastructure]"`;
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
  const hasBudgetSignal =
    normalized.includes("ghs") ||
    normalized.includes("cedi") ||
    normalized.includes("budget") ||
    /^\s*\d[\d,]*(?:\.\d+)?\s*$/.test(normalized);

  if (!hasBudgetSignal) return null;

  const match = normalized.match(/(\d[\d,]*(?:\.\d+)?)/);
  if (!match) return null;

  const parsed = Number(match[1].replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatGhs(amount: number): string {
  return `GHS ${amount.toLocaleString("en-GH")}`;
}

async function fetchRecommendedProducts(query: string) {
  try {
    console.log(`🔍 AI Fetching products for: "${query}" using ${BACKEND_URL}`);

    // Empty or generic query: return featured products
    if (!query || query === "latest products" || query === "featured") {
      const response = await fetch(`${BACKEND_URL}/api/products`);
      if (response.ok) {
        const prod = await response.json();
        return Array.isArray(prod) ? prod.slice(0, 3) : [];
      }
      return [];
    }

    // Attempt 1: Search match
    const response = await fetch(
      `${BACKEND_URL}/api/products?search=${encodeURIComponent(query)}`,
    );
    if (!response.ok) return [];
    let products = await response.json();
    
    // Attempt 2: Category fallback if search returns nothing
    if (!Array.isArray(products) || products.length === 0) {
      console.log(`⚠️ No search matches for "${query}". Trying category fetch...`);
      const catResponse = await fetch(
        `${BACKEND_URL}/api/products?category=${encodeURIComponent(query)}`,
      );
      if (catResponse.ok) {
        products = await catResponse.json();
      }
    }

    return Array.isArray(products) ? products.slice(0, 3) : [];
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    return [];
  }
}

function buildFallbackReply(
  userMessage: string,
  history: ChatHistoryMessage[] = [],
): string {
  const normalized = userMessage.toLowerCase();
  
  // 1. Repetition Guard: If the user is repeating the exact same thing or getting stuck in a loop
  const userHistory = history.filter(m => m.role === "user");
  const isRepeating = userHistory.length > 0 && userHistory[userHistory.length - 1].content.toLowerCase() === normalized;
  
  if (isRepeating) {
    return "I notice we're repeating. To get you the best help quickly, I recommend speaking with an expert or opening a ticket. [TICKET] [BOOK: Personal Support]";
  }

  // 2. Intent-based hardcoding (Smarter triggers)
  if (normalized.includes("book") || normalized.includes("consultation") || normalized.includes("call") || normalized.includes("meeting") || normalized.includes("talk to someone")) {
    return "I've flagged this for a professional consultation. You can schedule a time here: [BOOK: Enterprise IT Consultation]";
  }

  const supportKeywords = ["crash", "broken", "os", "boot", "error", "problem", "issue", "failing", "slow", "help", "trouble", "don't work", "repair"];
  if (supportKeywords.some(k => normalized.includes(k))) {
    return "Technical issues are best handled via our direct support channel. Please open a ticket: [TICKET]";
  }

  // 3. Product Discovery Fallback
  const laptopKeywords = ["laptop", "pc", "computer", "macbook", "hp", "dell"];
  if (laptopKeywords.some(k => normalized.includes(k))) {
    const budget = extractBudgetGhs(userMessage);
    if (budget && budget < 6000) return `I recommend these entry-level laptops within your ${formatGhs(budget)} budget: [RECOMMEND: student laptop]`;
    if (budget) return `I've found some premium options for your ${formatGhs(budget)} budget: [RECOMMEND: laptop]`;
    return "I can help you browse our current laptop inventory: [RECOMMEND: laptop]";
  }

  const networkKeywords = ["network", "router", "switch", "wifi", "internet"];
  if (networkKeywords.some(k => normalized.includes(k))) {
    return "Check out our networking hardware including routers and switches: [RECOMMEND: router switch]";
  }

  // 4. Budget-only check
  const budgetOnly = extractBudgetGhs(userMessage);
  if (budgetOnly) {
    return `Noted budget: ${formatGhs(budgetOnly)}. What specifically are you looking for? (Laptops, Networking, or Repair)`;
  }

  // 5. Generic catch-all with variety based on history length
  if (history.length > 4) {
    return "I want to make sure you get the right answer. Would you like to browse our latest laptops [RECOMMEND: laptops] or talk to a consultant? [BOOK: IT Support]";
  }

  return "I can help you find hardware or IT services. What's your need and budget (GHS)? [RECOMMEND: laptops]";
}

export async function POST(request: Request) {
  try {
    const { message, history, imageData, audioData } = await request.json();
    const catalogSummary = await fetchDynamicCatalogSummary();

    let replyContent = "";

    if (!process.env.GEMINI_API_KEY) {
      replyContent = buildFallbackReply(message, history);
    } else {
      // Gemini uses "user" and "model" roles for conversational turns.
      const contents = history.map((msg: { role: string; content: string; imageData?: string }) => {
        const parts: any[] = [{ text: msg.content }];
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
      });

      const currentParts: any[] = [{ text: message }];
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
          // Non-retriable provider failure; stop trying additional models.
          break;
        }
      }

      if (response) {
        const data = await response.json();
        replyContent =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "I'm sorry, I couldn't generate a response.";
      } else {
        console.error("Chat API provider error: no successful model", lastError);
        replyContent = buildFallbackReply(message, history);
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

    // Detect new Elite tags
    const cartMatch = replyContent.match(/\[CART:\s*["']?(.*?)["']?\]/i);
    if (cartMatch) {
      cartProduct = cartMatch[1].trim();
      replyContent = replyContent.replace(/\[CART:.*?\]/gi, "").trim();
    }

    const orderMatch = replyContent.match(/\[TRACK_ORDER:\s*(.*?)\]/i);
    if (orderMatch) {
      trackOrder = orderMatch[1].trim();
      replyContent = replyContent.replace(/\[TRACK_ORDER:.*?\]/gi, "").trim();
    }

    const ticketTrackMatch = replyContent.match(/\[TRACK_TICKET:\s*(.*?)\]/i);
    if (ticketTrackMatch) {
      trackTicket = ticketTrackMatch[1].trim();
      replyContent = replyContent.replace(/\[TRACK_TICKET:.*?\]/gi, "").trim();
    }

    const bookMatch = replyContent.match(/\[BOOK:\s*(.*?)\]/i);
    if (bookMatch) {
      bookStore = bookMatch[1].trim();
      replyContent = replyContent.replace(/\[BOOK:.*?\]/gi, "").trim();
    }

    // Detect [GUIDE: slug] tags
    const guideMatch = replyContent.match(/\[GUIDE:\s*(.*?)\]/i);
    if (guideMatch) {
      guideSlug = guideMatch[1].trim();
      replyContent = replyContent.replace(/\[GUIDE:\s*.*?\]/gi, "").trim();
    }

    // Detect [TICKET] or [CONTACT] tags
    if (replyContent.includes("[TICKET]")) {
      supportAction = "ticket";
      replyContent = replyContent.replace("[TICKET]", "").trim();
    } else if (replyContent.includes("[CONTACT]")) {
      supportAction = "contact";
      replyContent = replyContent.replace("[CONTACT]", "").trim();
    }

    let queryMatch = replyContent.match(/\[(?:RECOMMEND|QUERY|SEARCH):\s*(.*?)\]/i);
    
    // Fallback: If AI forgot the tag or didn't trigger
    if (!queryMatch && !supportAction && !guideSlug) {
      const lowerReply = replyContent.toLowerCase();
      const lowerMessage = message.toLowerCase();
      
      // 1. Check for specific product names from current catalog summary
      const catalogNames = catalogSummary.split("\n")
        .filter(line => line.includes("("))
        .map(line => {
          const match = line.match(/^\s*-\s*(.*?)\s*\(/);
          return match ? match[1].trim() : null;
        })
        .filter(Boolean) as string[];

      let mentionedProduct = catalogNames.find(name => 
        lowerReply.includes(name.toLowerCase()) || 
        lowerMessage.includes(name.toLowerCase())
      );

      // 2. If nothing found in current turn, scan history
      if (!mentionedProduct && history.length > 0) {
        for (let i = history.length - 1; i >= 0; i--) {
          const histContent = history[i].content.toLowerCase();
          const found = catalogNames.find(name => histContent.includes(name.toLowerCase()));
          if (found) {
            mentionedProduct = found;
            break;
          }
        }
      }
      
      if (mentionedProduct) {
        queryMatch = [null, mentionedProduct] as any;
      } else {
        // 2. Escalation Detection
        const escalationKeywords = ["human", "ticket", "expert", "didn't work", "still broken", "nothing works", "help me", "representative"];
        const isEscalation = escalationKeywords.some(k => lowerMessage.includes(k));

        if (isEscalation) {
          supportAction = "ticket";
        }

        if (!supportAction) {
          // 3. Generic Product keywords
          const productKeywords = ["laptop", "pc", "router", "switch", "networking", "server", "printer", "phone", "monitor", "storage", "audio", "accessory"];
          const intentSignals = ["here are", "options", "recommend", "look at", "check out", "available", "find", "budget", "ghs", "cost"];
          
          const hasProduct = productKeywords.some(k => lowerMessage.includes(k) || lowerReply.includes(k));
          const hasIntent = intentSignals.some(s => lowerReply.includes(s) || lowerMessage.includes(s));

          if (hasProduct || hasIntent) {
            const found = productKeywords.filter(k => lowerMessage.includes(k) || lowerReply.includes(k));
            const query = found[0] || "featured";
            queryMatch = [null, query] as any;
          }
        }
      }
    }

    if (queryMatch) {
      const query = queryMatch[1].trim();
      recommendedProducts = await fetchRecommendedProducts(query);
      // Clean up the reply content
      replyContent = replyContent.replace(/\[(?:RECOMMEND|QUERY|SEARCH):\s*.*?\]/gi, "").trim();
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
      const intent = cartProduct ? "cart_add" : 
                    trackOrder ? "track_order" : 
                    trackTicket ? "track_ticket" : 
                    bookStore ? "book_consult" : 
                    guideSlug ? "view_guide" : 
                    recommendedProducts.length > 0 ? "product_recommend" : "casual";

      // Fire and forget (don't await to avoid delaying response)
      fetch(`${BACKEND_URL}/api/analytics/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Protection": "1"
        },
        body: JSON.stringify({
          query: message,
          response: replyContent,
          intent,
          recommendedProducts: recommendedProducts.map(p => p.id),
          hasImage: !!imageData
        }),
      }).catch(e => console.error("Analytics log failed:", e));
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
