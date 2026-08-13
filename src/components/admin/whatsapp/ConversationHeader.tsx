import React from "react";
import { User, RefreshCw, X, ShieldAlert } from "lucide-react";

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
  isWindowOpen?: boolean;
  windowExpiresAt?: string | null;
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
  isWindowOpen = false,
  windowExpiresAt,
}: ConversationHeaderProps) {
  const [windowTimeRemaining, setWindowTimeRemaining] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!windowExpiresAt) {
      setWindowTimeRemaining(null);
      return;
    }
    const expires = new Date(windowExpiresAt).getTime();
    const diffHours = Math.max(0, Math.round((expires - Date.now()) / (1000 * 60 * 60)));
    setWindowTimeRemaining(diffHours > 0 ? `${diffHours}h remaining` : "expiring soon");
  }, [windowExpiresAt]);

  return (
    <>
      <div className="px-4 py-2.5 bg-card dark:bg-[#202c33] flex items-center justify-between shrink-0 relative z-10 border-b border-border">
        <div className="flex items-center gap-3.5 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-muted dark:bg-[#dfe5e7] overflow-hidden flex items-center justify-center relative shrink-0">
            <User className="w-6 h-6 text-muted-foreground dark:text-[#8696a0] mt-1.5" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-medium text-foreground dark:text-[#e9edef] leading-tight mb-0.5">
                {selectedPhone}
              </h3>
              {isWindowOpen ? (
                <span
                  title={`24-hour customer window is active (${windowTimeRemaining || "Free text allowed"})`}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  24h Window Open {windowTimeRemaining ? `(${windowTimeRemaining})` : ""}
                </span>
              ) : (
                <span
                  title="More than 24 hours have passed since customer's last reply. WhatsApp requires a pre-approved template message to re-engage."
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20"
                >
                  <ShieldAlert className="w-3 h-3" />
                  24h Window Expired (Template Required)
                </span>
              )}
            </div>
            <p className="text-[13px] text-muted-foreground dark:text-[#8696a0] leading-tight">
              {headerStatus}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void fetchMessages(selectedPhone)}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground dark:text-[#aebac1] dark:hover:text-[#e9edef] p-2 rounded-full transition-colors disabled:opacity-50 flex items-center"
            title="Sync Messages"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setIsMessageSearchOpen(!isMessageSearchOpen);
              if (isMessageSearchOpen) setMessageSearchQuery("");
            }}
            className={`p-2 rounded-full transition-colors hidden sm:block ${isMessageSearchOpen ? "text-foreground bg-accent dark:text-[#e9edef] dark:bg-muted/50" : "text-muted-foreground hover:text-foreground dark:text-[#aebac1] dark:hover:text-[#e9edef]"}`}
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
              className={`p-2 rounded-full transition-colors ${isMenuOpen ? "text-foreground bg-accent dark:text-[#e9edef] dark:bg-muted/50" : "text-muted-foreground hover:text-foreground dark:text-[#aebac1] dark:hover:text-[#e9edef]"}`}
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
                <div className="absolute right-0 top-full mt-2 w-48 bg-card dark:bg-[#233138] border border-border rounded shadow-lg py-2 z-50 transform origin-top-right transition-all">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-foreground dark:text-[#d1d7db] hover:bg-accent dark:hover:bg-[#111b21] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact info
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-foreground dark:text-[#d1d7db] hover:bg-accent dark:hover:bg-[#111b21] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Select messages
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-foreground dark:text-[#d1d7db] hover:bg-accent dark:hover:bg-[#111b21] transition-colors"
                    onClick={() => void handleDeleteChat("clear")}
                  >
                    Clear chat
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-rose-500 dark:text-rose-400 hover:bg-accent dark:hover:bg-[#111b21] transition-colors"
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
        <div className="px-4 py-2 bg-card dark:bg-[#202c33] border-b border-border flex items-center shrink-0 z-10 transition-all">
          <div className="flex-1 bg-muted/50 dark:bg-[#2a3942] rounded flex items-center px-3 py-1.5 border border-border">
            <input
              type="text"
              placeholder="Search messages..."
              value={messageSearchQuery}
              onChange={(e) => setMessageSearchQuery(e.target.value)}
              className="bg-transparent text-foreground dark:text-[#e9edef] text-sm w-full focus:outline-none placeholder:text-muted-foreground dark:placeholder-[#8696a0]"
              autoFocus
            />
            {messageSearchQuery && (
              <button
                onClick={() => setMessageSearchQuery("")}
                className="text-muted-foreground hover:text-foreground dark:text-[#8696a0] dark:hover:text-[#e9edef] ml-2"
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
