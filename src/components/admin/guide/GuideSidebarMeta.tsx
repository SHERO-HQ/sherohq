"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Tag, Eye, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuideSidebarMetaProps {
  category: "hardware" | "software";
  onCategoryChange: (val: "hardware" | "software") => void;
  published: boolean;
  onPublishedChange: (val: boolean) => void;
}

export default function GuideSidebarMeta({
  category,
  onCategoryChange,
  published,
  onPublishedChange,
}: GuideSidebarMetaProps) {
  return (
    <div className="space-y-6">
      {/* Classification Card */}
      <Card className="bg-card border border-border p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Tag className="w-4 h-4 text-brand-secondary-400" />
          <h3 className="font-bold text-foreground text-sm">Classification</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Category *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as "hardware" | "software")}
              className="w-full bg-muted border-border text-foreground rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-secondary-500/50"
              required
            >
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Visibility Settings Card */}
      <Card className="bg-card border border-border p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Eye className="w-4 h-4 text-brand-secondary-400" />
          <h3 className="font-bold text-foreground text-sm">Visibility</h3>
        </div>

        <div className="space-y-4">
          {/* Publication State Checkbox/Card Control */}
          <div
            onClick={() => onPublishedChange(!published)}
            className={cn(
              "flex items-start gap-3 p-4 rounded border cursor-pointer transition-all duration-300 select-none",
              published
                ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-100"
                : "bg-muted/40 border-border text-muted-foreground hover:bg-muted/60"
            )}
          >
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => onPublishedChange(e.target.checked)}
              onClick={(e) => e.stopPropagation()} // Prevent double trigger
              className="w-4 h-4 rounded border-border bg-muted text-brand-secondary-500 focus:ring-brand-secondary-500 focus:ring-offset-slate-900 cursor-pointer mt-0.5"
            />
            <div className="space-y-1">
              <label
                htmlFor="published"
                className="text-sm font-semibold cursor-pointer block"
                onClick={(e) => e.stopPropagation()}
              >
                {published ? "Published" : "Draft"}
              </label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {published
                  ? "Visible to users immediately on the support center page."
                  : "Hidden from public view. Only administrators can view/edit."}
              </p>
            </div>
          </div>

          <div className="p-3 rounded bg-muted/30 border border-border flex gap-2">
            <Info className="w-4 h-4 shrink-0 text-brand-secondary-400 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Ensure you review markdown code rendering before publishing articles publicly.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
