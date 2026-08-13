export interface ConversationMessage {
  id: string;
  sender_wa_id: string;
  message_type: string;
  content: string | null;
  status: string;
  direction: "inbound" | "outbound";
  error_code?: string | null;
  error_message?: string | null;
  metadata?: any;
  created_at: string;
}

export interface ConversationSummary {
  sender_wa_id: string;
  last_message_at: string;
  message_count: number;
  last_message: string | null;
  direction: "inbound" | "outbound";
  unread_count: number;
  last_inbound_at?: string | null;
  is_window_open?: boolean;
  window_expires_at?: string | null;
}

export const BUILTIN_WHATSAPP_TEMPLATES = [
  {
    id: "builtin_customer_followup",
    name: "customer_followup",
    category: "UTILITY",
    whatsappTemplateLanguage: "en",
    content: "Hi {{1}}, this is {{2}} from SHERO Technologies following up on your inquiry. Please let us know if you still need assistance or have any questions!",
    expectedParams: ["Customer Name", "Agent/Team Name"],
  },
  {
    id: "builtin_order_followup",
    name: "order_followup",
    category: "UTILITY",
    whatsappTemplateLanguage: "en",
    content: "Hi {{1}}, we hope you are loving your items from SHERO Technologies! We're following up on order {{2}}. Let us know if you need any setup assistance.",
    expectedParams: ["Customer Name", "Order ID"],
  },
  {
    id: "builtin_abandoned_cart",
    name: "abandoned_cart_reminder",
    category: "MARKETING",
    whatsappTemplateLanguage: "en",
    content: "Hi {{1}}! We noticed you left some great items in your cart at SHERO Technologies. Complete your order today before they run out!",
    expectedParams: ["Customer Name"],
  },
  {
    id: "builtin_order_confirmation",
    name: "order_confirmation",
    category: "UTILITY",
    whatsappTemplateLanguage: "en",
    content: "Hi {{1}}, thank you for shopping with SHERO Technologies! Your order {{2}} for GHS {{3}} has been received.",
    expectedParams: ["Customer Name", "Order ID", "Total Amount"],
  },
  {
    id: "builtin_order_update",
    name: "order_update",
    category: "UTILITY",
    whatsappTemplateLanguage: "en",
    content: "Hi {{1}}, your order {{2}} from SHERO Technologies is now {{3}}!",
    expectedParams: ["Customer Name", "Order ID", "Status"],
  },
];


