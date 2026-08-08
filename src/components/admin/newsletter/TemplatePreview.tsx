import React from "react";
import { format } from "date-fns";

interface TemplatePreviewProps {
  channel: "email" | "whatsapp" | "sms";
  content: string;
  params: string[];
}

export function TemplatePreview({ channel, content, params }: TemplatePreviewProps) {
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
      <div className="bg-[#efeae2] p-4 rounded-xl max-w-sm w-full mx-auto shadow-inner relative overflow-hidden flex flex-col h-full border border-border">
        {/* Fake WhatsApp Header */}
        <div className="absolute top-0 left-0 right-0 bg-[#005c4b] text-white px-4 py-2 flex items-center gap-3 shadow-md z-10">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold">ST</span>
          </div>
          <div>
            <h4 className="font-semibold text-sm">SHERO Tech</h4>
            <p className="text-[10px] opacity-80">Official Business Account</p>
          </div>
        </div>

        <div className="mt-14 overflow-y-auto custom-scrollbar flex flex-col gap-2 relative z-0 pb-4">
          {/* Date separator */}
          <div className="flex justify-center my-2">
            <span className="bg-[#e1f3fb] text-slate-600 text-[11px] px-2 py-0.5 rounded-lg shadow-sm">
              {format(new Date(), "MMMM d, yyyy")}
            </span>
          </div>
          
          {/* Message Bubble */}
          <div className="bg-white rounded-lg rounded-tl-sm p-2 shadow-sm text-[13px] text-slate-800 relative max-w-[90%] self-start">
            <p className="whitespace-pre-wrap leading-snug">{previewContent}</p>
            <div className="text-right mt-1">
              <span className="text-[10px] text-slate-400">
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
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full max-w-2xl mx-auto w-full">
        {/* Fake Email Header */}
        <div className="bg-accent/50 px-4 py-3 border-b border-border flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-secondary-500 text-white flex items-center justify-center font-bold">
                ST
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">SHERO Tech</span>
                <span className="text-[11px] text-muted-foreground">hello@sherotech.com</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{format(new Date(), "MMM d, h:mm a")}</span>
          </div>
          <div className="text-sm text-foreground">
            <span className="text-muted-foreground mr-2">To:</span> customer@example.com
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6 bg-white overflow-y-auto custom-scrollbar flex-1">
          <div 
            className="prose prose-sm max-w-none text-slate-800"
            dangerouslySetInnerHTML={{ __html: previewContent }}
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
