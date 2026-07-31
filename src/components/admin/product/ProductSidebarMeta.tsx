"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Package, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDialog } from "@/hooks/useDialog";
import type { Product } from "@/types/product";

interface Category {
  id: string;
  name: string;
}

interface ProductSidebarMetaProps {
  productData: Partial<Product>;
  categories: Category[];
  onUpdateProductData: (updates: Partial<Product>) => void;
  errors?: Record<string, string>;
  onCategoryAdded?: (cat: Category) => void;
}

export default function ProductSidebarMeta({
  productData,
  categories,
  onUpdateProductData,
  errors = {},
  onCategoryAdded,
}: ProductSidebarMetaProps) {
  const dialog = useDialog();
  const [discountMode, setDiscountMode] = React.useState<"percentage" | "fixed">("percentage");

  const regularPrice = productData.originalPrice || productData.price || 0;
  const salePrice = productData.price || 0;

  const currentDiscountFixed = Math.max(0, regularPrice - salePrice);
  const currentDiscountPerc = regularPrice > 0 ? (currentDiscountFixed / regularPrice) * 100 : 0;

  const displayDiscountValue = discountMode === "percentage" 
    ? Number(currentDiscountPerc.toFixed(2)) 
    : currentDiscountFixed;

  React.useEffect(() => {
    if (productData.originalPrice && productData.originalPrice > (productData.price || 0)) {
      const diff = productData.originalPrice - (productData.price || 0);
      const perc = (diff / productData.originalPrice) * 100;
      if (Number.isInteger(perc)) {
        setDiscountMode("percentage");
      } else {
        setDiscountMode("fixed");
      }
    }
  }, [productData.id]);

  const handleRegularPriceChange = (val: number) => {
    const newOriginalPrice = val > salePrice ? val : undefined;
    onUpdateProductData({ originalPrice: newOriginalPrice, price: salePrice > val ? val : salePrice });
  };

  const handleSalePriceChange = (val: number) => {
    const newOriginalPrice = regularPrice > val ? regularPrice : undefined;
    onUpdateProductData({ price: val, originalPrice: newOriginalPrice });
  };

  const handleDiscountChange = (val: number) => {
    let newSalePrice = salePrice;
    if (discountMode === "percentage") {
      newSalePrice = Math.max(0, regularPrice - (regularPrice * val / 100));
    } else {
      newSalePrice = Math.max(0, regularPrice - val);
    }
    const newOriginalPrice = regularPrice > newSalePrice ? regularPrice : undefined;
    onUpdateProductData({ price: newSalePrice, originalPrice: newOriginalPrice });
  };
  const handleInputChange = (field: keyof Product, value: unknown) => {
    onUpdateProductData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Pricing & Stock Card */}
      <Card className={cn(
        "bg-slate-900 border border-white/5 p-6 space-y-6 transition-all duration-300",
        (errors.price || errors.stockQuantity) && "border-rose-500/30 bg-rose-500/2"
      )}>
        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
          <Package className="w-5 h-5 text-brand-secondary-400" />
          <h3 className="text-lg font-bold text-white">Pricing & Stock</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="regularPrice"
              className="text-sm font-medium text-slate-400 flex items-center justify-between"
            >
              <span>Regular Price (MSRP) *</span>
              <span className="text-xs text-slate-600 font-mono">GH₵</span>
            </label>
            <Input
              id="regularPrice"
              type="number"
              value={regularPrice || ""}
              onChange={(e) => handleRegularPriceChange(e.target.value ? Number.parseFloat(e.target.value) : 0)}
              className="bg-slate-800/50 border-white/5 text-white focus-visible:ring-brand-secondary-500"
              placeholder="0.00"
            />
          </div>

          {/* Discount Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Discount Type</label>
              <select
                value={discountMode}
                onChange={(e) => setDiscountMode(e.target.value as "percentage" | "fixed")}
                className="w-full h-10 px-3 py-2 bg-slate-800/50 border border-white/5 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary-500 text-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (GH₵)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center justify-between">
                <span>Discount Value</span>
                <span className="text-xs text-slate-600 font-mono">
                  {discountMode === "percentage" ? "%" : "GH₵"}
                </span>
              </label>
              <Input
                type="number"
                value={displayDiscountValue || ""}
                onChange={(e) => handleDiscountChange(e.target.value ? Number.parseFloat(e.target.value) : 0)}
                className="bg-slate-800/50 border-white/5 text-white focus-visible:ring-brand-secondary-500"
                placeholder="0"
                disabled={regularPrice === 0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="price"
              className="text-sm font-medium text-slate-400 flex items-center justify-between"
            >
              <span>Final Sale Price *</span>
              <span className="text-xs text-slate-600 font-mono">GH₵</span>
            </label>
            <Input
              id="price"
              type="number"
              value={salePrice || ""}
              onChange={(e) => handleSalePriceChange(e.target.value ? Number.parseFloat(e.target.value) : 0)}
              className={cn(
                "bg-slate-800/50 border-brand-secondary-500/30 text-white focus-visible:ring-brand-secondary-500",
                errors.price && "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500"
              )}
              placeholder="0.00"
              required
            />
            {errors.price && (
              <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                {errors.price}
              </p>
            )}
            {regularPrice > salePrice && (
              <p className="text-[10px] text-emerald-400 italic mt-1 leading-relaxed">
                Customers will see a strikethrough price of GH₵{regularPrice}.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="costPrice"
              className="text-sm font-medium text-slate-400 flex items-center justify-between"
            >
              <span>Cost Price (Buying Price) *</span>
              <span className="text-xs text-slate-600 font-mono">GH₵</span>
            </label>
            <Input
              id="costPrice"
              type="number"
              value={productData.costPrice ?? ""}
              onChange={(e) =>
                handleInputChange(
                  "costPrice",
                  e.target.value
                    ? Number.parseFloat(e.target.value)
                    : undefined
                )
              }
              className={cn(
                "bg-slate-800/50 border-white/5 text-white focus-visible:ring-brand-secondary-500",
                errors.costPrice && "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500"
              )}
              placeholder="Initial buying price"
              required
            />
            {errors.costPrice && (
              <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                {errors.costPrice}
              </p>
            )}
            <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
              Internal only. Used to accurately calculate Net Profit.
            </p>
          </div>

          <div className="border-t border-white/5 pt-4 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="stockQuantity"
                className="text-sm font-medium text-slate-400"
              >
                Stock Quantity
              </label>
              <Input
                id="stockQuantity"
                type="number"
                placeholder="Available units (Optional)"
                value={productData.stockQuantity ?? ""}
                onChange={(e) => {
                  const val = e.target.value
                    ? Number.parseInt(e.target.value)
                    : undefined;
                  onUpdateProductData({
                    stockQuantity: val,
                    quantity: val,
                  });
                }}
                className="bg-slate-800/50 border-white/5 text-white focus-visible:ring-brand-secondary-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-slate-800/30 border border-white/5">
              <span className="text-sm text-white font-medium">In Stock Status</span>
              <button
                type="button"
                onClick={() => handleInputChange("inStock", !productData.inStock)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-secondary-500",
                  productData.inStock ? "bg-brand-secondary-600" : "bg-slate-700"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    productData.inStock ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Categorization Card */}
      <Card className={cn(
        "bg-slate-900 border border-white/5 p-6 space-y-6 transition-all duration-300",
        errors.category && "border-rose-500/30 bg-rose-500/2"
      )}>
        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
          <Tag className="w-5 h-5 text-brand-secondary-400" />
          <h3 className="text-lg font-bold text-white">Categorization</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="category"
                className="text-sm font-medium text-slate-400"
              >
                Category *
              </label>
              <button
                type="button"
                className="text-xs text-brand-secondary-400 hover:text-brand-secondary-300 transition-colors"
                onClick={async () => {
                  const newCat = await dialog.prompt({
                    title: "Add New Category",
                    message: "Enter new category name:",
                    placeholder: "e.g. Gaming Laptops",
                  });
                  if (newCat?.trim()) {
                    fetch("/api/products/categories", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: newCat.trim() })
                    })
                    .then(res => res.json())
                    .then(data => {
                      if (data.success && data.id) {
                        const newCategory = { id: data.id, name: data.name };
                        if (onCategoryAdded) {
                          onCategoryAdded(newCategory);
                          onUpdateProductData({ category: data.id });
                        } else {
                          void dialog.alert({ title: "Category Added", message: "Category added! Please save draft and refresh to see it in the list.", type: "success" });
                        }
                      } else {
                        void dialog.alert({ title: "Error", message: data.error || "Failed to add category", type: "error" });
                      }
                    })
                    .catch(() => void dialog.alert({ title: "Network Error", message: "Network error", type: "error" }));
                  }
                }}
              >
                + Quick Add
              </button>
            </div>
            <select
              id="category"
              className={cn(
                "w-full bg-slate-800 border border-white/5 text-white rounded px-4 py-2 outline-none focus:ring-2 focus:ring-brand-secondary-500/50",
                errors.category && "border-rose-500 focus:ring-rose-500/50 bg-rose-500/5"
              )}
              value={productData.category || ""}
              onChange={(e) => handleInputChange("category", e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
               <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                 {errors.category}
               </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="condition"
              className="text-sm font-medium text-slate-400"
            >
              Condition
            </label>
            <select
              id="condition"
              className="w-full bg-slate-800 border border-white/5 text-white rounded px-4 py-2 outline-none focus:ring-2 focus:ring-brand-secondary-500/50"
              value={productData.condition || "New"}
              onChange={(e) => handleInputChange("condition", e.target.value)}
            >
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Refurbished">Refurbished</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Visibility & Promotion Card */}
      <Card className="bg-slate-900 border border-white/5 p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
          <Tag className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-bold text-white">Promotion & Visibility</h3>
        </div>

        <div className="space-y-4">
          {/* Spotlight Checkbox Card */}
          <div
            onClick={() => handleInputChange("isSpotlight", !productData.isSpotlight)}
            className={cn(
              "cursor-pointer flex items-center justify-between p-4 bg-slate-800/30 border rounded transition-all duration-300 hover:bg-slate-800/50 group select-none",
              productData.isSpotlight
                ? "border-brand-secondary-500 bg-brand-secondary-500/5 shadow-[0_0_12px_rgba(16,185,129,0.08)]"
                : "border-white/5"
            )}
          >
            <div className="space-y-1">
              <span className={cn(
                "block text-sm font-medium transition-colors",
                productData.isSpotlight ? "text-brand-secondary-400" : "text-white"
              )}>
                Featured in Hero Spotlight
              </span>
              <span className="text-[10px] text-slate-500 leading-tight block">
                Showcases this item in the top homepage carousel.
              </span>
            </div>
            <div className={cn(
              "w-5 h-5 rounded flex items-center justify-center border transition-all duration-200",
              productData.isSpotlight
                ? "border-brand-secondary-500 bg-brand-secondary-600 text-white"
                : "border-white/10 bg-slate-900 group-hover:border-white/20"
            )}>
              {productData.isSpotlight && (
                <svg className="w-3.5 h-3.5 stroke-2 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>

          {/* Featured Checkbox Card */}
          <div
            onClick={() => handleInputChange("isFeatured", !productData.isFeatured)}
            className={cn(
              "cursor-pointer flex items-center justify-between p-4 bg-slate-800/30 border rounded transition-all duration-300 hover:bg-slate-800/50 group select-none",
              productData.isFeatured
                ? "border-brand-secondary-500 bg-brand-secondary-500/5 shadow-[0_0_12px_rgba(16,185,129,0.08)]"
                : "border-white/5"
            )}
          >
            <div className="space-y-1">
              <span className={cn(
                "block text-sm font-medium transition-colors",
                productData.isFeatured ? "text-brand-secondary-400" : "text-white"
              )}>
                Featured Recommendations
              </span>
              <span className="text-[10px] text-slate-500 leading-tight block">
                Prioritizes this item in recommendation lists and search.
              </span>
            </div>
            <div className={cn(
              "w-5 h-5 rounded flex items-center justify-center border transition-all duration-200",
              productData.isFeatured
                ? "border-brand-secondary-500 bg-brand-secondary-600 text-white"
                : "border-white/10 bg-slate-900 group-hover:border-white/20"
            )}>
              {productData.isFeatured && (
                <svg className="w-3.5 h-3.5 stroke-2 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
