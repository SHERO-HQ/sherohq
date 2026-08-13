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

export {
  BUILTIN_WHATSAPP_TEMPLATES,
  type WhatsAppTemplateDefinition,
} from "@/lib/whatsapp-templates";


