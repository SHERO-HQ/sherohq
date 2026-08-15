import React from "react";
import { MessageCircle, RefreshCw, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ConversationSummary } from "./types";

interface ConversationListProps {
  conversations: ConversationSummary[];
  searchPhone: string;
  setSearchPhone: (val: string) => void;
  refreshing: boolean;
  fetchConversations: () => void;
  selectedPhone: string | null;
  fetchMessages: (phone: string) => void;
}

const parseDateUTC = (dateStr: string) => {
  if (!dateStr) return new Date();
  const hasTimezone = /(Z|[+-]\d{2}:\d{2})$/.test(dateStr);
  const normalized = dateStr.includes("T")
    ? dateStr
    : dateStr.replace(" ", "T");
  return new Date(hasTimezone ? normalized : `${normalized}Z`);
};

export function ConversationList({
  conversations,
  searchPhone,
  setSearchPhone,
  refreshing,
  fetchConversations,
  selectedPhone,
  fetchMessages,
}: ConversationListProps) {
  const filteredConversations = conversations.filter((conv) =>
    conv.sender_wa_id.includes(searchPhone),
  );

  return (
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
          className="w-full px-3 py-2 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-secondary-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            {refreshing ? "Loading conversations..." : "No active chats found"}
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
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
                          { addSuffix: true },
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
                        {conv.last_message === "[button]" || conv.last_message === "[interactive]"
                          ? "🔘 Clicked a CTA button"
                          : conv.last_message || "(no text content)"}
                      </p>
                      {conv.unread_count > 0 ? (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-5 h-5">
                          {conv.unread_count}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground shrink-0">
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
  );
}
