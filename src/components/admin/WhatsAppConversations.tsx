"use client";

import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface ConversationMessage {
  id: string;
  sender_wa_id: string;
  message_type: string;
  content: string | null;
  status: string;
  direction: "inbound" | "outbound";
  created_at: string;
}

interface ConversationSummary {
  sender_wa_id: string;
  last_message_at: string;
  message_count: number;
  last_message: string | null;
  direction: string;
}

export default function WhatsAppConversations() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");

  // Fetch all conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/whatsapp/conversations-list");
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (phone: string) => {
    setSelectedPhone(phone);
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/whatsapp/conversations?phone=${encodeURIComponent(phone)}`,
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.sender_wa_id.includes(searchPhone),
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Conversations List */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Conversations
          </h2>
          <input
            type="text"
            placeholder="Search phone number..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "600px" }}>
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              {loading ? "Loading conversations..." : "No conversations found"}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredConversations.map((conv) => (
                <li key={conv.sender_wa_id}>
                  <button
                    onClick={() => fetchMessages(conv.sender_wa_id)}
                    className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors ${
                      selectedPhone === conv.sender_wa_id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conv.sender_wa_id}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {conv.last_message || "(no text)"}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {conv.message_count} messages
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(conv.last_message_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={fetchConversations}
            disabled={loading}
            className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Message Thread */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
        {selectedPhone ? (
          <>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Conversation with {selectedPhone}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {messages.length} messages
              </p>
            </div>

            <div
              className="overflow-y-auto p-6 space-y-4 bg-gray-50"
              style={{ maxHeight: "600px" }}
            >
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  No messages in conversation
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.direction === "inbound"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.direction === "inbound"
                          ? "bg-white border border-gray-200 text-gray-900"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content || `[${msg.message_type}]`}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.direction === "inbound"
                            ? "text-gray-500"
                            : "text-blue-100"
                        }`}
                      >
                        {formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                        })}
                        {msg.direction === "outbound" && msg.status && (
                          <> • {msg.status}</>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">
                Choose a customer from the list to view messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
