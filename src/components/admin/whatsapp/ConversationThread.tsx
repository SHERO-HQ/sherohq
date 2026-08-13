import React from "react";
import { Loader2, ExternalLink, Check, CheckCheck, AlertTriangle } from "lucide-react";
import { ConversationMessage } from "./types";

interface ConversationThreadProps {
  loading: boolean;
  messages: ConversationMessage[];
  messageSearchQuery: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onSelectTemplate?: () => void;
}

const parseDateUTC = (dateStr: string) => {
  if (!dateStr) return new Date();
  const hasTimezone = /(Z|[+-]\d{2}:\d{2})$/.test(dateStr);
  const normalized = dateStr.includes("T")
    ? dateStr
    : dateStr.replace(" ", "T");
  return new Date(hasTimezone ? normalized : `${normalized}Z`);
};

export function ConversationThread({
  loading,
  messages,
  messageSearchQuery,
  messagesEndRef,
  onSelectTemplate,
}: ConversationThreadProps) {
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

  return (
    <div
      className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/20 dark:bg-[#0b141a] custom-scrollbar relative"
    >
      {loading && messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 text-brand-secondary-500 animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex justify-center py-4">
          <div className="bg-card text-muted-foreground text-xs px-4 py-1.5 rounded-lg shadow-sm border border-border">
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
                  className={`max-w-[85%] md:max-w-[75%] px-3 py-2 shadow-sm relative text-[14.2px] leading-5 ${
                    msg.direction === "inbound"
                      ? `bg-card text-foreground border border-border/60 dark:border-transparent dark:bg-[#202c33] dark:text-[#e9edef] rounded-lg ${isFirstInSequence ? "rounded-tl-none" : ""}`
                      : `bg-brand-secondary-600 text-white dark:bg-[#005c4b] dark:text-[#e9edef] rounded-lg ${isFirstInSequence ? "rounded-tr-none" : ""}`
                  }`}
                >
                  {isFirstInSequence && msg.direction === "inbound" && (
                    <svg
                      viewBox="0 0 8 13"
                      width="8"
                      height="13"
                      className="absolute top-0 -left-2 text-card dark:text-[#202c33]"
                    >
                      <path
                        opacity="1"
                        fill="currentColor"
                        d="M1.533 3.568L8 12.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z"
                      ></path>
                    </svg>
                  )}
                  {isFirstInSequence && msg.direction === "outbound" && (
                    <svg
                      viewBox="0 0 8 13"
                      width="8"
                      height="13"
                      className="absolute top-0 -right-2 text-brand-secondary-600 dark:text-[#005c4b]"
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
                      href={msg.metadata.rawMessage.referral.source_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-black/20 rounded p-2 mb-1.5 border-l-4 border-[#00a884] hover:bg-black/30 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[11px] font-medium text-[#00a884] flex items-center gap-1.5">
                          Via Facebook Ad
                        </p>
                        {msg.metadata.rawMessage.referral.source_url && (
                          <ExternalLink className="w-3 h-3 text-[#8696a0] group-hover:text-[#00a884] transition-colors" />
                        )}
                      </div>
                      {msg.metadata.rawMessage.referral.headline && (
                        <p className="text-[13px] text-[#e9edef] font-medium group-hover:text-foreground transition-colors">
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
                        {parseDateUTC(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {msg.direction === "outbound" && renderStatus(msg.status)}
                    </span>
                  </div>

                  {msg.error_message && (
                    <div className="text-[11px] text-rose-400 mt-1.5 flex flex-col gap-1 border-t border-border/50 pt-1.5">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>
                          {msg.error_code === "131047" || msg.error_message.includes("131047") || msg.error_message.includes("Re-engagement")
                            ? "24h Window Expired (Error 131047). A Meta Template is required."
                            : `${msg.error_message} ${msg.error_code ? `(${msg.error_code})` : ""}`}
                        </span>
                      </div>
                      {(msg.error_code === "131047" || msg.error_message.includes("131047") || msg.error_message.includes("Re-engagement")) && onSelectTemplate && (
                        <button
                          type="button"
                          onClick={onSelectTemplate}
                          className="text-[10px] text-amber-400 hover:text-amber-300 underline font-medium text-left mt-0.5 cursor-pointer flex items-center gap-1"
                        >
                          Use a pre-approved Meta Template to re-engage →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
