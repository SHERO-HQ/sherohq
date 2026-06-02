"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, Check, CheckCheck, AlertTriangle, RefreshCw, MessageSquare, Code, Loader2 } from "lucide-react";

interface ConversationMessage {
  id: string;
  sender_wa_id: string;
  message_type: string;
  content: string | null;
  status: string;
  direction: "inbound" | "outbound";
  error_code?: string | null;
  error_message?: string | null;
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
        alert(`Error: ${data.error || "Failed to send message"}`);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
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
        return <CheckCheck className="w-4 h-4 text-cyan-400 shrink-0" title="Read" />;
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-slate-400 shrink-0" title="Delivered" />;
      case "sent":
        return <Check className="w-4 h-4 text-slate-400 shrink-0" title="Sent" />;
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" title="Failed" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Conversations List */}
      <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-md rounded-lg border border-white/10 flex flex-col h-[700px]">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-secondary-400" />
              Active Chats
            </h2>
            <button
              onClick={fetchConversations}
              disabled={refreshing}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-50"
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
            className="w-full px-3 py-2 bg-slate-950/50 border border-white/10 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              {refreshing ? "Loading conversations..." : "No active chats found"}
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {filteredConversations.map((conv) => (
                <li key={conv.sender_wa_id}>
                  <button
                    onClick={() => void fetchMessages(conv.sender_wa_id)}
                    className={`w-full text-left px-6 py-4 hover:bg-white/5 transition-all flex flex-col gap-1 relative ${
                      selectedPhone === conv.sender_wa_id
                        ? "bg-brand-secondary-500/10 border-r-2 border-brand-secondary-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <p className="text-sm font-semibold text-white">
                        {conv.sender_wa_id}
                      </p>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(conv.last_message_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate w-full pr-4">
                      {conv.direction === "outbound" && <span className="text-brand-secondary-400 mr-1">You:</span>}
                      {conv.last_message || "(no text content)"}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-500">
                        {conv.message_count} messages
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md rounded-lg border border-white/10 flex flex-col h-[700px]">
        {selectedPhone ? (
          <>
            {/* Conversation Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedPhone}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Active connection via Meta WhatsApp Business API
                </p>
              </div>
              <button
                onClick={() => void fetchMessages(selectedPhone)}
                disabled={loading}
                className="text-slate-400 hover:text-white p-2 rounded hover:bg-white/5 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Sync
              </button>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/20 custom-scrollbar">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-brand-secondary-500 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-8">
                  No messages in this conversation.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.direction === "inbound" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-md px-4 py-2.5 rounded-2xl ${
                        msg.direction === "inbound"
                          ? "bg-slate-800 border border-white/5 text-slate-100 rounded-tl-none"
                          : "bg-brand-secondary-600 text-white rounded-tr-none shadow-[0_4px_12px_rgba(16,185,129,0.15)]"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content || `[${msg.message_type}]`}
                      </p>
                      
                      {msg.error_message && (
                        <p className="text-xs text-rose-300 mt-1.5 flex items-center gap-1 border-t border-rose-500/20 pt-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          {msg.error_message} (Code: {msg.error_code})
                        </p>
                      )}

                      <div
                        className={`flex items-center justify-end gap-1 text-[10px] mt-1.5 ${
                          msg.direction === "inbound" ? "text-slate-500" : "text-emerald-100"
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
            <div className="p-4 border-t border-white/10 bg-slate-900/60 shrink-0">
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setSendType("text")}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
                    sendType === "text"
                      ? "bg-brand-secondary-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Custom Text
                </button>
                <button
                  type="button"
                  onClick={() => setSendType("template")}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
                    sendType === "template"
                      ? "bg-brand-secondary-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  Meta Template
                </button>
              </div>

              <form onSubmit={handleSend} className="space-y-3">
                {sendType === "text" ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      disabled={sending}
                      className="flex-1 px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary-500 focus:border-transparent disabled:opacity-50 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-white/5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1" htmlFor="composer-template-name">
                          Template Name
                        </label>
                        <input
                          id="composer-template-name"
                          type="text"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder="verification_code"
                          disabled={sending}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-md text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-secondary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1" htmlFor="composer-template-lang">
                          Language Code
                        </label>
                        <input
                          id="composer-template-lang"
                          type="text"
                          value={templateLang}
                          onChange={(e) => setTemplateLang(e.target.value)}
                          placeholder="en"
                          disabled={sending}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-md text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-secondary-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1" htmlFor="composer-template-params">
                        Parameters (comma-separated variables, e.g. "123456")
                      </label>
                      <input
                        id="composer-template-params"
                        type="text"
                        value={templateParamsText}
                        onChange={(e) => setTemplateParamsText(e.target.value)}
                        placeholder="e.g. 123456, GHS 50.00"
                        disabled={sending}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-md text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-secondary-500"
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={sending || !templateName.trim()}
                        className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white px-4 py-1.5 rounded-md font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
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
            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-white/5">
              <MessageSquare className="w-8 h-8 text-slate-500" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Select a Conversation</h4>
            <p className="text-sm text-slate-400 max-w-sm">
              Choose a customer phone number from the left panel to load conversation logs and send messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
