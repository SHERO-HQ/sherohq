"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, User, ArrowRight, Calendar } from "lucide-react";
import type { ChatMessage } from "@/services/ai/chat";
import { ChatProductCard } from "./ChatProductCard";
import { LiveTrackingCard } from "./LiveTrackingCard";
import { ChatMarkdown } from "./ChatMarkdown";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  setInput: (val: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  processMessage: (msg: string) => Promise<void>;
  textInputRef: React.RefObject<HTMLInputElement | null>;
  endOfMessagesRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessageList({
  messages,
  isTyping,
  setInput,
  setMessages,
  processMessage,
  textInputRef,
  endOfMessagesRef,
}: ChatMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-2 max-w-[85%] items-end ${
            msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
          }`}
        >
          {/* Avatar */}
          <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] shadow-sm overflow-hidden border border-slate-200/50 dark:border-white/10">
            {msg.role === "assistant" ? (
              <div className="w-full h-full bg-brand-secondary-500 text-white flex items-center justify-center">
                <Sparkles size={12} />
              </div>
            ) : (
              <div className="w-full h-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <User size={12} />
              </div>
            )}
          </div>

          {/* Message Content Container */}
          <div
            className={`flex flex-col gap-2 min-w-0 flex-1 ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {msg.imageData && (
              <div className="relative max-w-50 rounded overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                <img
                  src={msg.imageData}
                  alt="User uploaded"
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            {msg.audioData && (
              <div className="rounded-full overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-700/50 bg-slate-100 dark:bg-slate-800 p-1">
                <audio controls src={msg.audioData} className="h-9 max-w-55" />
              </div>
            )}
            {msg.content && msg.content !== "[Audio Message]" ? (
              <div
                className={`px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl rounded-br-lg"
                    : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-lg"
                }`}
              >
                {msg.role === "user" ? (
                  msg.content
                ) : (
                  <ChatMarkdown content={msg.content} />
                )}
              </div>
            ) : msg.role === "assistant" && isTyping ? (
              <div className="flex items-center gap-2 px-2 py-1 mt-0.5">
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-brand-secondary-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-brand-secondary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-brand-secondary-500 rounded-full animate-bounce"></span>
                </div>
                <span className="text-[10px] font-bold text-brand-secondary-500/70 animate-pulse uppercase tracking-wide">
                  Shero is typing...
                </span>
              </div>
            ) : null}

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
                      setInput(
                        "Create ticket - Name: , Email: , Subject: , Message: ",
                      );
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
                      void processMessage("It didn't work. I need more help.")
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
                    <Calendar size={16} className="text-brand-secondary-400" />
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-brand-secondary-400 uppercase leading-none mb-1">
                        Solutions Consultation
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
                      <p className="text-[8px] font-mono text-slate-400 uppercase">
                        Consultation ID
                      </p>
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
                      <p className="text-[8px] font-mono text-slate-400 uppercase">
                        Ticket Number
                      </p>
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

      <div ref={endOfMessagesRef} className="h-2" />
    </div>
  );
}
