"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  ArrowRight,
  Image as ImageIcon,
  Mic,
  Volume2,
  Trash2,
  User} from "lucide-react";
import { type ChatMessage, sendChatMessageStreaming } from "@/services/ai/chat";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Package, Ticket, Calendar, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDialog } from "@/hooks/useDialog";
import type { Product } from "@/types/product";
import AppImage from "@/components/common/AppImage";
import { } from "@/services/api";
import { ChatProductCard } from "./chat/ChatProductCard";
import { LiveTrackingCard } from "./chat/LiveTrackingCard";
import { ChatMarkdown } from "./chat/ChatMarkdown";

type TrackingData = {
  id?: string | number;
  ticket_no?: string | number;
  status?: string;
};

type TriggerDetail = {
  message?: string;
  open?: boolean;
};



const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  id: "initial",
  role: "assistant",
  content:
    "Hi! I'm your Shero Expert. How can I help you with IT solutions or products today?"};



export default function AIChatAssistant() {
  const pathname = usePathname();
  const { cart, addItem, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const dialog = useDialog();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [guestId, setGuestId] = useState("");

  useEffect(() => {
    let stored = localStorage.getItem("shero_ai_guest_id");
    if (!stored) {
      stored = "guest_" + crypto.randomUUID();
      localStorage.setItem("shero_ai_guest_id", stored);
    }
    setGuestId(stored);
  }, []);
  const [messages, setMessages] = useState<ChatMessage[]>([
    INITIAL_ASSISTANT_MESSAGE,
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const isInitialized = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([INITIAL_ASSISTANT_MESSAGE]);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Auto-scroll to latest
  useEffect(() => {
    if (isOpen && !isMinimized && endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  // ELITE: Persistence
  useEffect(() => {
    const savedHistory = localStorage.getItem("shoro_chat_history");
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to restore history", e);
      }
    }

    const savedInput = localStorage.getItem("shoro_chat_input");
    if (savedInput) {
      setInput(savedInput);
    }

    // Mark as initialized after restoration
    setTimeout(() => {
      isInitialized.current = true;
    }, 0);
  }, []);

  useEffect(() => {
    if (!isInitialized.current) return;
    localStorage.setItem(
      "shoro_chat_history",
      JSON.stringify(messages.slice(-15)),
    );
  }, [messages]);

  useEffect(() => {
    if (!isInitialized.current) return;
    localStorage.setItem("shoro_chat_input", input);
  }, [input]);

  useEffect(() => {
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      const key = event?.key?.toLowerCase();
      if (!key) return;

      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        setIsOpen(true);
        setIsMinimized(false);
      }

      if (key === "escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcuts);
    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcuts);
    };
  }, [isOpen]);

  const speak = useCallback(
    (text: string) => {
      if (!isSpeaking) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    },
    [isSpeaking],
  );

  const processMessage = useCallback(
    async (text: string, imageData?: string) => {
      const trimmedText = text.trim();
      if (!trimmedText && !imageData) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content:
          trimmedText ||
          "Please analyze this image and help me decide the best option.",
        imageData: imageData, // NEW: Support visual data
      };

      // `message` carries the current user turn, so history should include prior turns only.
      const historyForRequest = messagesRef.current.slice(-15);

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        const assistantMsgId = crypto.randomUUID();
        let fullText = "";

        // Add empty assistant message placeholder
        setMessages((prev) => [
          ...prev,
          { id: assistantMsgId, role: "assistant", content: "" },
        ]);

        const responseMetadata = await sendChatMessageStreaming(
          {
            message: userMessage.content,
            history: historyForRequest,
            imageData: imageData,
            context: {
              currentPath: pathname || "",
              cartItemIds: cart.map(item => item.id),
              sessionId: user?.id || guestId,
              user: user ? { id: user.id, name: user.name, email: user.email } : null
            }
          },
          (chunk) => {
            fullText += chunk;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? { ...msg, content: fullText }
                  : msg
              )
            );
          }
        );

        // Update the final message with metadata (products, actions)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, ...responseMetadata } : msg
          )
        );

        if (isSpeaking && fullText) speak(fullText);

        // ELITE: Automatic Cart Addition
        if (responseMetadata.cartProduct) {
          let productToAdd = responseMetadata.recommendedProducts?.find((p) =>
            p.name.toLowerCase().includes(responseMetadata.cartProduct!.toLowerCase()),
          );

          if (!productToAdd) {
            // Fallback: Fetch full catalog and scan
            try {
              const res = await fetch("/api/products");
              if (res.ok) {
                const products: Product[] = await res.json();
                productToAdd = products.find((p) =>
                  p.name.toLowerCase().includes(responseMetadata.cartProduct!.toLowerCase())
                );
              }
            } catch (e) {
              console.error("Failed to fetch full catalog for cart addition:", e);
            }
          }

          if (productToAdd) {
            addItem({
              id: productToAdd.id,
              name: productToAdd.name,
              price: productToAdd.price,
              image: productToAdd.image,
              category: productToAdd.category,
              sku: productToAdd.sku});
            setIsCartOpen(true);
          }
        }
      } catch (error) {
        console.error("AI chat error", error);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "I hit a temporary issue while processing that. Please retry in a moment."},
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [addItem, isSpeaking, setIsCartOpen, speak],
  );

  // PROACTIVE: Listen for external triggers
  useEffect(() => {
    const handleTrigger = (event: Event) => {
      const customEvent = event as CustomEvent<TriggerDetail>;
      const { message, open = true } = customEvent.detail || {};
      if (open) {
        setIsOpen(true);
        setIsMinimized(false);
      }
      if (message) {
        void processMessage(message);
      }
    };

    window.addEventListener("shoro-ai-trigger", handleTrigger);
    return () => window.removeEventListener("shoro-ai-trigger", handleTrigger);
  }, [processMessage]);

  const clearHistory = async () => {
    if (
      await dialog.confirm(
        "Are you sure you want to clear our conversation history?",
      )
    ) {
      setMessages([INITIAL_ASSISTANT_MESSAGE]);
      localStorage.removeItem("shoro_chat_history");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;
    const text = input;
    const img = selectedImage || undefined;

    setInput("");
    setSelectedImage(null);
    await processMessage(text, img);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const duration = Date.now() - recordingStartTimeRef.current;
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm"});

        /* Recording stopped */

        if (
          audioChunksRef.current.length === 0 ||
          duration < 500 ||
          audioBlob.size < 1000
        ) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          // Send audio directly to AI
          await processVoiceMessage(base64Audio);
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.onstart = () => {
        /* MediaRecorder started */
      };

      recorder.onerror = (event: Event) => {
        console.error("MediaRecorder error:", event);
        setIsRecording(false);
      };

      recorder.start();
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied or recorder init failed:", err);
      dialog.alert(
        "Microphone access is required for voice input. Please ensure you have granted permission.",
      );
    }
  };

  const processVoiceMessage = async (audioData: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: "[Audio Message]",
      audioData: audioData};

    // `message` carries the current user turn, so history should include prior turns only.
    const historyForRequest = messagesRef.current.slice(-15);

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const assistantMsgId = crypto.randomUUID();
      let fullText = "";

      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: "assistant", content: "" },
      ]);

      const responseMetadata = await sendChatMessageStreaming(
        {
          message: userMessage.content,
          history: historyForRequest,
          audioData: audioData},
        (chunk) => {
          fullText += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: fullText }
                : msg
            )
          );
        }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, ...responseMetadata } : msg
        )
      );

      if (isSpeaking && fullText) speak(fullText);
    } catch (error) {
      console.error("Voice processing error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="fixed bottom-20 right-6 z-50 p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:scale-105 transition-all group flex items-center justify-center"
            aria-label="AI Assistant"
          >
            <Sparkles className="w-6 h-6 animate-pulse text-brand-secondary-400 dark:text-brand-secondary-600" />
            <span className="max-w-0 overflow-hidden ml-0 whitespace-nowrap opacity-0 group-hover:max-w-xs group-hover:ml-2 group-hover:opacity-100 transition-all duration-300 font-medium tracking-tight text-sm">
              Ask <span className="text-brand-secondary-500">SHERO</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            data-version="v-refinement-v3-fix"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1}}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className={`fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-6 sm:right-6 z-60 w-full sm:w-100 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? "h-16" : "h-150 sm:h-137.5 sm:rounded"
              }`}
          >
            {/* Header */}
            <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-brand-secondary-600 dark:text-brand-secondary-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-secondary-500 uppercase tracking-wider flex items-center">
                    SHERO
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium tracking-tight">
                    Support Assistant
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!isMinimized && messages.length > 1 && (
                  <button
                    onClick={clearHistory}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-white/10 rounded transition-colors"
                    title="Clear History"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 text-slate-400 hover:text-brand-secondary-600 hover:bg-brand-secondary-50 dark:hover:bg-white/10 rounded transition-colors hidden sm:block"
                >
                  {isMinimized ? (
                    <Maximize2 size={16} />
                  ) : (
                    <Minimize2 size={16} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-white/10 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick Actions (Sticky at Top) */}
            {!isMinimized && messages.length <= 1 && (
              <div className="px-4 py-2 flex flex-wrap gap-2 bg-white/50 dark:bg-black/20 border-b border-slate-200 dark:border-white/10 shrink-0">
                {(
                  pathname?.includes("/product/") 
                    ? [
                        { label: "Compare with similar products", icon: Brain },
                        { label: "Is this compatible with...", icon: Sparkles },
                      ]
                    : pathname?.includes("/checkout") || cart.length > 0
                    ? [
                        { label: "Apply a discount code", icon: Package },
                        { label: "Estimate shipping", icon: Package },
                      ]
                    : pathname?.includes("/support")
                    ? [
                        { label: "Open a support ticket", icon: Ticket },
                        { label: "Troubleshooting guide", icon: Brain },
                      ]
                    : [
                        { label: "Track my order", icon: Package },
                        { label: "Book consultation", icon: Calendar },
                        { label: "Fix slow laptop", icon: Brain },
                      ]
                ).map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      void processMessage(action.label);
                    }}
                    disabled={isTyping}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:border-brand-secondary-500 hover:text-brand-secondary-600 transition-all"
                  >
                    <action.icon size={12} className="text-brand-secondary-500" />
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 max-w-[85%] items-end ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      {/* Avatar */}
                      <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] shadow-sm overflow-hidden border border-slate-200/50 dark:border-white/10">
                        {msg.role === "assistant" ? (
                          <div className="w-full h-full bg-brand-secondary-500 text-white flex items-center justify-center">
                            <Sparkles size={12} fill="currentColor" />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                            <User size={12} />
                          </div>
                        )}
                      </div>

                      {/* Message Content Container */}
                      <div className={`flex flex-col gap-2 min-w-0 flex-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        {msg.content && (
                          <div
                            className={`px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${msg.role === "user"
                              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl rounded-br-[4px]"
                              : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-[4px]"
                              }`}
                          >
                          {msg.role === "user" ? (
                            msg.content
                          ) : (
                            <ChatMarkdown content={msg.content} />
                          )}
                        </div>
                      )}

                      {/* Recommend Products UI block */}
                      {msg.role === "assistant" &&
                        msg.recommendedProducts &&
                        msg.recommendedProducts.length > 0 && (
                          <div className="mt-3 flex overflow-x-auto gap-3 pb-4 -mx-2 px-2 no-scrollbar scroll-smooth w-full">
                            {msg.recommendedProducts.map((product) => (
                              <div
                                key={product.id}
                                className="w-40 sm:w-48 shrink-0 pointer-events-auto"
                              >
                                <ChatProductCard product={product} />
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Support Actions */}
                      {msg.role === "assistant" && msg.supportAction && (
                        <div className="mt-3 flex flex-col gap-2 w-full">
                          {msg.supportAction === "ticket" && (
                            <button
                              onClick={() => {
                                setInput("Create ticket - Name: , Email: , Subject: , Message: ");
                                setTimeout(() => textInputRef.current?.focus(), 50);
                              }}
                              className="w-full py-2 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white rounded text-center text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                            >
                              Open Support Ticket Inline
                              <ArrowRight size={14} />
                            </button>
                          )}
                          {msg.supportAction === "contact" && (
                            <Link
                              href="/contact"
                              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded text-center text-xs font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              Contact Support Team
                              <ArrowRight size={14} />
                            </Link>
                          )}
                        </div>
                      )}

                      {/* Guide/Solution Suggestion */}
                      {msg.role === "assistant" && msg.guideSlug && (
                        <div className="mt-3 w-full flex flex-col gap-2">
                          <Link
                            href={`/support/guides/${msg.guideSlug}`}
                            className="block p-3 bg-blue-50 border border-blue-100 rounded hover:bg-blue-100 transition-colors group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
                                <Sparkles size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] uppercase font-bold text-blue-600 mb-0.5">
                                  Suggested Solution
                                </p>
                                <p className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-700">
                                  View Troubleshooting Guide
                                </p>
                                <p className="text-[10px] text-slate-500 line-clamp-1">
                                  Step-by-step resolution steps
                                </p>
                              </div>
                              <ArrowRight
                                size={14}
                                className="text-blue-400 group-hover:translate-x-1 transition-transform"
                              />
                            </div>
                          </Link>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setMessages((prev) => [
                                  ...prev,
                                  {
                                    id: crypto.randomUUID(),
                                    role: "assistant",
                                    content:
                                      "Glad I could help! Is there anything else you need?"},
                                ]);
                              }}
                              className="flex-1 py-1.5 px-3 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-600 hover:bg-brand-secondary-50 hover:border-brand-secondary-200 hover:text-brand-secondary-700 transition-all font-mono tracking-tighter"
                            >
                              YES, SOLVED
                            </button>
                            <button
                              onClick={() =>
                                processMessage(
                                  "It didn't work. I need more help.",
                                )
                              }
                              className="flex-1 py-1.5 px-3 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all font-mono tracking-tighter"
                            >
                              NO, NEED HELP
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ELITE: Order Tracking Card */}
                      {msg.role === "assistant" && msg.trackOrder && (
                        <LiveTrackingCard id={msg.trackOrder} type="order" />
                      )}

                      {/* ELITE: Ticket Tracking Card */}
                      {msg.role === "assistant" && msg.trackTicket && (
                        <LiveTrackingCard id={msg.trackTicket} type="ticket" />
                      )}

                      {/* ELITE: Booking Trigger */}
                      {msg.role === "assistant" && msg.bookStore && (
                        <div className="mt-3 w-full">
                          <Link
                            href="/consultation"
                            className="flex items-center justify-between p-3 bg-slate-900 text-white rounded hover:bg-black transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <Calendar
                                size={16}
                                className="text-brand-secondary-400"
                              />
                              <div className="text-left">
                                <p className="text-[10px] font-bold text-brand-secondary-400 uppercase leading-none mb-1">
                                  Elite Consultation
                                </p>
                                <p className="text-xs font-medium opacity-90 tracking-tight">
                                  Schedule Professional Call
                                </p>
                              </div>
                            </div>
                            <ArrowRight
                              size={16}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </Link>
                        </div>
                      )}

                      {/* ELITE: Direct Booking Confirmation Card */}
                      {msg.role === "assistant" && msg.bookDirect && (
                        <div className="mt-3 w-full p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded flex flex-col gap-2.5 shadow-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] shrink-0 shadow-sm animate-pulse">
                              ✓
                            </div>
                            <span className="text-[10px] font-extrabold font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                              Appointment Confirmed
                            </span>
                          </div>
                          <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded border border-emerald-100/50 dark:border-emerald-900/20 text-left flex flex-col gap-1.5 shadow-2xs">
                            <div className="flex justify-between items-start gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-0.5">
                              <div>
                                <p className="text-[8px] font-mono text-slate-400 uppercase">Consultation ID</p>
                                <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 tracking-tighter">
                                  #{msg.bookDirect.id?.slice(0, 8)}
                                </p>
                              </div>
                              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[8px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                                {msg.bookDirect.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-[8px] text-slate-400 uppercase">Service</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                  {msg.bookDirect.service}
                                </p>
                              </div>
                              <div>
                                <p className="text-[8px] text-slate-400 uppercase">Client</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                  {msg.bookDirect.name}
                                </p>
                              </div>
                              <div>
                                <p className="text-[8px] text-slate-400 uppercase">Date</p>
                                <p className="font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                                  {msg.bookDirect.date}
                                </p>
                              </div>
                              <div>
                                <p className="text-[8px] text-slate-400 uppercase">Time</p>
                                <p className="font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                                  {msg.bookDirect.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ELITE: Direct Ticket Confirmation Card */}
                      {msg.role === "assistant" && msg.ticketDirect && (
                        <div className="mt-3 w-full p-3.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded flex flex-col gap-2.5 shadow-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] shrink-0 shadow-sm animate-pulse">
                              ✓
                            </div>
                            <span className="text-[10px] font-extrabold font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                              Support Ticket Opened
                            </span>
                          </div>
                          <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded border border-blue-100/50 dark:border-blue-900/20 text-left flex flex-col gap-1.5 shadow-2xs">
                            <div className="flex justify-between items-start gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-0.5">
                              <div>
                                <p className="text-[8px] font-mono text-slate-400 uppercase">Ticket Number</p>
                                <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 tracking-tighter">
                                  #{msg.ticketDirect.ticket_no}
                                </p>
                              </div>
                              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-[8px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                                {msg.ticketDirect.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-[8px] text-slate-400 uppercase">Subject</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">
                                  {msg.ticketDirect.subject}
                                </p>
                              </div>
                              <div>
                                <p className="text-[8px] text-slate-400 uppercase">Category</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                  {msg.ticketDirect.category}
                                </p>
                              </div>
                              <div>
                                <p className="text-[8px] text-slate-400 uppercase">Created For</p>
                                <p className="font-semibold text-slate-700 dark:text-slate-300 leading-tight truncate">
                                  {msg.ticketDirect.name}
                                </p>
                              </div>
                              <div>
                                <p className="text-[8px] text-slate-400 uppercase">Priority</p>
                                <p className="font-semibold text-slate-700 dark:text-slate-300 leading-tight uppercase">
                                  {msg.ticketDirect.priority}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-2 mr-auto px-2 py-1">
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-brand-secondary-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-brand-secondary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-brand-secondary-500 rounded-full animate-bounce"></span>
                      </div>
                      <span className="text-[10px] font-bold text-brand-secondary-500/70 animate-pulse uppercase tracking-wide">
                        Shero is typing...
                      </span>
                    </div>
                  )}

                  <div ref={endOfMessagesRef} className="h-2" />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 shrink-0">
                  {/* Image Preview */}
                  {selectedImage && (
                    <div className="relative mb-3 inline-block">
                      <div className="relative w-16 h-16 rounded overflow-hidden border border-slate-200 dark:border-white/20">
                        <img
                          src={selectedImage}
                          alt="Selected"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}

                  <form
                    onSubmit={handleSend}
                    className="relative flex items-center gap-0.5"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isTyping}
                      className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-brand-secondary-500 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      <ImageIcon size={18} />
                    </button>
                    <div className="flex-1 relative">
                      {isRecording ? (
                        <div className="w-full flex items-center justify-between px-4 py-2.5 bg-red-500/10 dark:bg-red-500/5 border border-red-500/35 rounded text-xs text-red-650 dark:text-red-400 font-semibold select-none h-11 shrink-0">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            Listening... Speak now
                          </span>
                          <div className="flex items-center gap-0.5 h-4">
                            <span className="w-0.5 bg-red-550 dark:bg-red-400 rounded-full animate-[pulse_0.8s_infinite]" style={{ height: '50%' }} />
                            <span className="w-0.5 bg-red-550 dark:bg-red-400 rounded-full animate-[pulse_0.6s_infinite_0.1s]" style={{ height: '90%' }} />
                            <span className="w-0.5 bg-red-550 dark:bg-red-400 rounded-full animate-[pulse_0.7s_infinite_0.2s]" style={{ height: '30%' }} />
                            <span className="w-0.5 bg-red-550 dark:bg-red-400 rounded-full animate-[pulse_0.9s_infinite_0.3s]" style={{ height: '70%' }} />
                            <span className="w-0.5 bg-red-550 dark:bg-red-400 rounded-full animate-[pulse_0.5s_infinite_0.4s]" style={{ height: '40%' }} />
                          </div>
                        </div>
                      ) : (
                        <input
                          ref={textInputRef}
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="e.g. Need laptops for 5 designers, budget 12,000 GHS"
                          disabled={isTyping}
                          className="w-full pl-4 pr-26 py-3 bg-slate-100 dark:bg-black/20 border border-transparent dark:border-white/5 focus:border-brand-secondary-500/50 focus:bg-white rounded text-sm outline-none transition-all disabled:opacity-50"
                        />
                      )}
                    </div>

                    <div className="absolute right-1 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleVoiceInput}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-full transition-all",
                          isRecording
                            ? "bg-red-500 text-white animate-pulse"
                            : "text-slate-400 hover:text-brand-secondary-500 hover:bg-slate-100 dark:hover:bg-white/5",
                        )}
                        title={isRecording ? "Stop Recording" : "Voice Input"}
                      >
                        <Mic size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsSpeaking(!isSpeaking)}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-full transition-all",
                          isSpeaking
                            ? "bg-brand-secondary-500 text-white"
                            : "text-slate-400 hover:text-brand-secondary-500 hover:bg-slate-100 dark:hover:bg-white/5",
                        )}
                        title="Voice Response (TTS)"
                      >
                        <Volume2 size={16} />
                      </button>

                      <button
                        type="submit"
                        disabled={(!input.trim() && !selectedImage) || isTyping}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-brand-secondary-500 disabled:opacity-50 transition-colors pointer-events-auto"
                      >
                        <Send
                          size={18}
                          className={
                            input.trim() || selectedImage
                              ? "fill-brand-secondary-500 text-brand-secondary-500"
                              : ""
                          }
                        />
                      </button>
                    </div>
                  </form>
                  <div className="flex items-center justify-between mt-2 px-1">
                    <p className="text-[9px] text-slate-400">
                      AI can make mistakes. Verify critical specifications.
                    </p>
                    <p className="text-[9px] font-semibold text-slate-400 flex items-center gap-1">
                      Powered by Gemini <Sparkles size={10} className="text-brand-secondary-400" />
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
