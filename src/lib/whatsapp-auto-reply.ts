/**
 * Auto-reply service for WhatsApp messages
 * Sends automatic replies to incoming customer messages
 */
import { COMPANY_CONTACTS } from "@/constants/contacts";

export interface AutoReplyConfig {
  enabled: boolean;
  message: string;
  interactiveButtons?: { id: string; title: string }[];
  delay?: number; // ms delay before sending reply
  mediaUrl?: string; // Optional media URL
  mediaType?: "image" | "document" | "video" | "audio"; // Optional media type
}

const DEFAULT_AUTO_REPLY: AutoReplyConfig = {
  enabled: true,
  message: `Hi, SHERO 👋. How can we help you today? Select an option below, or simply type your question and a human agent will assist you.\n\nFor faster replies, you can text our personal number at ${COMPANY_CONTACTS.PHONE_DISPLAY}.`,
  interactiveButtons: [
    { id: "btn_shop", title: "🛒 Shop Products" },
    { id: "btn_order", title: "📦 Order Status" },
    { id: "btn_support", title: "🎫 Support Ticket" },
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

    // Check if after 9pm (21:00 GMT) or before 8am (08:00 GMT)
    const hour = new Date().getUTCHours();
    const currentConfig = { ...config };

    if (hour >= 21 || hour < 8) {
      const awayAlert = `🌙 *After Hours Notice*\nThank you for reaching out! Please note it is currently past 9 PM. We'll still receive and redirect your request, but we cannot guarantee a reply after 10 PM. We will get back to you as soon as possible during business hours.\n\n---\n\n`;
      currentConfig.message = awayAlert + currentConfig.message;

      // Ensure the "Shop Products" button is available so they can place orders anytime
      if (!currentConfig.interactiveButtons) {
        currentConfig.interactiveButtons = [];
      } else {
        // Clone array to avoid mutating
        currentConfig.interactiveButtons = [
          ...currentConfig.interactiveButtons,
        ];
      }

      if (!currentConfig.interactiveButtons.find((b) => b.id === "btn_shop")) {
        // If we already have 3 buttons, we have to replace one to make room for shop, or just prepend
        currentConfig.interactiveButtons.unshift({
          id: "btn_shop",
          title: "🛒 Shop Products",
        });
        if (currentConfig.interactiveButtons.length > 3) {
          currentConfig.interactiveButtons.pop(); // Max 3 buttons allowed by WhatsApp
        }
      }
    }

    const body: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: senderWaId,
    };

    if (
      currentConfig.interactiveButtons &&
      currentConfig.interactiveButtons.length > 0
    ) {
      body.type = "interactive";
      body.interactive = {
        type: "button",
        body: { text: currentConfig.message },
        action: {
          buttons: currentConfig.interactiveButtons.slice(0, 3).map((btn) => ({
            type: "reply",
            reply: { id: btn.id, title: btn.title },
          })),
        },
      };
    } else if (currentConfig.mediaUrl && currentConfig.mediaType) {
      body.type = currentConfig.mediaType;
      body[currentConfig.mediaType] = { link: currentConfig.mediaUrl };
      if (currentConfig.message && currentConfig.message !== "") {
        body[currentConfig.mediaType].caption = currentConfig.message;
      }
    } else {
      body.type = "text";
      body.text = { preview_url: false, body: currentConfig.message };
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
export function getSmartReply(
  customerMessage: string,
  buttonId?: string | null,
): { message: string; buttons?: { id: string; title: string }[] } | null {
  const msg = (customerMessage || "").toLowerCase().trim();
  const btn = (buttonId || "").toLowerCase().trim();

  // Handle interactive or CTA button IDs and button titles explicitly
  if (
    btn === "btn_shop" ||
    msg === "btn_shop" ||
    msg.includes("shop products") ||
    msg.includes("browse products")
  ) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
    return {
      message:
        `Awesome! You can browse our full catalog of certified tech products right here on our store: ${siteUrl}/shop`,
    };
  }
  if (
    btn === "btn_support" ||
    msg === "btn_support" ||
    msg.includes("support ticket") ||
    msg.includes("create ticket")
  ) {
    return {
      message:
        "We're here to help! Please reply to this message with a brief description of the issue you're facing, and I will create a support ticket for you.",
    };
  }
  if (
    btn === "btn_order" ||
    msg === "btn_order" ||
    msg.includes("order status") ||
    msg.includes("track order")
  ) {
    return {
      message:
        "I can help you track your order! Please reply to this message with your Order ID.",
    };
  }

  // Map of keywords to replies
  const replies: Record<string, string> = {
    "hours|open|timing|when":
      "We are available Monday-Friday, 8am-6pm GMT. How can we assist?",
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
      message: `Hi, SHERO 👋! How can we help you today? Select an option below, or simply type your question and a human agent will assist you.\n\nFor faster replies, you can text our personal number at ${COMPANY_CONTACTS.PHONE_DISPLAY}.`,
      buttons: [
        { id: "btn_shop", title: "🛒 Shop Products" },
        { id: "btn_order", title: "📦 Order Status" },
        { id: "btn_support", title: "🎫 Support Ticket" },
      ],
    };
  }

  return null;
}
