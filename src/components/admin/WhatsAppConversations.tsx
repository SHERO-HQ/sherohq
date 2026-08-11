"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { useDialog } from "@/hooks/useDialog";

import { ConversationSummary, ConversationMessage } from "./whatsapp/types";
import { ConversationList } from "./whatsapp/ConversationList";
import { ConversationHeader } from "./whatsapp/ConversationHeader";
import { ConversationThread } from "./whatsapp/ConversationThread";
import { MessageComposer } from "./whatsapp/MessageComposer";

interface WhatsAppConversationsProps {
  selectedPhone?: string | null;
  setSelectedPhone?: (phone: string | null) => void;
}

const parseDateUTC = (dateStr: string) => {
  if (!dateStr) return new Date();
  const hasTimezone = /(Z|[+-]\d{2}:\d{2})$/.test(dateStr);
  const normalized = dateStr.includes("T")
    ? dateStr
    : dateStr.replace(" ", "T");
  return new Date(hasTimezone ? normalized : `${normalized}Z`);
};

export default function WhatsAppConversations({
  selectedPhone: propPhone,
  setSelectedPhone: propSetPhone,
}: WhatsAppConversationsProps) {
  const dialog = useDialog();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [localSelectedPhone, localSetSelectedPhone] = useState<string | null>(null);

  const selectedPhone = propPhone !== undefined ? propPhone : localSelectedPhone;
  const setSelectedPhone = propSetPhone !== undefined ? propSetPhone : localSetSelectedPhone;

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isMessageSearchOpen, setIsMessageSearchOpen] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // For notification detection
  const previousConversationsRef = useRef<ConversationSummary[]>([]);
  const selectedPhoneRef = useRef<string | null>(null);

  // Keep selectedPhone ref in sync
  useEffect(() => {
    selectedPhoneRef.current = selectedPhone || null;
  }, [selectedPhone]);

  const playNotificationSound = () => {
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        1760,
        audioCtx.currentTime + 0.1,
      );

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.3,
      );

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio notification blocked or unsupported", e);
    }
  };

  // Composer states
  const [sendType, setSendType] = useState<"text" | "template">("text");
  const [messageText, setMessageText] = useState("");
  const [templateName, setTemplateName] = useState("verification_code");
  const [templateLang, setTemplateLang] = useState("en");
  const [templateParamsText, setTemplateParamsText] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch all conversations on mount & start polling
  useEffect(() => {
    void fetchConversations();

    // Poll every 15 seconds for new messages
    const interval = setInterval(() => {
      void fetchConversations(true);
    }, 15000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [dbTemplates, setDbTemplates] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/admin/templates")
      .then((res) => res.json())
      .then((data) => {
        const t = data.templates || [];
        setDbTemplates(t.filter((x: any) => x.channel === "whatsapp"));
      })
      .catch((err) => console.error("Failed to fetch templates:", err));
  }, []);

  // Scroll to bottom when messages load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const response = await fetch("/api/admin/whatsapp/conversations-list");
      const data = await response.json();
      if (data.success) {
        const newConvs = data.conversations || [];

        // Notification Logic
        if (previousConversationsRef.current.length > 0) {
          const oldMap = new Map(
            previousConversationsRef.current.map((c) => [c.sender_wa_id, c]),
          );
          for (const conv of newConvs) {
            const old = oldMap.get(conv.sender_wa_id);
            if (
              (!old || old.message_count < conv.message_count) &&
              conv.direction === "inbound"
            ) {
              playNotificationSound();
              if (selectedPhoneRef.current === conv.sender_wa_id) {
                void syncMessages(conv.sender_wa_id, true);
              }
            }
          }
        }

        previousConversationsRef.current = newConvs;
        setConversations(newConvs);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedPhone) {
      void syncMessages(selectedPhone);
    }
  }, [selectedPhone]);

  const syncMessages = async (phone: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/whatsapp/conversations?phone=${encodeURIComponent(phone)}`,
      );
      const data = await response.json();
      if (data.success) {
        const chatMessages = data.messages ? [...data.messages].reverse() : [];
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const markAsRead = async (phone: string) => {
    try {
      await fetch("/api/admin/whatsapp/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.sender_wa_id === phone ? { ...c, unread_count: 0 } : c,
        ),
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const fetchMessages = async (phone: string) => {
    setSelectedPhone(phone);
    void markAsRead(phone);
  };

  const handleDeleteChat = async (action: "clear" | "delete") => {
    if (!selectedPhone) return;

    const confirmed = await dialog.confirm({
      title: action === "delete" ? "Delete Chat" : "Clear Chat",
      message:
        action === "delete"
          ? "Are you sure you want to delete this chat entirely? This cannot be undone and will remove the contact from the database."
          : "Are you sure you want to clear all messages? This cannot be undone.",
      confirmText: action === "delete" ? "Delete" : "Clear",
      type: action === "delete" ? "error" : "warning",
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/whatsapp/conversations?phone=${encodeURIComponent(selectedPhone)}&action=${action}`,
        { method: "DELETE" },
      );
      const data = await response.json();

      if (data.success) {
        setIsMenuOpen(false);
        if (action === "delete") {
          setSelectedPhone(null);
          void fetchConversations();
        } else {
          void fetchMessages(selectedPhone);
        }
      } else {
        void dialog.alert({
          title: "Error",
          message: data.error || "Failed to perform action",
          type: "error",
        });
      }
    } catch (error) {
      console.error(`Failed to ${action} chat:`, error);
      void dialog.alert({
        title: "Error",
        message: `Failed to ${action} chat.`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhone || sending) return;

    if (sendType === "text" && !messageText.trim()) return;
    if (sendType === "template" && !templateName.trim()) return;

    setSending(true);

    const payload = {
      phone: selectedPhone,
      message: sendType === "text" ? messageText : undefined,
      templateName: sendType === "template" ? templateName.trim() : undefined,
      templateLanguage:
        sendType === "template" ? templateLang.trim() : undefined,
      templateParams:
        sendType === "template"
          ? templateParamsText
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p.length > 0)
          : undefined,
    };

    try {
      const response = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setMessageText("");
        setTemplateParamsText("");
        await syncMessages(selectedPhone);
        void fetchConversations();
      } else {
        void dialog.alert({
          title: "Send Failed",
          message: `Error: ${data.error || "Failed to send message"}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      void dialog.alert({
        title: "Send Error",
        message: "Failed to send message. Please try again.",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  };

  const renderHeaderStatus = () => {
    const selectedConversation = conversations.find(
      (c) => c.sender_wa_id === selectedPhone,
    );
    if (!selectedConversation) return "online";
    const lastMessageDate = parseDateUTC(selectedConversation.last_message_at);
    const diffMs = Date.now() - lastMessageDate.getTime();

    if (diffMs < 300000) {
      return "online";
    }

    const isToday = lastMessageDate.toDateString() === new Date().toDateString();
    const timeStr = lastMessageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) {
      return `last seen today at ${timeStr}`;
    }

    const dateStr = lastMessageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
    return `last seen ${dateStr} at ${timeStr}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <ConversationList
        conversations={conversations}
        searchPhone={searchPhone}
        setSearchPhone={setSearchPhone}
        refreshing={refreshing}
        fetchConversations={fetchConversations}
        selectedPhone={selectedPhone}
        fetchMessages={fetchMessages}
      />

      <div className="lg:col-span-2 bg-card/40 backdrop-blur-md rounded border border-border flex flex-col h-[calc(100vh-18rem)] min-h-125 sticky top-55">
        {selectedPhone ? (
          <>
            <ConversationHeader
              selectedPhone={selectedPhone}
              headerStatus={renderHeaderStatus()}
              loading={loading}
              fetchMessages={fetchMessages}
              isMessageSearchOpen={isMessageSearchOpen}
              setIsMessageSearchOpen={setIsMessageSearchOpen}
              setMessageSearchQuery={setMessageSearchQuery}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              handleDeleteChat={handleDeleteChat}
              messageSearchQuery={messageSearchQuery}
            />

            <ConversationThread
              loading={loading}
              messages={messages}
              messageSearchQuery={messageSearchQuery}
              messagesEndRef={messagesEndRef}
            />

            <MessageComposer
              selectedPhone={selectedPhone}
              handleSend={handleSend}
              sendType={sendType}
              setSendType={setSendType}
              messageText={messageText}
              setMessageText={setMessageText}
              templateName={templateName}
              setTemplateName={setTemplateName}
              templateLang={templateLang}
              setTemplateLang={setTemplateLang}
              templateParamsText={templateParamsText}
              setTemplateParamsText={setTemplateParamsText}
              sending={sending}
              dbTemplates={dbTemplates}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
            <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4 border border-border">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-bold text-foreground mb-1">
              Select a Conversation
            </h4>
            <p className="text-sm text-muted-foreground max-w-sm">
              Choose a customer phone number from the left panel to load
              conversation logs and send messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
