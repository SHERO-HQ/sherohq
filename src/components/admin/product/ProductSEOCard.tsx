"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import type { ProductFormValues } from "@/lib/validations/product";

export default function ProductSEOCard() {
  const { register, watch } = useFormContext<ProductFormValues>();

  const name = watch("name");
  const description = watch("description");
  const metaTitle = watch("metaTitle");
  const metaDescription = watch("metaDescription");
  const slug = watch("slug");

  const previewTitle = metaTitle || name || "Product Name";
  const previewDescription = metaDescription || description?.slice(0, 155) || "A great description of your product goes here...";
  const previewSlug = slug || "product-slug";

  return (
    <Card className="bg-card border border-border p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Search className="w-5 h-5 text-brand-secondary-400" />
        <h3 className="text-lg font-bold text-foreground">Search Engine Optimization</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Improve your ranking and how your product page will appear in search engines results.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4">
          {/* Meta Title */}
          <div className="space-y-2">
            <label
              htmlFor="metaTitle"
              className="text-sm font-medium text-muted-foreground flex justify-between"
            >
              <span>Meta Title</span>
              <span className="text-xs text-muted-foreground">{metaTitle?.length || 0}/60</span>
            </label>
            <Input
              id="metaTitle"
              placeholder="Leave blank to use Product Name"
              {...register("metaTitle")}
              maxLength={60}
              className="bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500"
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <label
              htmlFor="metaDescription"
              className="text-sm font-medium text-muted-foreground flex justify-between"
            >
              <span>Meta Description</span>
              <span className="text-xs text-muted-foreground">{metaDescription?.length || 0}/160</span>
            </label>
            <textarea
              id="metaDescription"
              placeholder="Leave blank to use the start of your product description"
              {...register("metaDescription")}
              maxLength={160}
              className="w-full h-24 bg-muted/50 border border-border rounded p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50 resize-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Google Preview Box */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Search Engine Preview</label>
          <div className="bg-white rounded p-5 shadow-sm space-y-1 font-sans">
            <p className="text-[12px] text-[#202124] flex items-center gap-2 overflow-hidden">
              <span className="bg-slate-200 rounded-full w-4 h-4 shrink-0 inline-block"></span>
              <span className="shrink-0">Sherotech</span>
              <span className="text-[#5f6368] truncate">
                {' › products › '}{previewSlug}
              </span>
            </p>
            <h4 className="text-[#1a0dab] text-lg font-medium hover:underline cursor-pointer truncate">
              {previewTitle}
            </h4>
            <p className="text-[#4d5156] text-sm leading-snug line-clamp-2">
              {previewDescription}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
