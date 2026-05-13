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
} from "lucide-react";
import { type ChatMessage, sendChatMessage } from "@/services/ai/chat";
import ProductCard from "@/components/products/ProductCard";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Package, Ticket, Calendar, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDialog } from "@/hooks/useDialog";

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
    "Hi! I'm your Shero Expert. How can I help you with IT solutions or products today?",
};

const LiveTrackingCard = ({
  id,
  type,
}: {
  id: string;
  type: "order" | "ticket";
}) => {
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url =
          type === "order"
            ? `/api/orders/track/${id}`
            : `/api/tickets/track/${id}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Tracking Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, type]);

  if (loading)
    return (
      <div className="mt-3 w-full p-3 bg-slate-50 border border-slate-200 rounded animate-pulse h-20" />
    );

  if (!data)
    return (
      <div className="mt-3 w-full p-3 bg-red-50 border border-red-100 rounded">
        <p className="text-[10px] font-bold text-red-600 uppercase">
          Tracking Failed
        </p>
        <p className="text-xs text-red-500">
          Could not find {type} #{id}
        </p>
      </div>
    );

  return (
    <div
      className={`mt-3 w-full p-3 ${type === "order" ? "bg-brand-secondary-50 border-brand-secondary-100" : "bg-blue-50 border-blue-100"} border rounded`}
    >
      <div className="flex items-center gap-3 mb-2">
        {type === "order" ? (
          <Package size={16} className="text-brand-secondary-600" />
        ) : (
          <Ticket size={16} className="text-blue-600" />
        )}
        <span
          className={`text-[10px] font-bold ${type === "order" ? "text-brand-secondary-600" : "text-blue-600"} uppercase`}
        >
          Live {type} Status
        </span>
      </div>
      <div
        className={`flex justify-between items-center bg-white p-2 rounded border ${type === "order" ? "border-brand-secondary-100" : "border-blue-100"}`}
      >
        <div>
          <p className="text-[10px] text-slate-500 uppercase">{type} ID</p>
          <p className="text-xs font-bold text-slate-800 tracking-tighter">
            #{data.ticket_no || data.id}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase">Status</p>
          <div
            className={`px-2 py-0.5 ${type === "order" ? "bg-brand-secondary-100 text-brand-secondary-700" : "bg-blue-100 text-blue-700"} rounded-full text-[9px] font-bold uppercase`}
          >
            {data.status}
          </div>
        </div>
      </div>
      {type === "order" && (
        <Link
          href={`/profile/orders`}
          className="mt-2 block text-center text-[10px] font-bold text-brand-secondary-600 hover:underline"
        >
          View Full Details
        </Link>
      )}
    </div>
  );
};

export default function AIChatAssistant() {
  const { addItem, setIsCartOpen } = useCart();
  const dialog = useDialog();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
        const response = await sendChatMessage({
          message: userMessage.content,
          history: historyForRequest,
          imageData: imageData,
        });

        setMessages((prev) => [...prev, response]);
        if (isSpeaking) speak(response.content);

        // ELITE: Automatic Cart Addition
        if (response.cartProduct) {
          // Try to find the product in the recommended list or dynamic catalog
          const productToAdd = response.recommendedProducts?.find((p) =>
            p.name.toLowerCase().includes(response.cartProduct!.toLowerCase()),
          );

          if (productToAdd) {
            addItem({
              id: productToAdd.id,
              name: productToAdd.name,
              price: productToAdd.price,
              image: productToAdd.image,
              category: productToAdd.category,
              sku: productToAdd.sku,
            });
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
              "I hit a temporary issue while processing that. Please retry in a moment.",
          },
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
          type: "audio/webm",
        });

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
      audioData: audioData,
    };

    // `message` carries the current user turn, so history should include prior turns only.
    const historyForRequest = messagesRef.current.slice(-15);

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await sendChatMessage({
        message: userMessage.content,
        history: historyForRequest,
        audioData: audioData,
      });

      setMessages((prev) => [...prev, response]);
      if (isSpeaking) speak(response.content);
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
              scale: 1,
            }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className={`fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-6 sm:right-6 z-60 w-full sm:w-100 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 flex flex-col overflow-hidden transition-all duration-300 ${
              isMinimized ? "h-16" : "h-150 sm:h-137.5 sm:rounded"
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-brand-secondary-600 dark:text-brand-secondary-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-brand-secondary-500 uppercase tracking-wider flex items-center">
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
                {[
                  { label: "Track my order", icon: Package },
                  { label: "Book consultation", icon: Calendar },
                  { label: "Fix slow laptop", icon: Brain },
                ].map((action) => (
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
                      className={`flex flex-col max-w-[85%] ${
                        msg.role === "user" ? "ml-auto" : "mr-auto"
                      }`}
                    >
                      <div
                        className={`p-3 rounded text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-white rounded-br-sm"
                            : "bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-bl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Recommend Products UI block */}
                      {msg.role === "assistant" &&
                        msg.recommendedProducts &&
                        msg.recommendedProducts.length > 0 && (
                          <div className="mt-3 flex overflow-x-auto gap-3 pb-4 -mx-2 px-2 no-scrollbar scroll-smooth w-full">
                            {msg.recommendedProducts.map((product) => (
                              <div
                                key={product.id}
                                className="w-45 sm:w-55 shrink-0 pointer-events-auto"
                              >
                                <ProductCard product={product} />
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Support Actions */}
                      {msg.role === "assistant" && msg.supportAction && (
                        <div className="mt-3 flex flex-col gap-2 w-full">
                          {msg.supportAction === "ticket" && (
                            <Link
                              href="/support"
                              className="w-full py-2 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white rounded text-center text-xs font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              Go to Support Page to Open Ticket
                              <ArrowRight size={14} />
                            </Link>
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
                                      "Glad I could help! Is there anything else you need?",
                                  },
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
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex flex-col gap-1.5 mr-auto">
                      <div className="w-12 h-8 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 rounded rounded-bl-sm flex items-center justify-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 bg-brand-secondary-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-brand-secondary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-brand-secondary-500 rounded-full animate-bounce"></span>
                      </div>
                      <span className="text-[9px] font-bold text-brand-secondary-500/70 animate-pulse ml-1">
                        SHERO IS THINKING...
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
                      {isRecording && (
                        <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20"
                          >
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            RECORDING... SPEAK NOW
                          </motion.div>
                        </div>
                      )}
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g. Need laptops for 5 designers, budget 12,000 GHS"
                        disabled={isTyping}
                        className="w-full pl-4 pr-26 py-3 bg-slate-100 dark:bg-black/20 border border-transparent dark:border-white/5 focus:border-brand-secondary-500/50 focus:bg-white rounded text-sm outline-none transition-all disabled:opacity-50"
                      />
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
                  <p className="text-[9px] text-center text-slate-400 mt-2">
                    AI can make mistakes. Verify critical specifications.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
