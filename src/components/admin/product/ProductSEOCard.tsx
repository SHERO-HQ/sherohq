"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductSEOCardProps {
  productData: Partial<Product>;
  onUpdateProductData: (updates: Partial<Product>) => void;
}

export default function ProductSEOCard({
  productData,
  onUpdateProductData,
}: ProductSEOCardProps) {
  const handleInputChange = (field: keyof Product, value: string) => {
    onUpdateProductData({ [field]: value });
  };

  const previewTitle = productData.metaTitle || productData.name || "Product Name";
  const previewDescription = productData.metaDescription || productData.description?.slice(0, 155) || "A great description of your product goes here...";
  const previewSlug = productData.slug || "product-slug";

  return (
    <Card className="bg-slate-900 border border-white/5 p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <Search className="w-5 h-5 text-brand-secondary-400" />
        <h3 className="text-lg font-bold text-white">Search Engine Optimization</h3>
      </div>

      <p className="text-sm text-slate-400">
        Improve your ranking and how your product page will appear in search engines results.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4">
          {/* Meta Title */}
          <div className="space-y-2">
            <label
              htmlFor="metaTitle"
              className="text-sm font-medium text-slate-400 flex justify-between"
            >
              <span>Meta Title</span>
              <span className="text-xs text-slate-500">{productData.metaTitle?.length || 0}/60</span>
            </label>
            <Input
              id="metaTitle"
              placeholder="Leave blank to use Product Name"
              value={productData.metaTitle || ""}
              onChange={(e) => handleInputChange("metaTitle", e.target.value)}
              maxLength={60}
              className="bg-slate-800/50 border-white/5 text-white focus-visible:ring-brand-secondary-500"
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <label
              htmlFor="metaDescription"
              className="text-sm font-medium text-slate-400 flex justify-between"
            >
              <span>Meta Description</span>
              <span className="text-xs text-slate-500">{productData.metaDescription?.length || 0}/160</span>
            </label>
            <textarea
              id="metaDescription"
              placeholder="Leave blank to use the start of your product description"
              value={productData.metaDescription || ""}
              onChange={(e) => handleInputChange("metaDescription", e.target.value)}
              maxLength={160}
              className="w-full h-24 bg-slate-800/50 border border-white/5 rounded p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50 resize-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Google Preview Box */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Search Engine Preview</label>
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
