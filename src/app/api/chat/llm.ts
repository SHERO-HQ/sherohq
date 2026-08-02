/**
 * LLM Module
 * 
 * Handles Gemini API calls with model fallback, system prompt
 * construction, response parsing, and streaming.
 */

import { SUPPORT_KNOWLEDGE } from "./knowledge";

// ---------------------------------------------------------------------------
// Model configuration
// ---------------------------------------------------------------------------

const GEMINI_MODEL_CANDIDATES = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

export function getSystemPrompt(
  catalog: string, 
  context?: { currentPath?: string; cartItemIds?: string[]; user?: { id: string; name: string; email: string } | null },
  agentRoute: string = "general"
): string {
  let contextSection = "";
  if (context) {
    contextSection = "\nUSER CONTEXT\n";
    if (context.user) contextSection += `- Logged-in User: ${context.user.name} (${context.user.email})\n`;
    if (context.currentPath) contextSection += `- Current Page URL: ${context.currentPath}\n`;
    if (context.cartItemIds?.length) contextSection += `- Items in Cart (IDs): ${context.cartItemIds.join(", ")}\n`;
    else contextSection += `- Cart is currently empty.\n`;
  }

  let routeInstructions = "";
  if (agentRoute === "tech_support") {
    routeInstructions = `
ROLE: TECH SUPPORT SPECIALIST
- Focus strictly on technical troubleshooting, diagnostics, and step-by-step resolution.
- Ask for error codes, operating system versions, and specific symptoms.
- Do NOT pitch sales or push new products unless the current product is completely unfixable.
- Maintain a highly technical, precise, and analytical tone.`;
  } else if (agentRoute === "sales") {
    routeInstructions = `
ROLE: SALES & SOLUTIONS EXPERT
- Focus on value propositions, maximizing budget, and highlighting SHERO's competitive edge.
- Compare options clearly and emphasize warranties and after-sales support.
- Encourage booking consultations or checking out.
- Maintain an enthusiastic, persuasive, and consultative tone.`;
  } else {
    routeInstructions = `
ROLE: GENERAL ASSISTANT
- Be helpful, friendly, and guide the user to the right resources.
- Answer general FAQs clearly and concisely.`;
  }

  return `You are **SHERO AI** — a knowledgeable, professional IT assistant for SHERO Technologies, a Ghana-based IT solutions and hardware company.

${routeInstructions}

PERSONALITY
- Warm, professional, and concise. You're a real expert, not a generic chatbot.
- Address users naturally. Use their name if given.
- Keep replies focused: 2-4 sentences for quick answers, more for detailed troubleshooting.
- Always reflect Ghana context: prices in GHS (Ghana Cedis), local delivery expectations, West African tech market.

CAPABILITIES
1. **Product Recommendations** — Help users find laptops, networking gear, accessories, and other IT hardware from SHERO's live inventory. Use the recommend_products tool to display product cards to the user.
2. **IT Troubleshooting** — Diagnose and help fix common hardware/software issues (slow laptops, boot failures, network problems, overheating, etc.). Provide step-by-step guidance before escalating. Use the open_guide tool to show a troubleshooting guide.
3. **General IT Knowledge** — Answer general tech questions (VPN setup, SSD vs HDD, best practices for cybersecurity, etc.) with practical advice. Stay professional — do not answer off-topic questions about politics, relationships, cooking, etc.
4. **Order Tracking** — Look up order status when user provides an order ID using the track_order tool.
5. **Support Tickets** — Create support tickets when troubleshooting fails or user requests help using the create_support_ticket tool.
6. **Consultation Booking** — Schedule expert consultations for Managed IT, Custom Software, Cyber Security, or other services using the book_consultation tool.

RULES
- Be a polite and conversational IT assistant.
- ONLY call tools when the user explicitly requests something that requires a tool.
- If the user makes small talk or asks an off-topic question (like "I am not feeling well"), acknowledge it briefly, explicitly state that you are an IT assistant and can only help with tech-related issues, and ask how you can help them with technology today. Do not offer unrelated services.
- For product questions, ALWAYS call recommend_products so the frontend renders product cards. Don't just describe products in text.
- If the user explicitly asks to track an order but doesn't give an ID, reply asking for the ID. Do not call the track_order tool until you have the ID.
- For booking: ask for name, email, date, time, and service type if missing.
- For tickets: ask for name, email, subject, and description if missing.
- When troubleshooting: try at least one round of guided steps before suggesting a support ticket.

INVENTORY DATA
${catalog}

SUPPORT GUIDES
${SUPPORT_KNOWLEDGE}

COMPANY INFO
- SHERO Technologies — Based in Accra, Ghana
- Business hours: Mon-Fri 9AM-6PM, Sat 10AM-3PM (GMT)
- Delivery: Accra same-day/next-day, other regions 2-5 business days
- Warranty: All products come with minimum 3-month warranty
- Returns: 7-day return policy for defective items
- Contact: support@sherohq.com | WhatsApp: available on the website${contextSection}`;
}

