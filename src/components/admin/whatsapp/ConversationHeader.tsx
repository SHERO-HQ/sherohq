import React from "react";
import { User, RefreshCw, X } from "lucide-react";

interface ConversationHeaderProps {
  selectedPhone: string;
  headerStatus: string;
  loading: boolean;
  fetchMessages: (phone: string) => void;
  isMessageSearchOpen: boolean;
  setIsMessageSearchOpen: (open: boolean) => void;
  setMessageSearchQuery: (query: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  handleDeleteChat: (action: "clear" | "delete") => Promise<void>;
  messageSearchQuery: string;
}

export function ConversationHeader({
  selectedPhone,
  headerStatus,
  loading,
  fetchMessages,
  isMessageSearchOpen,
  setIsMessageSearchOpen,
  setMessageSearchQuery,
  isMenuOpen,
  setIsMenuOpen,
  handleDeleteChat,
  messageSearchQuery,
}: ConversationHeaderProps) {
  return (
    <>
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
              {headerStatus}
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
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setIsMessageSearchOpen(!isMessageSearchOpen);
              if (isMessageSearchOpen) setMessageSearchQuery("");
            }}
            className={`p-2 rounded-full transition-colors hidden sm:block ${isMessageSearchOpen ? "text-[#e9edef] bg-muted/50" : "text-[#aebac1] hover:text-[#e9edef]"}`}
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
              className={`p-2 rounded-full transition-colors ${isMenuOpen ? "text-[#e9edef] bg-muted/50" : "text-[#aebac1] hover:text-[#e9edef]"}`}
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
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#233138] border border-border rounded shadow-lg py-2 z-50 transform origin-top-right transition-all">
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

      {isMessageSearchOpen && (
        <div className="px-4 py-2 bg-[#202c33] border-b border-black/20 flex items-center shrink-0 z-10 transition-all">
          <div className="flex-1 bg-[#2a3942] rounded flex items-center px-3 py-1.5 border border-border">
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
    </>
  );
}
