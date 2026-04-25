import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
 image?: string;
 className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
 url,
 title,
 description = "",
 image,
 className = "",
}) => {
 const [isOpen, setIsOpen] = useState(false);
 const [copied, setCopied] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);

 const [currentUrl, setCurrentUrl] = useState("");

 useEffect(() => {
 if (typeof window !== "undefined") {
 setCurrentUrl(url || window.location.href);
 }
 }, [url]);

 const resolvedShareUrl = currentUrl;
 const encodedUrl = encodeURIComponent(resolvedShareUrl);
 const encodedTitle = encodeURIComponent(title);

 // Resolve absolute image URL for external sharing
 const resolvedImageUrl = useMemo(() => {
 if (!image) return "";
 if (image.startsWith("http")) return image;
 if (typeof window !== "undefined") {
 if (image.startsWith("/")) return `${window.location.origin}${image}`;
 return `${window.location.origin}/${image}`;
 }
 return image;
 }, [image]);

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

 const handleToggleDropdown = (e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 setIsOpen((prev) => !prev);
 };

 const handleNativeShare = async () => {
 if (typeof navigator === "undefined" || !navigator.share) return;

 try {
 const shareData: ShareData = {
 title,
 text: description || `Check out ${title} on SHERO`,
 url: resolvedShareUrl,
 };

 // Handle image sharing if supported
 if (resolvedImageUrl && navigator.canShare) {
 try {
 const response = await fetch(resolvedImageUrl, { mode: "cors" });
 const blob = await response.blob();
 const file = new File([blob], "product-image.png", { type: blob.type });
 
 if (navigator.canShare({ files: [file] })) {
 await navigator.share({
 ...shareData,
 files: [file]
 });
 setIsOpen(false);
 return;
 }
 } catch (err) {
 console.error("Failed to fetch image for sharing:", err);
 // Fallback to text-only share below
 }
 }

 await navigator.share(shareData);
 setIsOpen(false);
 } catch (err) {
 // User cancelled or share was blocked
 console.log("Share cancelled or failed:", err);
 }
 };

 const handleCopyLink = async () => {
 if (!resolvedShareUrl) return;

 try {
 if (navigator.clipboard?.writeText) {
 await navigator.clipboard.writeText(resolvedShareUrl);
 } else {
 const textArea = document.createElement("textarea");
 textArea.value = resolvedShareUrl;
 textArea.style.position = "fixed";
 textArea.style.left = "-9999px";
 document.body.appendChild(textArea);
 textArea.focus();
 textArea.select();
 const successful = document.execCommand("copy");
 document.body.removeChild(textArea);

 if (!successful) {
 throw new Error("Copy command failed");
 }
 }

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
  color: copied ? "text-brand-secondary-500" : "text-slate-600 dark:text-slate-400",
  },
  {
  name: "WhatsApp",
  icon: WhatsAppIcon,
  href: `https://wa.me/?text=${encodeURIComponent(`🛍️ *${description || `Check out ${title} on SHERO`}*\n\n🔗 ${resolvedShareUrl}`)}`,
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

 const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

 return (
 <div className={`relative ${className}`} ref={dropdownRef}>
 <button
 onClick={handleToggleDropdown}
 className="cursor-pointer px-4 py-2 rounded border-2 border-slate-200 dark:border-slate-700 hover:border-brand-secondary-500 transition flex items-center justify-center gap-2"
 aria-label="Share this product"
 >
 <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
 </button>

 {/* Dropdown */}
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 transition={{ duration: 0.2, ease: "easeOut" }}
 className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded shadow border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
 >
 <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5">
 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
 Share Product
 </span>
 <button onClick={() => setIsOpen(false)} className="cursor-pointer p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
 <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
 </button>
 </div>
 
 <div className="p-1.5">
 {canNativeShare && (
 <button
 onClick={handleNativeShare}
 className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded hover:bg-brand-secondary-500/10 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition group/native"
 >
 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover/native:bg-brand-secondary-500/20 transition-colors">
 <Share2 className="w-4 h-4" />
 </div>
 <div className="flex flex-col items-start">
 <span className="text-slate-700 dark:text-slate-300">System Share</span>
 <span className="text-[9px] font-normal text-slate-500">Device native dialog</span>
 </div>
 </button>
 )}

 <div className={`grid ${canNativeShare ? "grid-cols-1 pt-1.5 border-t border-slate-100 dark:border-white/5 mt-1.5" : "grid-cols-1"}`}>
 {shareOptions.map((option) => {
 const Icon = option.icon;
 const baseClass = "w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white";

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
 <div className={`w-8 h-8 flex items-center justify-center ${option.color}`}>
 <Icon className="w-4 h-4" />
 </div>
 {option.name}
 </a>
 );
 }

 return (
 <button
 key={option.name}
 onClick={option.onClick}
 className={baseClass}
 >
 <div className={`w-8 h-8 flex items-center justify-center ${option.color}`}>
 <Icon className="w-4 h-4" />
 </div>
 {copied && option.name === "Copy Link" ? "Copied to Clipboard" : option.name}
 </button>
 );
 })}
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
};

export default ShareButton;
