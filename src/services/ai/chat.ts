/**
 * AI Chat Service
 *
 * This bridges custom LLMs (e.g., GPT-4) with the SHERO product and service catalog.
 */

import type { Product } from "@/types/product";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  recommendedProducts?: Product[];
  recommendedServices?: string[];
  supportAction?: "ticket" | "contact";
  guideSlug?: string;
  cartProduct?: string;
  trackOrder?: string;
  trackTicket?: string;
  bookStore?: string;
  bookDirect?: any;
  ticketDirect?: any;
  imageData?: string;
  audioData?: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  context?: {
    currentPath?: string;
    cartItemIds?: string[];
  };
  imageData?: string;
  audioData?: string;
}

export async function sendChatMessage(
  request: ChatRequest,
): Promise<ChatMessage> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    return await response.json() as ChatMessage;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("AI Service Error:", error);
    }
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "I'm having trouble reaching the server right now. To make me active, ensure you have an GEMINI_API_KEY set in your .env.local file.",
    };
  }
}
