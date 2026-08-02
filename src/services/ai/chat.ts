/**
 * AI Chat Service
 *
 * This bridges custom LLMs (e.g., GPT-4/Gemini) with the SHERO product and service catalog.
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
    sessionId?: string;
    user?: { id: string; name: string; email: string } | null;
  };
  imageData?: string;
  audioData?: string;
}

/**
 * Sends a chat message and processes the SSE stream response from the server.
 * @param request The chat request payload
 * @param onUpdate Callback fired when a new text chunk is received
 * @returns The final metadata object (containing products, actions, etc.)
 */
export async function sendChatMessageStreaming(
  request: ChatRequest,
  onUpdate: (chunk: string) => void,
): Promise<Partial<ChatMessage>> {
  try {
    const safeRequest = { ...request };
    if (safeRequest.message && safeRequest.message.length > 2000) {
      safeRequest.message = safeRequest.message.substring(0, 2000) + "... [truncated]";
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safeRequest),
    });

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);

    // If the response is not a stream (e.g. fallback json), handle it
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      if (data.content) {
        onUpdate(data.content);
      }
      return data;
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf8");
    let buffer = "";
    let metadata: Partial<ChatMessage> = {};

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6).trim();
          if (dataStr === "[DONE]") continue;

          try {
            const data = JSON.parse(dataStr);
            if (data.text) {
              onUpdate(data.text);
            }
            if (data.metadata) {
              metadata = data.metadata;
            }
          } catch {
            // ignore partial json
          }
        }
      }
    }

    return metadata;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("AI Service Error:", error);
    }
    const errorMsg = "I'm having trouble reaching the server right now. To make me active, ensure you have an GEMINI_API_KEY set in your .env.local file.";
    onUpdate(errorMsg);
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: errorMsg,
    };
  }
}
