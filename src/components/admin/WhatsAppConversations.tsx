"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, Check, CheckCheck, AlertTriangle, RefreshCw, MessageSquare, Code, Loader2, User, ExternalLink } from "lucide-react";
import { useDialog } from "@/hooks/useDialog";

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
  direction: string;
}

interface WhatsAppConversationsProps {
  selectedPhone?: string | null;
  setSelectedPhone?: (phone: string | null) => void;
}

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

  // Composer states
  const [sendType, setSendType] = useState<"text" | "template">("text");
  const [messageText, setMessageText] = useState("");
  const [templateName, setTemplateName] = useState("verification_code");
  const [templateLang, setTemplateLang] = useState("en");
  const [templateParamsText, setTemplateParamsText] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch all conversations
  useEffect(() => {
    void fetchConversations();
  }, []);

  // Scroll to bottom when messages load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/admin/whatsapp/conversations-list");
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch messages automatically when selectedPhone changes
  useEffect(() => {
    if (selectedPhone) {
      void syncMessages(selectedPhone);
    }
  }, [selectedPhone]);

  const syncMessages = async (phone: string) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const fetchMessages = async (phone: string) => {
    setSelectedPhone(phone);
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
      templateLanguage: sendType === "template" ? templateLang.trim() : undefined,
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
        void dialog.alert({ title: "Send Failed", message: `Error: ${data.error || "Failed to send message"}`, type: "error" });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      void dialog.alert({ title: "Send Error", message: "Failed to send message. Please try again.", type: "error" });
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
          <span title="Read" className="inline-flex">
            <CheckCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          </span>
        );
      case "delivered":
        return (
          <span title="Delivered" className="inline-flex">
            <CheckCheck className="w-4 h-4 text-muted-foreground shrink-0" />
          </span>
        );
      case "sent":
        return (
          <span title="Sent" className="inline-flex">
            <Check className="w-4 h-4 text-muted-foreground shrink-0" />
          </span>
        );
      case "failed":
        return (
          <span title="Failed" className="inline-flex">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Conversations List */}
      <div className="lg:col-span-1 bg-card/40 backdrop-blur-md rounded border border-border flex flex-col h-[calc(100vh-18rem)] min-h-[500px] sticky top-[220px]">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-secondary-400" />
              Active Chats
            </h2>
            <button
              onClick={fetchConversations}
              disabled={refreshing}
              className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent transition-colors disabled:opacity-50"
              title="Refresh conversations"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
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
              {refreshing ? "Loading conversations..." : "No active chats found"}
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {filteredConversations.map((conv) => (
                <li key={conv.sender_wa_id}>
                  <button
                    onClick={() => void fetchMessages(conv.sender_wa_id)}
                    className={`w-full text-left px-4 py-4 hover:bg-accent transition-all flex items-start gap-3 relative border-l-4 ${selectedPhone === conv.sender_wa_id
                      ? "bg-brand-secondary-500/10 border-brand-secondary-500"
                      : "border-transparent"
                      }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center justify-between w-full">
                        <p className={`text-sm font-semibold truncate pr-2 ${selectedPhone === conv.sender_wa_id ? "text-brand-secondary-400" : "text-foreground"}`}>
                          {conv.sender_wa_id}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                          {formatDistanceToNow(new Date(conv.last_message_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate w-full">
                        {conv.direction === "outbound" && <span className="text-brand-secondary-400 mr-1">You:</span>}
                        {conv.last_message || "(no text content)"}
                      </p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] font-medium text-slate-500">
                          {conv.message_count} messages
                        </span>
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
      <div className="lg:col-span-2 bg-card/40 backdrop-blur-md rounded border border-border flex flex-col h-[calc(100vh-18rem)] min-h-[500px] sticky top-[220px]">
        {selectedPhone ? (
          <>
            {/* Conversation Header */}
            <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center relative shrink-0">
                  <User className="w-6 h-6 text-muted-foreground" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full" title="Online"></span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedPhone}
                  </h3>
                  <p className="text-xs text-emerald-400/80 font-medium mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    Active WhatsApp Connection
                  </p>
                </div>
              </div>
              <button
                onClick={() => void fetchMessages(selectedPhone)}
                disabled={loading}
                className="text-muted-foreground hover:text-foreground p-2 rounded hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Sync
              </button>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-brand-secondary-900/10 custom-scrollbar relative">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-brand-secondary-500 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No messages in this conversation.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "inbound" ? "justify-start" : "justify-end"
                      }`}
                  >
                    <div
                      className={`max-w-md px-4 py-2.5 shadow-sm relative ${msg.direction === "inbound"
                        ? "bg-slate-800/80 border border-border text-slate-100 rounded-2xl rounded-tl-sm"
                        : "bg-brand-secondary-600 text-white rounded-2xl rounded-tr-sm shadow-black/20"
                        }`}
                    >
                      {msg.metadata?.rawMessage?.referral && (
                        <a
                          href={msg.metadata.rawMessage.referral.source_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-black/20 rounded p-2.5 mb-2 border border-white/5 hover:bg-black/30 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-bold text-brand-secondary-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-brand-secondary-500 rounded-full inline-block"></span>
                              Via Facebook Ad
                            </p>
                            {msg.metadata.rawMessage.referral.source_url && (
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-brand-secondary-400 transition-colors" />
                            )}
                          </div>
                          {msg.metadata.rawMessage.referral.headline && (
                            <p className="text-xs text-slate-200 font-semibold group-hover:text-white transition-colors">
                              {msg.metadata.rawMessage.referral.headline}
                            </p>
                          )}
                          {msg.metadata.rawMessage.referral.body && (
                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                              {msg.metadata.rawMessage.referral.body}
                            </p>
                          )}
                        </a>
                      )}
                      <p className="text-[15px] whitespace-pre-wrap leading-relaxed break-words pb-3">
                        {msg.content || `[${msg.message_type}]`}
                      </p>

                      {msg.error_message && (
                        <p className="text-xs text-rose-300 mt-1.5 flex items-center gap-1 border-t border-rose-500/20 pt-1 pb-3">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          {msg.error_message} (Code: {msg.error_code})
                        </p>
                      )}

                      <div
                        className={`absolute bottom-1 right-3 flex items-center justify-end gap-1 text-[10px] font-medium tracking-wide ${msg.direction === "inbound" ? "text-slate-400" : "text-emerald-100"
                          }`}
                      >
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {msg.direction === "outbound" && renderStatus(msg.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer Panel */}
            <div className="p-4 border-t border-border bg-card shrink-0">
              <div className="flex bg-accent/50 p-1 rounded-lg w-fit mb-4">
                <button
                  type="button"
                  onClick={() => setSendType("text")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${sendType === "text"
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
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${sendType === "template"
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
                  <div className="flex items-end gap-2 bg-accent/30 p-2 rounded-3xl border border-border/60">
                    <textarea
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        e.target.style.height = 'auto';
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
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 bg-accent/20 p-5 rounded-xl border border-border">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5" htmlFor="composer-template-name">
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
                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5" htmlFor="composer-template-lang">
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
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5" htmlFor="composer-template-params">
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
                        className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 disabled:active:scale-100"
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-bold text-foreground mb-1">Select a Conversation</h4>
            <p className="text-sm text-muted-foreground max-w-sm">
              Choose a customer phone number from the left panel to load conversation logs and send messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
