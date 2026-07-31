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
  "gemini-1.5-pro",
];

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

export function getSystemPrompt(catalog: string): string {
  return `You are **SHERO AI** — a knowledgeable, professional IT assistant for SHERO Technologies, a Ghana-based IT solutions and hardware company.

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
- For product questions, ALWAYS call recommend_products so the frontend renders product cards. Don't just describe products in text.
- Never recommend products above a stated budget.
- If the user asks to track something without an ID, ask for the ID first before calling tracking tools.
- For booking: ask for name, email, date (YYYY-MM-DD), time, and service type if not provided before calling book_consultation.
- For tickets: ask for name, email, subject, and description if not provided before calling create_support_ticket.
- When troubleshooting: try at least one round of guided steps before suggesting a support ticket.
- Stay on topic. If asked about non-IT topics, politely redirect: "I specialize in IT solutions — how can I help you with technology today?"

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
- Contact: support@sherohq.com | WhatsApp: available on the website`;
}

// ---------------------------------------------------------------------------
// Gemini Function Declarations (Tools)
// ---------------------------------------------------------------------------

export const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "recommend_products",
        description: "Recommend products from the catalog. Use this when the user is asking for product options, pricing, or comparisons. This displays product cards on the screen.",
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
        description: "Look up an order's status when the user provides an order ID.",
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
        description: "Look up a support ticket's status when the user provides a ticket ID or number.",
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
      return response;
    }
  }

  return null;
}
