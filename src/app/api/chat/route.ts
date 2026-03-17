import { NextResponse } from "next/server";
import type { Product } from "@/types/product";
import { CATALOG_SUMMARY, SUPPORT_KNOWLEDGE } from "./knowledge";

async function fetchDynamicCatalogSummary(): Promise<string> {
  try {
    const res = await fetch("http://localhost:5000/api/products");
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
  return `HELPFUL SHERO EXPERT.
RULE 1: Response must be UNDER 40 WORDS. Be helpful, graceful, and natural.
RULE 2: MUST USE [RECOMMEND: "Product Name"] for links if suggesting specific products.
RULE 3: USE [CART: "Product Name"] if user wants to buy or add to cart.
RULE 4: USE [TRACK_ORDER: id] or [TRACK_TICKET: id] for status queries.
RULE 5: USE [BOOK: service] to offer professional consultation for complex needs. (Link: /consultation)
RULE 6: Suggest [GUIDE: slug] if there's a specific technical guide that matches. If not, give general helpful advice.
RULE 7: ESCALATION: If the user is frustrated or needs direct help, suggest opening a ticket with [TICKET]. (Link: /support)
RULE 8: If the user provides AUDIO or IMAGE, analyze it carefully to provide technical feedback or product matches.
RULE 9: FLEXIBLE INTELLIGENCE: You are a tech expert. Feel free to give general hardware/software advice even if it's not explicitly in your knowledge base files or from our support page.
RULE 10: DO NOT say "I cannot help with that because it is not on our support page". Always make a helpful suggestion based on your general knowledge.

KNOWLEDGE BASE:
${catalog}
${SUPPORT_KNOWLEDGE}

EXAMPLES:
User: "I want to buy the Elitebook" -> "Great choice! I've added the HP Elitebook 840 G6 to your cart. [CART: HP Elitebook 840 G6]"
User: "How do I fix my screen?" -> "I'm sorry to hear that! You can try a hard reset first. If that fails, check our [GUIDE: troubleshooting-power] or open a [TICKET] on the support page."
User: "Need a pro call" -> "I can schedule a professional consultation for you to discuss this in detail. [BOOK: Enterprise Consultation]"`;
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
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
    console.log(`🔍 AI Fetching products for: "${query}" using ${apiUrl}`);

    // Empty or generic query: return featured products
    if (!query || query === "latest products" || query === "featured") {
      const response = await fetch(`${apiUrl}/api/products`);
      if (response.ok) {
        const prod = await response.json();
        return Array.isArray(prod) ? prod.slice(0, 3) : [];
      }
      return [];
    }

    // Attempt 1: Search match
    const response = await fetch(
      `${apiUrl}/api/products?search=${encodeURIComponent(query)}`,
    );
    if (!response.ok) return [];
    let products = await response.json();
    
    // Attempt 2: Category fallback if search returns nothing
    if (!Array.isArray(products) || products.length === 0) {
      console.log(`⚠️ No search matches for "${query}". Trying category fetch...`);
      const catResponse = await fetch(
        `${apiUrl}/api/products?category=${encodeURIComponent(query)}`,
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
  const budget = extractBudgetGhs(userMessage);
  const hasTimeline =
    normalized.includes("today") ||
    normalized.includes("tomorrow") ||
    normalized.includes("week") ||
    normalized.includes("month") ||
    normalized.includes("asap") ||
    normalized.includes("urgent") ||
    normalized.includes("immediately");
  const lastAssistantMessage = [...history]
    .reverse()
    .find((msg) => msg.role === "assistant")
    ?.content.toLowerCase();

  const discussingLaptop =
    normalized.includes("laptop") || normalized.includes("pc");
  const discussingNetwork =
    normalized.includes("network") ||
    normalized.includes("router") ||
    normalized.includes("switch");
  const discussingCloud =
    normalized.includes("cloud") ||
    normalized.includes("migration") ||
    normalized.includes("server");

  // Budget-only follow-up: move the conversation forward instead of repeating.
  if (budget && !discussingLaptop && !discussingNetwork && !discussingCloud) {
    return `Great, noted budget around ${formatGhs(budget)}. To recommend the best fit, tell me which option you need: laptops for a team, networking equipment, or cloud/server support.`;
  }

  if (discussingLaptop) {
    if (budget) {
      if (budget < 5000) {
        return `I've found some reliable student laptops within your ${formatGhs(budget)} budget. [RECOMMEND: student laptop budget 4500 GHS]`;
      }

      if (budget <= 10000) {
        return `Here are some mid-range laptops around ${formatGhs(budget)} suitable for your needs. [RECOMMEND: laptop 8000 GHS]`;
      }

      return `I've shortlisted some high-performance laptops for your ${formatGhs(budget)} budget. [RECOMMEND: high performance laptop]`;
    }

    return "I can help you find a laptop. Here are some of our currently available models. [RECOMMEND: laptop]";
  }

  if (discussingNetwork) {
    if (budget) {
      return `Here is some networking gear for your ${formatGhs(budget)} budget. [RECOMMEND: router switch budget ${budget}]`;
    }

    return "I can help with networking equipment. Here is a look at our current inventory. [RECOMMEND: router switch]";
  }

  if (discussingCloud) {
    return "I can assisted with cloud solutions and infrastructure. Tell me your top goal, and I'll propose a next step.";
  }

  if (normalized.includes("book") || normalized.includes("consultation") || normalized.includes("call")) {
    return "I can schedule a professional consultation for you to discuss your IT needs in detail. [BOOK: Enterprise Consultation]";
  }

  const supportKeywords = ["crash", "broken", "os", "boot", "error", "problem", "issue", "failing", "slow", "help", "trouble"];
  if (supportKeywords.some(k => normalized.includes(k))) {
    return "I'm sorry to hear that. For technical issues like crashes or errors, please create a support ticket so our team can help you immediately. [TICKET]";
  }

  return "I can help you find any product or IT service on SHERO. Tell me what you need and your budget (GHS). [RECOMMEND: laptops]";
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
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/analytics/chat`, {
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