export async function categorizeIntent(message: string, history: Array<{ role: string; content: string }> = []): Promise<"tech_support" | "sales" | "general"> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !message) return "general";
  
  const recentHistory = history.slice(-3).map(h => `${h.role.toUpperCase()}: ${h.content}`).join("\n");
  const textPrompt = `Categorize the User Message into exactly one of these three categories: "tech_support", "sales", or "general". Return ONLY the category string.\n\nRecent History (for context):\n${recentHistory}\n\nUser Message: "${message}"`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            role: "user", 
            parts: [{ text: textPrompt }] 
          }],
          generationConfig: { temperature: 0.1 }
        })
      }
    );
    if (response.ok) {
      const data = await response.json();
      const category = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();
      if (category === "tech_support" || category === "sales") return category as any;
    }
  } catch (e) {
    console.error("Intent categorization failed", e);
  }
  return "general";
}

export async function summarizeChatHistory(history: Array<{ role: string; content: string }>): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || history.length === 0) return "";

  const textToSummarize = history.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n");
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `Summarize the following chat history briefly so an AI assistant can remember the context of the conversation. Focus on extracting key facts, user preferences (e.g., budget, preferred brands), and any unresolved issues:\n\n${textToSummarize}` }] }],
          generationConfig: { temperature: 0.3 }
        })
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
  } catch (e) {
    console.error("Summarization failed", e);
  }
  return "";
}

// ---------------------------------------------------------------------------
// Gemini Function Declarations (Tools)
// ---------------------------------------------------------------------------

