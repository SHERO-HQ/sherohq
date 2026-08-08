/**
 * Auto-reply service for WhatsApp messages
 * Sends automatic replies to incoming customer messages
 */

export interface AutoReplyConfig {
  enabled: boolean;
  message: string;
  interactiveButtons?: { id: string; title: string }[];
  delay?: number; // ms delay before sending reply
}

const DEFAULT_AUTO_REPLY: AutoReplyConfig = {
  enabled: true,
  message: `Welcome to SHERO! How can we help you today?`,
  interactiveButtons: [
    { id: "btn_shop", title: "🛒 Shop Products" },
    { id: "btn_support", title: "🎫 Support Ticket" },
    { id: "btn_order", title: "📦 Order Status" }
  ],
  delay: 1000, // 1 second delay
};

/**
 * Send auto-reply to customer message
 */
export async function sendAutoReply(
  senderWaId: string,
  phoneNumberId: string,
  config: AutoReplyConfig = DEFAULT_AUTO_REPLY,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!config.enabled) {
    return { success: true, messageId: "auto-reply-disabled" };
  }

  try {
    // Optional delay before sending reply
    if (config.delay && config.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, config.delay));
    }

    const { WHATSAPP_ACCESS_TOKEN } = process.env;
    if (!WHATSAPP_ACCESS_TOKEN) {
      return { success: false, error: "WhatsApp API token not configured" };
    }

    const body: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: senderWaId,
    };

    if (config.interactiveButtons && config.interactiveButtons.length > 0) {
      body.type = "interactive";
      body.interactive = {
        type: "button",
        body: { text: config.message },
        action: {
          buttons: config.interactiveButtons.slice(0, 3).map((btn) => ({
            type: "reply",
            reply: { id: btn.id, title: btn.title },
          })),
        },
      };
    } else {
      body.type = "text";
      body.text = { preview_url: false, body: config.message };
    }

    // Send via WhatsApp API directly
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = (await response.json()) as any;

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || `HTTP ${response.status}`,
      };
    }

    const messageId = data.messages?.[0]?.id;
    if (!messageId) {
      return { success: false, error: "No message ID in response" };
    }

    console.log(`Sent auto-reply ${messageId} to ${senderWaId}`);
    return { success: true, messageId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Custom auto-reply for specific keywords or interactive button clicks
 */
export function getSmartReply(customerMessage: string): { message: string; buttons?: { id: string; title: string }[] } | null {
  const msg = customerMessage.toLowerCase().trim();

  // Handle interactive button IDs explicitly
  if (msg === "btn_shop") {
    return {
      message: "Awesome! You can browse all our premium tech products right here on our store: https://sherohq.com/shop",
    };
  }
  if (msg === "btn_support") {
    return {
      message: "I'll get a human support agent for you right away. Could you briefly describe the issue?",
    };
  }
  if (msg === "btn_order") {
    return {
      message: "I can help you track your order! Please reply with your Order ID.",
    };
  }

  // Map of keywords to replies
  const replies: Record<string, string> = {
    "hours|open|timing|when":
      "We are available Monday-Friday, 9am-6pm EST. How can we assist?",
    "order|purchase|buy":
      "Great! I'd love to help with your order. Could you provide more details about what you're interested in?",
    "price|cost|how much":
      "I can help with pricing! What product or service are you interested in learning about?",
    "thank|thanks|appreciate":
      "You're welcome! Is there anything else we can help you with?",
    "bye|goodbye|talk later|ttyl":
      "Have a great day! Feel free to reach out anytime if you need anything else. 👋",
  };

  for (const [keywords, reply] of Object.entries(replies)) {
    const pattern = new RegExp(`\\b(${keywords})\\b`);
    if (pattern.test(msg)) {
      return { message: reply };
    }
  }

  // If they say hello, return the main interactive menu
  const helloPattern = new RegExp(`\\b(hello|hi|hey|greetings)\\b`);
  if (helloPattern.test(msg)) {
    return {
      message: "Hi! 👋 Welcome to SHERO. How can we help you today?",
      buttons: [
        { id: "btn_shop", title: "🛒 Shop Products" },
        { id: "btn_support", title: "🎫 Support Ticket" },
        { id: "btn_order", title: "📦 Order Status" }
      ]
    };
  }

  return null;
}

/**
 * Compose auto-reply configuration
 */
export function createAutoReplyConfig(
  message: string,
  enabled: boolean = true,
  delay: number = 1000,
): AutoReplyConfig {
  return {
    enabled,
    message,
    delay,
  };
}
