/**
 * Auto-reply service for WhatsApp messages
 * Sends automatic replies to incoming customer messages
 */

import { notificationService } from './notifications';
import { storeOutgoingMessage } from './whatsapp-messages';

export interface AutoReplyConfig {
  enabled: boolean;
  message: string;
  delay?: number; // ms delay before sending reply
}

const DEFAULT_AUTO_REPLY: AutoReplyConfig = {
  enabled: true,
  message: `Thank you for reaching out! We've received your message and will get back to you as soon as possible. Our support team typically responds within 24 hours.`,
  delay: 1000, // 1 second delay
};

/**
 * Send auto-reply to customer message
 */
export async function sendAutoReply(
  senderWaId: string,
  phoneNumberId: string,
  config: AutoReplyConfig = DEFAULT_AUTO_REPLY
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!config.enabled) {
    return { success: true, messageId: 'auto-reply-disabled' };
  }

  try {
    // Optional delay before sending reply
    if (config.delay && config.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, config.delay));
    }

    // Send via WhatsApp API
    const response = await notificationService.sendWhatsAppNotification(
      senderWaId,
      config.message
    );

    if (response.success && response.data?.messages?.[0]?.id) {
      const messageId = response.data.messages[0].id;

      // Store the outgoing auto-reply message
      await storeOutgoingMessage(
        messageId,
        'auto-reply', // campaign_id (special marker for auto-replies)
        senderWaId,
        phoneNumberId,
        config.message,
        {
          type: 'auto_reply',
          timestamp: new Date().toISOString(),
        }
      );

      return { success: true, messageId };
    }

    return {
      success: false,
      error: response.error || 'Failed to send auto-reply',
    };
  } catch (error) {
    console.error('Error sending auto-reply:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Custom auto-reply for specific keywords
 * Returns null if no match
 */
export function getSmartReply(customerMessage: string): string | null {
  const msg = customerMessage.toLowerCase().trim();

  // Map of keywords to replies
  const replies: Record<string, string> = {
    'hello|hi|hey|greetings':
      "Hi! 👋 Thank you for contacting us. How can we help you today?",
    'hours|open|timing|when':
      'We are available Monday-Friday, 9am-6pm EST. How can we assist?',
    'order|purchase|buy':
      "Great! I'd love to help with your order. Could you provide more details about what you're interested in?",
    'price|cost|how much':
      "I can help with pricing! What product or service are you interested in learning about?",
    'thank|thanks|appreciate':
      "You're welcome! Is there anything else we can help you with?",
    'bye|goodbye|talk later|ttyl':
      "Have a great day! Feel free to reach out anytime if you need anything else. 👋",
  };

  for (const [keywords, reply] of Object.entries(replies)) {
    const pattern = new RegExp(`\\b(${keywords})\\b`);
    if (pattern.test(msg)) {
      return reply;
    }
  }

  return null;
}

/**
 * Compose auto-reply configuration
 */
export function createAutoReplyConfig(
  message: string,
  enabled: boolean = true,
  delay: number = 1000
): AutoReplyConfig {
  return {
    enabled,
    message,
    delay,
  };
}