export const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "recommend_products",
        description: "Recommend products from the catalog. ONLY call this when the user explicitly asks to buy, browse, or compare products. DO NOT call this if the user is asking for support, order tracking, or general help.",
        parameters: {
          type: "OBJECT",
          properties: {
            query: { type: "STRING", description: "Search query for products (e.g. laptop, router, hp, budget laptop)" },
            budget_ghs: { type: "NUMBER", description: "Maximum budget in Ghana Cedis (GHS)" },
          },
          required: ["query"],
        },
      },
      {
        name: "track_order",
        description: "Look up an order's status. ONLY call this if the user has provided an order ID.",
        parameters: {
          type: "OBJECT",
          properties: {
            order_id: { type: "STRING", description: "The order ID to track" },
          },
          required: ["order_id"],
        },
      },
      {
        name: "track_ticket",
        description: "Look up a support ticket's status. ONLY call this if the user has provided a ticket ID.",
        parameters: {
          type: "OBJECT",
          properties: {
            ticket_id: { type: "STRING", description: "The ticket ID or ticket number to track" },
          },
          required: ["ticket_id"],
        },
      },
      {
        name: "book_consultation",
        description: "Schedule an expert consultation. Use this ONLY when the user has provided all details.",
        parameters: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", description: "User's full name" },
            email: { type: "STRING", description: "User's email address" },
            phone: { type: "STRING", description: "User's phone number (optional)" },
            service: { type: "STRING", description: "Type of service (e.g. Managed IT, Custom Software)" },
            date: { type: "STRING", description: "Date for the consultation in YYYY-MM-DD format" },
            time: { type: "STRING", description: "Time for the consultation (e.g. 10:00 AM)" },
            message: { type: "STRING", description: "Brief message or reason for consultation" },
          },
          required: ["name", "email", "service", "date", "time"],
        },
      },
      {
        name: "create_support_ticket",
        description: "Create a support ticket for the user. Use this ONLY when the user has provided all details.",
        parameters: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", description: "User's name" },
            email: { type: "STRING", description: "User's email address" },
            phone: { type: "STRING", description: "User's phone number (optional)" },
            subject: { type: "STRING", description: "Subject of the ticket" },
            message: { type: "STRING", description: "Detailed description of the issue" },
            priority: { type: "STRING", description: "Priority level (low, medium, high, urgent)" },
            category: { type: "STRING", description: "Category of the issue" },
          },
          required: ["name", "email", "subject", "message"],
        },
      },
      {
        name: "open_guide",
        description: "Suggest a troubleshooting guide to the user.",
        parameters: {
          type: "OBJECT",
          properties: {
            slug: { type: "STRING", description: "The slug of the guide (e.g. setup-shero-laptop, software-installation-guide, troubleshooting-power)" },
          },
          required: ["slug"],
        },
      },
      {
        name: "add_to_cart",
        description: "Add a specific product to the user's cart. Use ONLY when they explicitly ask to add/buy an item.",
        parameters: {
          type: "OBJECT",
          properties: {
            product_name: { type: "STRING", description: "The name of the product to add" },
          },
          required: ["product_name"],
        },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Build Gemini contents from chat history + current message
// ---------------------------------------------------------------------------

type ContentPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { functionCall: any }
  | { functionResponse: { name: string; response: any } };

type GeminiContent = {
  role: string;
  parts: ContentPart[];
};

export function buildGeminiContents(
  history: Array<{ role: string; content: string; imageData?: string; audioData?: string }>,
  message: string,
  imageData?: string,
  audioData?: string,
): GeminiContent[] {
  const contents: GeminiContent[] = history.map((msg) => {
    const parts: ContentPart[] = [{ text: msg.content }];
    if (msg.imageData) {
      const mimeType = msg.imageData.split(";")[0].split(":")[1];
      const data = msg.imageData.split(",")[1];
      parts.push({
        inlineData: { mimeType, data },
      });
    }
    return {
      role: msg.role === "assistant" ? "model" : "user",
      parts,
    };
  });

  const currentParts: ContentPart[] = [{ text: message }];
  if (imageData) {
    const mimeType = imageData.split(";")[0].split(":")[1];
    const data = imageData.split(",")[1];
    currentParts.push({
      inlineData: { mimeType, data },
    });
  }

  if (audioData) {
    const mimeType = audioData.split(";")[0].split(":")[1];
    const data = audioData.split(",")[1];
    currentParts.push({
      inlineData: { mimeType, data },
    });
  }

  contents.push({ role: "user", parts: currentParts });

  return contents;
}

// ---------------------------------------------------------------------------
// Streaming LLM API Call
// ---------------------------------------------------------------------------

export async function callLLMStreaming(
  systemPrompt: string,
  contents: GeminiContent[],
): Promise<Response | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  for (const model of GEMINI_MODEL_CANDIDATES) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          tools: GEMINI_TOOLS,
          generationConfig: {
            temperature: 0.5,
          },
        }),
      },
    );

    if (response.ok) {
      return response;
    }
    
    // Only continue if the error is 404 (model not found) or similar
    if (response.status !== 404) {
      const errorText = await response.text();
      console.error("Gemini API Error for model", model, "Status:", response.status, "Error:", errorText);
      return null;
    }
  }

  return null;
}
