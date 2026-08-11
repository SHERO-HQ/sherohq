"use client";

import React from "react";
import { m, AnimatePresence } from "motion/react";
import {
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Package,
  Ticket,
  Calendar,
  Brain,
  Laptop,
} from "lucide-react";
import { ChatFloatingTrigger } from "./ChatFloatingTrigger";
import { ChatInputComposer } from "./ChatInputComposer";
import { ChatMessageList } from "./chat/ChatMessageList";
import { useAIChat } from "./chat/useAIChat";

export default function AIChatAssistant() {
  const {
    pathname,
    cart,
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized,
    messages,
    setMessages,
    input,
    setInput,
    isTyping,
    selectedImage,
    setSelectedImage,
    isRecording,
    isSpeaking,
    setIsSpeaking,
    fileInputRef,
    textInputRef,
    endOfMessagesRef,
    clearHistory,
    handleSend,
    handleFileChange,
    handleVoiceInput,
    processMessage,
  } = useAIChat();

  return (
    <>
      {/* Floating Action Button */}
      <ChatFloatingTrigger
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setIsMinimized={setIsMinimized}
      />

      {/* Chat Window */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <m.div
            data-version="v-refinement-v3-fix"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className={`fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-6 sm:right-6 z-60 w-full sm:w-100 border border-border bg-card flex flex-col overflow-hidden transition-all duration-300 ${
              isMinimized ? "h-16" : "h-150 sm:h-137.5 sm:rounded"
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-muted/50 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-brand-secondary-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-secondary-500 uppercase tracking-wider flex items-center">
                    SHERO
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-medium tracking-tight">
                    Support Assistant
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!isMinimized && messages.length > 1 && (
                  <button
                    onClick={clearHistory}
                    className="p-2 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                    title="Clear History"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 text-muted-foreground hover:text-brand-secondary-400 hover:bg-brand-secondary-500/10 rounded transition-colors hidden sm:block"
                >
                  {isMinimized ? (
                    <Maximize2 size={16} />
                  ) : (
                    <Minimize2 size={16} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick Actions (Sticky at Top) */}
            {!isMinimized && messages.length <= 1 && (
              <div className="px-4 py-2 flex flex-wrap gap-2 bg-muted/30 border-b border-border shrink-0">
                {(pathname?.includes("/product/")
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
                          { label: "Fix slow laptop", icon: Laptop },
                        ]
                ).map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      void processMessage(action.label);
                    }}
                    disabled={isTyping}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-card border border-border text-[10px] font-medium text-muted-foreground hover:border-brand-secondary-500 hover:text-brand-secondary-400 transition-all"
                  >
                    <action.icon
                      size={12}
                      className="text-brand-secondary-500"
                    />
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <ChatMessageList
                  messages={messages}
                  isTyping={isTyping}
                  setInput={setInput}
                  setMessages={setMessages}
                  processMessage={processMessage}
                  textInputRef={textInputRef}
                  endOfMessagesRef={endOfMessagesRef}
                />

                <ChatInputComposer
                  input={input}
                  setInput={setInput}
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                  isTyping={isTyping}
                  isRecording={isRecording}
                  isSpeaking={isSpeaking}
                  setIsSpeaking={setIsSpeaking}
                  handleSend={handleSend}
                  handleFileChange={handleFileChange}
                  handleVoiceInput={handleVoiceInput}
                  fileInputRef={fileInputRef}
                  textInputRef={textInputRef}
                />
              </>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
