"use client";
import { useState, useRef, useEffect } from "react";
import { Share2, Link, Check, X } from "lucide-react";
import { WhatsAppIcon } from "@/assets/icons/icons";

// SVG icon components moved to top level to avoid re-creation
const XIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface ShareButtonProps {
  url?: string;
  title: string;
  description?: string;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title,
  description = "",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shareUrl =
    url || (globalThis.window ? globalThis.window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleShare = async () => {
    // Use native Web Share API if available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or error - fall through to dropdown
      }
    }
    // Otherwise show dropdown
    setIsOpen(!isOpen);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch {
      console.error("Failed to copy link");
    }
  };

  const shareOptions = [
    {
      name: "Copy Link",
      icon: copied ? Check : Link,
      onClick: handleCopyLink,
      color: copied ? "text-emerald-500" : "text-slate-600 dark:text-slate-400",
    },
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "text-[#25D366]",
    },
    {
      name: "Twitter",
      icon: XIcon,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "text-slate-900 dark:text-white",
    },
    {
      name: "Facebook",
      icon: FacebookIcon,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "text-[#1877F2]",
    },
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={handleShare}
        className="cursor-pointer px-4 py-2 rounded border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all flex items-center justify-center gap-2"
        aria-label="Share this product"
      >
        <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Share via
            </span>
            <button onClick={() => setIsOpen(false)} className="cursor-pointer">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
            </button>
          </div>
          <div className="py-1">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              const baseClass =
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer";

              if (option.href) {
                return (
                  <a
                    key={option.name}
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={baseClass}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className={`w-4 h-4 ${option.color}`} />
                    <span className="text-slate-700 dark:text-slate-300">
                      {option.name}
                    </span>
                  </a>
                );
              }

              return (
                <button
                  key={option.name}
                  onClick={option.onClick}
                  className={baseClass}
                >
                  <Icon className={`w-4 h-4 ${option.color}`} />
                  <span className="text-slate-700 dark:text-slate-300">
                    {copied && option.name === "Copy Link"
                      ? "Copied!"
                      : option.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
