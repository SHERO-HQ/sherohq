import React from "react";
import { MessageSquare, Code, Send, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { TemplatePreview } from "../newsletter/TemplatePreview";
import { BUILTIN_WHATSAPP_TEMPLATES } from "./types";

interface MessageComposerProps {
  selectedPhone: string | null;
  handleSend: (e: React.FormEvent) => Promise<void>;
  sendType: "text" | "template";
  setSendType: (type: "text" | "template") => void;
  messageText: string;
  setMessageText: (text: string) => void;
  templateName: string;
  setTemplateName: (name: string) => void;
  templateLang: string;
  setTemplateLang: (lang: string) => void;
  templateParamsText: string;
  setTemplateParamsText: (text: string) => void;
  sending: boolean;
  dbTemplates: any[];
  isWindowOpen?: boolean;
}

export function MessageComposer({
  selectedPhone,
  handleSend,
  sendType,
  setSendType,
  messageText,
  setMessageText,
  templateName,
  setTemplateName,
  templateLang,
  setTemplateLang,
  templateParamsText,
  setTemplateParamsText,
  sending,
  dbTemplates,
  isWindowOpen = false,
}: MessageComposerProps) {
  if (!selectedPhone) return null;

  // Merge DB templates and builtin templates so presets are always available
  const allTemplates = [...dbTemplates];
  for (const builtin of BUILTIN_WHATSAPP_TEMPLATES) {
    if (!allTemplates.some((t) => t.name === builtin.name)) {
      allTemplates.push(builtin);
    }
  }

  return (
    <div className="p-4 border-t border-border bg-card shrink-0">
      {/* 24-Hour Window Closed Warning for Custom Text */}
      {!isWindowOpen && sendType === "text" && (
        <div className="mb-3 p-3 rounded bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-amber-500 dark:text-amber-400">
          <div className="flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">24-Hour Customer Window Expired</p>
              <p className="mt-0.5 text-muted-foreground text-[11px] leading-relaxed">
                WhatsApp blocks custom text messages outside the 24h window (<strong>Error 131047</strong>). You must send a pre-approved Meta Template to re-engage.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSendType("template");
              if (!templateName || templateName === "verification_code") {
                setTemplateName("customer_followup");
                setTemplateLang("en");
                setTemplateParamsText("there, Support Team");
              }
            }}
            className="px-3 py-1 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-black rounded transition-colors shrink-0 flex items-center gap-1 shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            Use Follow-Up Template
          </button>
        </div>
      )}

      <div className="flex bg-accent/50 p-1 rounded w-fit mb-4">
        <button
          type="button"
          onClick={() => setSendType("text")}
          className={`px-4 py-1.5 text-xs font-semibold rounded transition-all flex items-center gap-1.5 ${sendType === "text"
              ? "bg-card text-foreground shadow-sm border border-border/50"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Custom Text
        </button>
        <button
          type="button"
          onClick={() => setSendType("template")}
          className={`px-4 py-1.5 text-xs font-semibold rounded transition-all flex items-center gap-1.5 ${sendType === "template"
              ? "bg-card text-foreground shadow-sm border border-border/50"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
        >
          <Code className="w-3.5 h-3.5" />
          Meta Template {!isWindowOpen && "(Required)"}
        </button>
      </div>

      <form onSubmit={handleSend} className="space-y-3">
        {sendType === "text" ? (
          <div className="flex items-end gap-2 bg-accent/30 p-2 rounded border border-border/60">
            <textarea
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Type a message..."
              disabled={sending}
              rows={1}
              className="flex-1 px-4 py-3 bg-transparent text-sm text-foreground focus:outline-none disabled:opacity-50 placeholder:text-muted-foreground resize-none overflow-y-auto custom-scrollbar"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 shrink-0 mb-0.5"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4 bg-accent/20 p-5 rounded border border-border">
            {templateName && allTemplates.find((t) => t.name === templateName) && (
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Live Preview
                </label>
                <TemplatePreview
                  channel="whatsapp"
                  content={allTemplates.find((t) => t.name === templateName)?.content || ""}
                  params={templateParamsText ? templateParamsText.split(",").map((p) => p.trim()) : []}
                />
              </div>
            )}

            <div className="mb-4 pb-4 border-b border-border/50">
              <label
                className="block text-[11px] font-semibold text-muted-foreground mb-1.5"
                htmlFor="composer-template-preset"
              >
                Load Predefined Template
              </label>
              <select
                id="composer-template-preset"
                value={templateName}
                onChange={(e) => {
                  const t = allTemplates.find((x) => x.name === e.target.value);
                  if (t) {
                    setTemplateName(t.name);
                    setTemplateLang(t.whatsappTemplateLanguage || "en");
                    if (t.expectedParams && t.expectedParams.length > 0) {
                      setTemplateParamsText(
                        t.expectedParams.map((p: string) => `[${p}]`).join(", "),
                      );
                    } else {
                      setTemplateParamsText("");
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-card border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-secondary-500 transition-shadow appearance-none"
              >
                <option value="">-- Select a Template --</option>
                {allTemplates.map((t) => (
                  <option key={t.id || t.name} value={t.name}>
                    {t.name} {t.category ? `(${t.category})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-[11px] font-semibold text-muted-foreground mb-1.5"
                  htmlFor="composer-template-name"
                >
                  Template Name
                </label>
                <input
                  id="composer-template-name"
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="verification_code"
                  disabled={sending}
                  className="w-full px-3 py-2 bg-card border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-secondary-500 transition-shadow"
                />
              </div>
              <div>
                <label
                  className="block text-[11px] font-semibold text-muted-foreground mb-1.5"
                  htmlFor="composer-template-lang"
                >
                  Language Code
                </label>
                <input
                  id="composer-template-lang"
                  type="text"
                  value={templateLang}
                  onChange={(e) => setTemplateLang(e.target.value)}
                  placeholder="en"
                  disabled={sending}
                  className="w-full px-3 py-2 bg-card border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-secondary-500 transition-shadow"
                />
              </div>
            </div>
            <div>
              <label
                className="block text-[11px] font-semibold text-muted-foreground mb-1.5"
                htmlFor="composer-template-params"
              >
                Parameters (comma-separated variables, e.g. "123456")
              </label>
              <input
                id="composer-template-params"
                type="text"
                value={templateParamsText}
                onChange={(e) => setTemplateParamsText(e.target.value)}
                placeholder="e.g. 123456, GHS 50.00"
                disabled={sending}
                className="w-full px-3 py-2 bg-card border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-secondary-500 transition-shadow"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={sending || !templateName.trim()}
                className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground px-5 py-2 rounded font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 disabled:active:scale-100"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send Template
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
