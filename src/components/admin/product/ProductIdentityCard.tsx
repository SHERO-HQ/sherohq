"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductIdentityCardProps {
  productData: Partial<Product>;
  onUpdateProductData: (updates: Partial<Product>) => void;
  errors?: Record<string, string>;
}

export default function ProductIdentityCard({
  productData,
  onUpdateProductData,
  errors = {},
}: ProductIdentityCardProps) {
  const handleInputChange = (field: keyof Product, value: string) => {
    onUpdateProductData({ [field]: value });
  };

  const handleSlugChange = (value: string) => {
    const sanitized = value
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/(^-|-$)/g, "");
    onUpdateProductData({ slug: sanitized });
  };

  return (
    <Card className={cn(
      "bg-slate-900 border border-white/5 p-6 md:p-8 space-y-6 transition-all duration-300",
      (errors.name || errors.description) && "border-rose-500/30 bg-rose-500/2"
    )}>
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <Info className="w-5 h-5 text-brand-secondary-400" />
        <h3 className="text-lg font-bold text-white">General Information</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-slate-400"
            >
              Product Name *
            </label>
            <Input
              id="name"
              placeholder="e.g. MacBook Pro M3"
              value={productData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={cn(
                "bg-slate-800/50 border-white/5 text-white focus-visible:ring-brand-secondary-500",
                errors.name && "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500"
              )}
              required
            />
            {errors.name && (
              <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <label
              htmlFor="sku"
              className="text-sm font-medium text-slate-400"
            >
              SKU (Optional)
            </label>
            <Input
              id="sku"
              placeholder="e.g. LAP-MAC-16M3"
              value={productData.sku || ""}
              onChange={(e) => handleInputChange("sku", e.target.value)}
              className="bg-slate-800/50 border-white/5 text-white focus-visible:ring-brand-secondary-500 font-mono"
            />
            <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
              Leave blank to auto-generate based on Product ID.
            </p>
          </div>

          {/* URL Slug */}
          <div className="space-y-2">
            <label
              htmlFor="slug"
              className="text-sm font-medium text-slate-400"
            >
              URL Slug
            </label>
            <Input
              id="slug"
              placeholder="e.g. macbook-pro-m3"
              value={productData.slug || ""}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="bg-slate-800/50 border-white/5 text-white focus-visible:ring-brand-secondary-500 font-mono"
            />
            {/* Dynamic URL Path Preview */}
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              <span className="text-slate-600 select-none">Live URL: </span>
              <span className="text-slate-500 font-mono select-all">https://sherotech.com/products/</span>
              <span className="text-brand-secondary-400 font-semibold font-mono select-all">{productData.slug || "product-slug"}</span>
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-slate-400"
          >
            Description *
          </label>
          <textarea
            id="description"
            placeholder="Provide a detailed, rich description of this product..."
            value={productData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className={cn(
              "w-full min-h-48 bg-slate-800/50 border border-white/5 rounded p-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50 resize-y leading-relaxed text-sm transition-all",
              errors.description && "border-rose-500 bg-rose-500/5 focus:ring-rose-500"
            )}
            required
          />
          {errors.description && (
            <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
              {errors.description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
