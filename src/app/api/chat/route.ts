/**
 * AI Chat API Route
 *
 * Slim orchestrator that coordinates:
 *  1. Intent detection & budget parsing
 *  2. LLM call (Gemini) with dynamic catalog context
 *  3. Tool execution (function calling)
 *  4. Streaming SSE response
 */

import { NextResponse } from "next/server";
import { fetchDynamicCatalogSummary, fetchRecommendedProducts } from "./products";
import {
  type ChatHistoryMessage,
  resolveBudgetFromConversation,
  formatGhs,
  inferGuideSlug,
  shouldEscalateToSupport,
  hasTroubleshootingIntent,
  buildFallbackReply,
  buildInlineTroubleshootingSteps,
} from "./intent";
import { handleBookDirect, handleTicketDirect, handleTrackOrder, handleTrackTicket } from "./actions";
import { getSystemPrompt, callLLMStreaming, buildGeminiContents } from "./llm";

const BACKEND_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://api.sherohq.com"
    : "http://127.0.0.1:5000")
).replace(/\/$/, "");

export async function POST(request: Request) {
  try {
    const { message, history, imageData, audioData } = await request.json();
    const safeHistory: ChatHistoryMessage[] = Array.isArray(history) ? history : [];
    const budgetCap = resolveBudgetFromConversation(message, safeHistory);

    const catalogSummary = await fetchDynamicCatalogSummary(message);
    const systemPrompt = getSystemPrompt(catalogSummary);
    const contents = buildGeminiContents(safeHistory, message, imageData, audioData);

    const llmResponse = await callLLMStreaming(systemPrompt, contents);

    if (!llmResponse || !llmResponse.ok || !llmResponse.body) {
      // Fallback if no LLM
      return handleFallback(message, safeHistory);
    }

    // Prepare metadata
    const metadata: any = {
      id: crypto.randomUUID(),
      role: "assistant",
      recommendedProducts: [],
    };

    // We create a TransformStream to process the SSE from Gemini, handle function calls,
    // and stream text to the client.
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    const decoder = new TextDecoder("utf8");
    const encoder = new TextEncoder();

    // Fire and forget parsing
    const body = llmResponse.body;
    (async () => {
      try {
        const reader = body.getReader();
        let buffer = "";
        let finalContent = "";
        let functionCallReceived = false;

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
                const part = data?.candidates?.[0]?.content?.parts?.[0];

                if (part?.text) {
                  const text = part.text;
                  finalContent += text;
                  await writer.write(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                } else if (part?.functionCall) {
                  functionCallReceived = true;
                  const { name, args } = part.functionCall;
                  
                  // Handle function execution
                  if (name === "recommend_products") {
                    metadata.recommendQuery = args.query;
                    metadata.recommendedProducts = await fetchRecommendedProducts(args.query, args.budget_ghs || budgetCap || undefined);
                    if (metadata.recommendedProducts.length === 0 && budgetCap) {
                      const fallbackMsg = "I could not find products at or below " + formatGhs(budgetCap) + " right now. If you share a higher budget or another category, I can refine the shortlist.";
                      await writer.write(encoder.encode(`data: ${JSON.stringify({ text: fallbackMsg })}\n\n`));
                    }
                  } else if (name === "track_order") {
                    metadata.trackOrder = args.order_id;
                    const result = await handleTrackOrder(args.order_id);
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ text: result })}\n\n`));
                  } else if (name === "track_ticket") {
                    metadata.trackTicket = args.ticket_id;
                    const result = await handleTrackTicket(args.ticket_id);
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ text: result })}\n\n`));
                  } else if (name === "book_consultation") {
                    const result = await handleBookDirect(args);
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ text: result.reply })}\n\n`));
                    metadata.bookDirect = result.resolved;
                  } else if (name === "create_support_ticket") {
                    const result = await handleTicketDirect(args);
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ text: result.reply })}\n\n`));
                    metadata.ticketDirect = result.resolved;
                  } else if (name === "open_guide") {
                    metadata.guideSlug = args.slug;
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ text: "Here is the guide you requested:" })}\n\n`));
                  } else if (name === "add_to_cart") {
                    metadata.cartProduct = args.product_name;
                    const cartMsg = "I've added " + args.product_name + " to your cart.";
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ text: cartMsg })}\n\n`));
                  }
                }
              } catch (e) {
                // Ignore parsing errors for partial chunks
              }
            }
          }
        }

        // Send metadata payload
        await writer.write(encoder.encode(`data: ${JSON.stringify({ metadata })}\n\n`));
        await writer.write(encoder.encode("data: [DONE]\n\n"));
        await writer.close();

        // Fire and forget analytics
        logAnalytics(message, finalContent, metadata, !!imageData);
      } catch (err) {
        console.error("Streaming error:", err);
        await writer.abort(err);
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I can still help you shortlist the right options. Tell me your use case and budget in Ghana cedis (GHS), and I will guide you to the best fit.",
      },
      { status: 200 },
    );
  }
}

function logAnalytics(message: string, finalContent: string, metadata: any, hasImage: boolean) {
  try {
    const intent = metadata.cartProduct
      ? "cart_add"
      : metadata.trackOrder
        ? "track_order"
        : metadata.trackTicket
          ? "track_ticket"
          : metadata.bookDirect
            ? "book_consult"
            : metadata.guideSlug
              ? "view_guide"
              : metadata.recommendedProducts?.length > 0
                ? "product_recommend"
                : "casual";

    fetch(`${BACKEND_URL}/api/analytics/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Protection": "1",
      },
      body: JSON.stringify({
        query: message,
        response: finalContent || "Action executed",
        intent,
        recommendedProducts: metadata.recommendedProducts?.map((p: any) => p.id) || [],
        hasImage,
      }),
    }).catch(() => {});
  } catch (e) {}
}

function handleFallback(message: string, safeHistory: ChatHistoryMessage[]) {
  let replyContent = buildFallbackReply(message, safeHistory);
  let metadata: any = {
    id: crypto.randomUUID(),
    role: "assistant",
  };

  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("track") && lowerMessage.includes("order")) {
    const match = message.match(/(?:order(?:\s*id)?[:#\s-]*)([a-zA-Z0-9-]{5,})/i);
    if (match?.[1]) {
      metadata.trackOrder = match[1];
    } else {
      replyContent = "Please share your order ID so I can track it for you.";
    }
  } else if (shouldEscalateToSupport(message, safeHistory)) {
    metadata.supportAction = "ticket";
    replyContent = "I see those troubleshooting steps didn't resolve the issue. I can help you open a support ticket directly from this chat.";
  } else if (hasTroubleshootingIntent(message)) {
    replyContent = buildInlineTroubleshootingSteps(message);
  }

  metadata.content = replyContent;
  return NextResponse.json(metadata);
}
