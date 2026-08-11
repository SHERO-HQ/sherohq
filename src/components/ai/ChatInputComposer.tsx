"use client";

import React from "react";
import { Image as ImageIcon, Mic, Volume2, Send, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputComposerProps {
  input: string;
  setInput: (val: string) => void;
  selectedImage: string | null;
  setSelectedImage: (val: string | null) => void;
  isTyping: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  setIsSpeaking: (val: boolean | ((prev: boolean) => boolean)) => void;
  handleSend: (e: React.FormEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVoiceInput: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  textInputRef: React.RefObject<HTMLInputElement | null>;
}

export function ChatInputComposer({
  input,
  setInput,
  selectedImage,
  setSelectedImage,
  isTyping,
  isRecording,
  isSpeaking,
  setIsSpeaking,
  handleSend,
  handleFileChange,
  handleVoiceInput,
  fileInputRef,
  textInputRef,
}: ChatInputComposerProps) {
  return (
    <div className="p-3 bg-card border-t border-border shrink-0">
      {/* Image Preview */}
      {selectedImage && (
        <div className="relative mb-3 inline-block">
          <div className="relative w-16 h-16 rounded overflow-hidden border border-border">
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

      <form onSubmit={handleSend} className="relative flex items-center gap-0.5">
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
          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-brand-secondary-500 rounded-full hover:bg-accent transition-colors disabled:opacity-50"
        >
          <ImageIcon size={18} />
        </button>
        <div className="flex-1 relative">
          {isRecording ? (
            <div className="w-full flex items-center justify-between px-4 py-2.5 bg-red-500/10 border border-red-500/35 rounded text-xs text-red-400 font-semibold select-none h-11 shrink-0">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                Listening... Speak now
              </span>
              <div className="flex items-center gap-0.5 h-4">
                <span className="w-0.5 bg-red-400 rounded-full animate-[pulse_0.8s_infinite]" style={{ height: "50%" }} />
                <span className="w-0.5 bg-red-400 rounded-full animate-[pulse_0.6s_infinite_0.1s]" style={{ height: "90%" }} />
                <span className="w-0.5 bg-red-400 rounded-full animate-[pulse_0.7s_infinite_0.2s]" style={{ height: "30%" }} />
                <span className="w-0.5 bg-red-400 rounded-full animate-[pulse_0.9s_infinite_0.3s]" style={{ height: "70%" }} />
                <span className="w-0.5 bg-red-400 rounded-full animate-[pulse_0.5s_infinite_0.4s]" style={{ height: "40%" }} />
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
              className="w-full pl-4 pr-26 py-3 bg-muted/50 border border-border focus:border-brand-secondary-500/50 focus:bg-card rounded text-sm text-foreground outline-none transition-all disabled:opacity-50"
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
                : "text-muted-foreground hover:text-brand-secondary-500 hover:bg-accent",
            )}
            title={isRecording ? "Stop Recording" : "Voice Input"}
          >
            <Mic size={16} />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSpeaking((prev) => {
                const newState = !prev;
                if (newState && typeof window !== "undefined" && "speechSynthesis" in window) {
                  const utterance = new SpeechSynthesisUtterance("");
                  window.speechSynthesis.speak(utterance);
                }
                return newState;
              });
            }}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-full transition-all",
              isSpeaking
                ? "bg-brand-secondary-500 text-white"
                : "text-muted-foreground hover:text-brand-secondary-500 hover:bg-accent",
            )}
            title="Voice Response (TTS)"
          >
            <Volume2 size={16} />
          </button>

          <button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || isTyping}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-brand-secondary-500 disabled:opacity-50 transition-colors pointer-events-auto"
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
        <p className="text-[9px] text-muted-foreground">
          AI can make mistakes. Verify critical specifications.
        </p>
        <p className="text-[9px] font-semibold text-muted-foreground flex items-center gap-1">
          Powered by Gemini{" "}
          <Sparkles size={10} className="text-brand-secondary-400" />
        </p>
      </div>
    </div>
  );
}
