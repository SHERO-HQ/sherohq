"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Send,
  Check,
  CheckCheck,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  Code,
  Loader2,
  User,
  ExternalLink,
  MessageCircle,
  X,
} from "lucide-react";
import { useDialog } from "@/hooks/useDialog";
import { TemplatePreview } from "./newsletter/TemplatePreview";

interface ConversationMessage {
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

interface ConversationSummary {
  sender_wa_id: string;
  last_message_at: string;
  message_count: number;
  last_message: string | null;
  direction: "inbound" | "outbound";
  unread_count: number;
}

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
  const [localSelectedPhone, localSetSelectedPhone] = useState<string | null>(
    null,
  );

  const selectedPhone =
    propPhone !== undefined ? propPhone : localSelectedPhone;
  const setSelectedPhone =
    propSetPhone !== undefined ? propSetPhone : localSetSelectedPhone;

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
            // If the message count increased and the latest message is inbound
            if (
              (!old || old.message_count < conv.message_count) &&
              conv.direction === "inbound"
            ) {
              playNotificationSound();
              // If the admin is actively viewing this conversation, sync messages immediately
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

  // Fetch messages automatically when selectedPhone changes
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
        // Reverse array to render oldest first (chat order)
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
      // Optimistically update the UI to clear the badge
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
        {
          method: "DELETE",
        },
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
        // Reload messages to display the new outgoing message
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

  const filteredConversations = conversations.filter((conv) =>
    conv.sender_wa_id.includes(searchPhone),
  );

  const renderStatus = (status: string) => {
    switch (status) {
      case "read":
        return (
          <span title="Read" className="inline-flex ml-0.5">
            <CheckCheck className="w-3.75 h-3.75 text-[#53bdeb] shrink-0" />
          </span>
        );
      case "delivered":
        return (
          <span title="Delivered" className="inline-flex ml-0.5">
            <CheckCheck className="w-3.75 h-3.75 text-[#8696a0] shrink-0" />
          </span>
        );
      case "sent":
        return (
          <span title="Sent" className="inline-flex ml-0.5">
            <Check className="w-3.75 h-3.75 text-[#8696a0] shrink-0" />
          </span>
        );
      case "failed":
        return (
          <span title="Failed" className="inline-flex ml-0.5">
            <AlertTriangle className="w-3.25 h-3.25 text-rose-500 shrink-0" />
          </span>
        );
      default:
        return (
          <span title="Pending" className="inline-flex ml-0.5">
            <Check className="w-3.75 h-3.75 text-[#8696a0]/50 shrink-0" />
          </span>
        );
    }
  };

  const renderHeaderStatus = () => {
    const selectedConversation = conversations.find(
      (c) => c.sender_wa_id === selectedPhone,
    );
    if (!selectedConversation) return "online";
    const lastMessageDate = parseDateUTC(selectedConversation.last_message_at);
    const diffMs = Date.now() - lastMessageDate.getTime();

    // If the last message was less than 5 minutes ago, they are "online"
    if (diffMs < 300000) {
      return "online";
    }

    const isToday =
      lastMessageDate.toDateString() === new Date().toDateString();
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
      {/* Conversations List */}
      <div className="lg:col-span-1 bg-card/40 backdrop-blur-md rounded border border-border flex flex-col h-[calc(100vh-18rem)] min-h-125 sticky top-55">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-brand-secondary-400" />
              Active Chats
            </h2>
            <button
              onClick={() => fetchConversations()}
              disabled={refreshing}
              className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent transition-colors disabled:opacity-50"
              title="Refresh conversations"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search phone number..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="w-full px-3 py-2 bg-card border border-border rounded text-sm text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              {refreshing
                ? "Loading conversations..."
                : "No active chats found"}
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {filteredConversations.map((conv) => (
                <li key={conv.sender_wa_id}>
                  <button
                    onClick={() => void fetchMessages(conv.sender_wa_id)}
                    className={`w-full text-left px-4 py-4 hover:bg-accent transition-all flex items-start gap-3 relative border-l-4 ${
                      selectedPhone === conv.sender_wa_id
                        ? "bg-brand-secondary-500/10 border-brand-secondary-500"
                        : "border-transparent"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-center justify-between w-full mb-1">
                        <p
                          className={`text-sm font-semibold truncate pr-2 ${selectedPhone === conv.sender_wa_id ? "text-brand-secondary-400" : "text-foreground"}`}
                        >
                          {conv.sender_wa_id}
                        </p>
                        <span
                          className={`text-[10px] whitespace-nowrap shrink-0 ${conv.unread_count > 0 ? "text-emerald-500 font-bold" : "text-muted-foreground"}`}
                        >
                          {formatDistanceToNow(
                            parseDateUTC(conv.last_message_at),
                            {
                              addSuffix: true,
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between w-full gap-2">
                        <p
                          className={`text-xs truncate w-full ${conv.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}
                        >
                          {conv.direction === "outbound" && (
                            <span className="text-brand-secondary-400 mr-1 font-normal">
                              You:
                            </span>
                          )}
                          {conv.last_message || "(no text content)"}
                        </p>
                        {conv.unread_count > 0 ? (
                          <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-5 h-5">
                            {conv.unread_count}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-500 shrink-0">
                            {conv.message_count} msgs
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className="lg:col-span-2 bg-card/40 backdrop-blur-md rounded border border-border flex flex-col h-[calc(100vh-18rem)] min-h-125 sticky top-55">
        {selectedPhone ? (
          <>
            {/* Conversation Header */}
            <div className="px-4 py-2.5 bg-[#202c33] flex items-center justify-between shrink-0 relative z-10 border-b border-black/20">
              <div className="flex items-center gap-3.5 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#dfe5e7] overflow-hidden flex items-center justify-center relative shrink-0">
                  <User className="w-6 h-6 text-[#8696a0] mt-1.5" />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-[16px] font-normal text-[#e9edef] leading-tight mb-0.5">
                    {selectedPhone}
                  </h3>
                  <p className="text-[13px] text-[#8696a0] leading-tight">
                    {renderHeaderStatus()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void fetchMessages(selectedPhone)}
                  disabled={loading}
                  className="text-[#aebac1] hover:text-[#e9edef] p-2 rounded-full transition-colors disabled:opacity-50 flex items-center"
                  title="Sync Messages"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
                <button
                  onClick={() => {
                    setIsMessageSearchOpen(!isMessageSearchOpen);
                    if (isMessageSearchOpen) setMessageSearchQuery("");
                  }}
                  className={`p-2 rounded-full transition-colors hidden sm:block ${isMessageSearchOpen ? "text-[#e9edef] bg-white/10" : "text-[#aebac1] hover:text-[#e9edef]"}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    height="24"
                    width="24"
                    preserveAspectRatio="xMidYMid meet"
                    className=""
                    fill="currentColor"
                    enableBackground="new 0 0 24 24"
                  >
                    <path d="M15.9,14.3H15L14.7,14c1-1.1,1.6-2.7,1.6-4.3c0-3.7-3-6.7-6.7-6.7S3,6,3,9.7 s3,6.7,6.7,6.7c1.6,0,3.2-0.6,4.3-1.6l0.3,0.3v0.8l5.1,5.1l1.5-1.5L15.9,14.3z M9.7,14.3c-2.6,0-4.6-2.1-4.6-4.6s2.1-4.6,4.6-4.6 s4.6,2.1,4.6,4.6S12.3,14.3,9.7,14.3z"></path>
                  </svg>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`p-2 rounded-full transition-colors ${isMenuOpen ? "text-[#e9edef] bg-white/10" : "text-[#aebac1] hover:text-[#e9edef]"}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      height="24"
                      width="24"
                      preserveAspectRatio="xMidYMid meet"
                      className=""
                      fill="currentColor"
                      enableBackground="new 0 0 24 24"
                    >
                      <path d="M12,7a2,2,0,1,0-2-2A2,2,0,0,0,12,7Zm0,3a2,2,0,1,0,2,2A2,2,0,0,0,12,10Zm0,7a2,2,0,1,0,2,2A2,2,0,0,0,12,17Z"></path>
                    </svg>
                  </button>
                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsMenuOpen(false)}
                      ></div>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-[#233138] border border-white/10 rounded-md shadow-lg py-2 z-50 transform origin-top-right transition-all">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-[#d1d7db] hover:bg-[#111b21] transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Contact info
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-[#d1d7db] hover:bg-[#111b21] transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Select messages
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-[#d1d7db] hover:bg-[#111b21] transition-colors"
                          onClick={() => void handleDeleteChat("clear")}
                        >
                          Clear chat
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-[#111b21] transition-colors"
                          onClick={() => void handleDeleteChat("delete")}
                        >
                          Delete chat
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Search Bar */}
            {isMessageSearchOpen && (
              <div className="px-4 py-2 bg-[#202c33] border-b border-black/20 flex items-center shrink-0 z-10 transition-all">
                <div className="flex-1 bg-[#2a3942] rounded-md flex items-center px-3 py-1.5 border border-white/5">
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
                    className="bg-transparent text-[#e9edef] text-sm w-full focus:outline-none placeholder-[#8696a0]"
                    autoFocus
                  />
                  {messageSearchQuery && (
                    <button
                      onClick={() => setMessageSearchQuery("")}
                      className="text-[#8696a0] hover:text-[#e9edef] ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Chat Thread */}
            <div
              className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0b141a] custom-scrollbar relative"
              style={{
                backgroundImage:
                  'url("https://static.whatsapp.net/rsrc.php/v3/yl/r/r2qT9Z4Z4-x.png")',
                backgroundSize: "400px",
                backgroundBlendMode: "overlay",
                backgroundColor: "#0b141a",
                opacity: 0.98,
              }}
            >
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-[#00a884] animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center py-4">
                  <div className="bg-[#182229] text-[#8696a0] text-xs px-4 py-1.5 rounded-lg shadow-sm">
                    No messages in this conversation.
                  </div>
                </div>
              ) : (
                messages
                  .filter((msg) => {
                    if (!messageSearchQuery.trim()) return true;
                    return msg.content
                      ?.toLowerCase()
                      .includes(messageSearchQuery.toLowerCase());
                  })
                  .map((msg, index, filteredArray) => {
                    const isFirstInSequence =
                      index === 0 ||
                      filteredArray[index - 1].direction !== msg.direction;
                    return (
                      <div
                        key={msg.id}
                        className={`flex mb-0.5 ${msg.direction === "inbound" ? "justify-start" : "justify-end"} ${isFirstInSequence ? "mt-3" : ""}`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-[75%] px-2.5 py-1.5 shadow-sm relative text-[14.2px] leading-5 ${
                            msg.direction === "inbound"
                              ? `bg-[#202c33] text-[#e9edef] rounded-lg ${isFirstInSequence ? "rounded-tl-none" : ""}`
                              : `bg-[#005c4b] text-[#e9edef] rounded-lg ${isFirstInSequence ? "rounded-tr-none" : ""}`
                          }`}
                        >
                          {isFirstInSequence && msg.direction === "inbound" && (
                            <svg
                              viewBox="0 0 8 13"
                              width="8"
                              height="13"
                              className="absolute top-0 -left-2 text-[#202c33]"
                            >
                              <path
                                opacity="1"
                                fill="currentColor"
                                d="M1.533 3.568L8 12.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z"
                              ></path>
                            </svg>
                          )}
                          {isFirstInSequence &&
                            msg.direction === "outbound" && (
                              <svg
                                viewBox="0 0 8 13"
                                width="8"
                                height="13"
                                className="absolute top-0 -right-2 text-[#005c4b]"
                              >
                                <path
                                  opacity="1"
                                  fill="currentColor"
                                  d="M5.188 0H0v12.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"
                                ></path>
                              </svg>
                            )}

                          {msg.metadata?.rawMessage?.referral && (
                            <a
                              href={
                                msg.metadata.rawMessage.referral.source_url ||
                                "#"
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block bg-black/20 rounded p-2 mb-1.5 border-l-4 border-[#00a884] hover:bg-black/30 transition-colors group cursor-pointer"
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <p className="text-[11px] font-medium text-[#00a884] flex items-center gap-1.5">
                                  Via Facebook Ad
                                </p>
                                {msg.metadata.rawMessage.referral
                                  .source_url && (
                                  <ExternalLink className="w-3 h-3 text-[#8696a0] group-hover:text-[#00a884] transition-colors" />
                                )}
                              </div>
                              {msg.metadata.rawMessage.referral.headline && (
                                <p className="text-[13px] text-[#e9edef] font-medium group-hover:text-white transition-colors">
                                  {msg.metadata.rawMessage.referral.headline}
                                </p>
                              )}
                              {msg.metadata.rawMessage.referral.body && (
                                <p className="text-[11px] text-[#8696a0] mt-0.5 line-clamp-2">
                                  {msg.metadata.rawMessage.referral.body}
                                </p>
                              )}
                            </a>
                          )}

                          <div className="relative">
                            <span className="whitespace-pre-wrap wrap-break-word inline">
                              {msg.content || `[${msg.message_type}]`}
                            </span>
                            <span
                              className={`inline-block align-bottom ${msg.direction === "outbound" ? "w-19.5" : "w-13"}`}
                            ></span>

                            <span className="float-right relative -mb-0.75 ml-1 flex items-center gap-0.75 text-[11px] font-medium text-[#8696a0] mt-0.75 leading-none whitespace-nowrap">
                              <span className="leading-none">
                                {parseDateUTC(
                                  msg.created_at,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {msg.direction === "outbound" &&
                                renderStatus(msg.status)}
                            </span>
                          </div>

                          {msg.error_message && (
                            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 border-t border-white/5 pt-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              {msg.error_message}{" "}
                              {msg.error_code ? `(${msg.error_code})` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer Panel */}
            <div className="p-4 border-t border-border bg-card shrink-0">
              <div className="flex bg-accent/50 p-1 rounded w-fit mb-4">
                <button
                  type="button"
                  onClick={() => setSendType("text")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    sendType === "text"
                      ? "bg-card text-foreground shadow-sm border border-border/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Custom Text
                </button>
                <button
                  type="button"
                  onClick={() => setSendType("template")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    sendType === "template"
                      ? "bg-card text-foreground shadow-sm border border-border/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  Meta Template
                </button>
              </div>

              <form onSubmit={handleSend} className="space-y-3">
                {sendType === "text" ? (
                  <div className="flex items-end gap-2 bg-accent/30 p-2 rounded border border-border/60">
                    <textarea
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void handleSend(e as unknown as React.FormEvent);
                        }
                      }}
                      placeholder="Type a message..."
                      disabled={sending}
                      rows={1}
                      className="flex-1 px-4 py-3 bg-transparent text-sm text-foreground focus:outline-none disabled:opacity-50 placeholder:text-muted-foreground resize-none overflow-y-auto custom-scrollbar"
                      style={{ minHeight: "44px", maxHeight: "120px" }}
                    />
                    <button
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 shrink-0 mb-0.5"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 bg-accent/20 p-5 rounded border border-border">
                    {/* Live Preview Section */}
                    {templateName &&
                      dbTemplates.find((t) => t.name === templateName) && (
                        <div className="mb-4">
                          <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                            Live Preview
                          </label>
                          <TemplatePreview
                            channel="whatsapp"
                            content={
                              dbTemplates.find((t) => t.name === templateName)
                                ?.content || ""
                            }
                            params={
                              templateParamsText
                                ? templateParamsText
                                    .split(",")
                                    .map((p) => p.trim())
                                : []
                            }
                          />
                        </div>
                      )}

                    <div className="mb-4 pb-4 border-b border-border/50">
                      <label
                        className="block text-[11px] font-semibold text-muted-foreground mb-1.5"
                        htmlFor="composer-template-preset"
                      >
                        Load Predefined Template
                      </label>
                      <select
                        id="composer-template-preset"
                        onChange={(e) => {
                          const t = dbTemplates.find(
                            (x) => x.name === e.target.value,
                          );
                          if (t) {
                            setTemplateName(t.name);
                            setTemplateLang(t.whatsappTemplateLanguage || "en");
                            if (
                              t.expectedParams &&
                              t.expectedParams.length > 0
                            ) {
                              setTemplateParamsText(
                                t.expectedParams
                                  .map((p: string) => `[${p}]`)
                                  .join(", "),
                              );
                            } else {
                              setTemplateParamsText("");
                            }
                          }
                        }}
                        className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-secondary-500 transition-shadow appearance-none"
                      >
                        <option value="">-- Select a Template --</option>
                        {dbTemplates.map((t) => (
                          <option key={t.id} value={t.name}>
                            {t.name} {t.category ? `(${t.category})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-[11px] font-semibold text-muted-foreground mb-1.5"
                          htmlFor="composer-template-name"
                        >
                          Template Name
                        </label>
                        <input
                          id="composer-template-name"
                          type="text"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder="verification_code"
                          disabled={sending}
                          className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-secondary-500 transition-shadow"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-[11px] font-semibold text-muted-foreground mb-1.5"
                          htmlFor="composer-template-lang"
                        >
                          Language Code
                        </label>
                        <input
                          id="composer-template-lang"
                          type="text"
                          value={templateLang}
                          onChange={(e) => setTemplateLang(e.target.value)}
                          placeholder="en"
                          disabled={sending}
                          className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-secondary-500 transition-shadow"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="block text-[11px] font-semibold text-muted-foreground mb-1.5"
                        htmlFor="composer-template-params"
                      >
                        Parameters (comma-separated variables, e.g. "123456")
                      </label>
                      <input
                        id="composer-template-params"
                        type="text"
                        value={templateParamsText}
                        onChange={(e) => setTemplateParamsText(e.target.value)}
                        placeholder="e.g. 123456, GHS 50.00"
                        disabled={sending}
                        className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-secondary-500 transition-shadow"
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={sending || !templateName.trim()}
                        className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white px-5 py-2 rounded font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 disabled:active:scale-100"
                      >
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Send Template
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
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
