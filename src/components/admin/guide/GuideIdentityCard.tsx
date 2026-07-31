"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Info, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-card/50 rounded animate-pulse" />
  ),
});

interface GuideIdentityCardProps {
  title: string;
  onTitleChange: (val: string) => void;
  summary: string;
  onSummaryChange: (val: string) => void;
  content: string;
  onContentChange: (val: string) => void;
  errors?: Record<string, string>;
}

export default function GuideIdentityCard({
  title,
  onTitleChange,
  summary,
  onSummaryChange,
  content,
  onContentChange,
  errors = {},
}: GuideIdentityCardProps) {
  return (
    <Card className={cn(
      "bg-card border border-border p-6 md:p-8 space-y-6 transition-all duration-300",
      (errors.title || errors.content) && "border-rose-500/30 bg-rose-500/2"
    )}>
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <FileText className="w-5 h-5 text-brand-secondary-400" />
        <h3 className="text-lg font-bold text-foreground">Guide Content</h3>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-muted-foreground text-sm font-medium">
            Guide Title *
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. How to Install RAM on Enterprise Servers"
            className={cn(
              "bg-muted/50 border-border text-foreground placeholder:text-slate-600 focus-visible:ring-brand-secondary-500",
              errors.title && "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500"
            )}
            required
          />
          {errors.title && (
            <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
              {errors.title}
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <Label htmlFor="summary" className="text-muted-foreground text-sm font-medium">
            Summary (Optional)
          </Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => onSummaryChange(e.target.value)}
            placeholder="A brief explanation of this guide displayed on listings..."
            className="bg-muted/50 border-border text-foreground placeholder:text-slate-600 min-h-20 focus-visible:ring-brand-secondary-500"
            rows={3}
          />
        </div>

        {/* Content (Markdown Editor) */}
        <div className="space-y-2" data-color-mode="dark">
          <Label htmlFor="content" className="text-muted-foreground text-sm font-medium">
            Detailed Content * (Markdown Supported)
          </Label>
          <div className={cn(
            "rounded border border-border overflow-hidden",
            errors.content && "border-rose-500"
          )}>
            <MDEditor
              value={content}
              onChange={(val) => onContentChange(val || "")}
              height={400}
              preview="edit"
              hideToolbar={false}
            />
          </div>
          {errors.content && (
            <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
              {errors.content}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
            <Info className="w-3.5 h-3.5 shrink-0 text-brand-secondary-400" />
            Markdown layout is active. Use standard markdown symbols like # for titles, ** for bold text.
          </p>
        </div>
      </div>
    </Card>
  );
}
