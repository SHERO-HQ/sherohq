import React from "react";
import { format } from "date-fns";
import { sanitizeHtml } from "@/lib/sanitize";

interface TemplatePreviewProps {
  channel: "email" | "whatsapp" | "sms";
  content: string;
  params: string[];
}

export function TemplatePreview({
  channel,
  content,
  params,
}: TemplatePreviewProps) {
  // Replace {{1}}, {{2}} with actual params
  let previewContent = content || "";

  if (channel === "whatsapp" || channel === "sms") {
    const matches = previewContent.match(/\{\{(\d+)\}\}/g) || [];
    matches.forEach((match) => {
      const index = parseInt(match.replace(/[{}]/g, "")) - 1;
      const paramValue = params[index] || `[Param ${index + 1}]`;
      previewContent = previewContent.replace(match, paramValue);
    });
  }

  if (channel === "whatsapp") {
    return (
      <div className="bg-[#efeae2] p-4 rounded max-w-sm w-full mx-auto shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col h-100 border border-border animate-in fade-in zoom-in-95 duration-300">
        {/* WhatsApp Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage:
              'url("https://w0.peakpx.com/wallpaper/744/545/HD-wallpaper-whatsapp-dark-texture-pattern.jpg")',
            backgroundSize: "cover",
          }}
        ></div>
        {/* Fake WhatsApp Header */}
        <div className="absolute top-0 left-0 right-0 bg-[#005c4b] text-foreground px-4 py-2 flex items-center gap-3 shadow-md z-10">
          <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold">ST</span>
          </div>
          <div>
            <h4 className="font-semibold text-sm">SHERO</h4>
            <p className="text-[10px] opacity-80">Official Business Account</p>
          </div>
        </div>

        <div className="mt-14 overflow-y-auto custom-scrollbar flex flex-col gap-2 relative z-0 pb-4">
          {/* Date separator */}
          <div className="flex justify-center my-2">
            <span className="bg-[#e1f3fb] text-slate-600 text-[11px] px-2 py-0.5 rounded shadow-sm">
              {format(new Date(), "MMMM d, yyyy")}
            </span>
          </div>

          {/* Message Bubble */}
          <div className="bg-white rounded rounded-tl-none p-2.5 shadow-sm text-[14px] text-[#111b21] relative max-w-[90%] self-start animate-in slide-in-from-bottom-2 duration-300">
            {/* Bubble Tail */}
            <div className="absolute top-0 -left-2 w-0 h-0 border-8 border-transparent border-t-white border-r-white"></div>

            <p className="whitespace-pre-wrap leading-snug tracking-tight">
              {previewContent}
            </p>
            <div className="text-right mt-1">
              <span className="text-[10px] text-muted-foreground">
                {format(new Date(), "HH:mm")}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (channel === "email") {
    // For email, we might have basic variable replacement if we use {{}} instead of standard EJS or liquid.
    // If the content is HTML, we should render it safely in an iframe or a sanitized div.
    return (
      <div className="bg-white border border-border rounded shadow-lg overflow-hidden flex flex-col h-125 max-w-2xl mx-auto w-full animate-in fade-in zoom-in-95 duration-300">
        {/* Fake Email Header */}
        <div className="bg-accent/50 px-4 py-3 border-b border-border flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-secondary-500 text-foreground flex items-center justify-center font-bold">
                ST
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">
                  SHERO Tech
                </span>
                <span className="text-[11px] text-muted-foreground">
                  hello@sherotech.com
                </span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(), "MMM d, h:mm a")}
            </span>
          </div>
          <div className="text-sm text-foreground">
            <span className="text-muted-foreground mr-2">To:</span>{" "}
            customer@example.com
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6 bg-white overflow-y-auto custom-scrollbar flex-1">
          <div
            className="prose prose-sm max-w-none text-slate-800"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(previewContent) }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded p-4 text-sm whitespace-pre-wrap font-mono">
      {previewContent}
    </div>
  );
}
