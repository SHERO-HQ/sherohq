"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Package, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDialog } from "@/hooks/useDialog";
import { useFormContext } from "react-hook-form";
import type { ProductFormValues } from "@/lib/validations/product";

interface Category {
  id: string;
  name: string;
}

interface ProductSidebarMetaProps {
  categories: Category[];
  onCategoryAdded?: (cat: Category) => void;
}

export default function ProductSidebarMeta({
  categories,
  onCategoryAdded,
}: ProductSidebarMetaProps) {
  const dialog = useDialog();
  const { register, watch, setValue, formState: { errors } } = useFormContext<ProductFormValues>();

  const [discountMode, setDiscountMode] = React.useState<"percentage" | "fixed">("percentage");

  const originalPrice = watch("originalPrice");
  const price = watch("price");

  const regularPrice = originalPrice || price || 0;
  const salePrice = price || 0;

  const currentDiscountFixed = Math.max(0, regularPrice - salePrice);
  const currentDiscountPerc = regularPrice > 0 ? (currentDiscountFixed / regularPrice) * 100 : 0;

  const displayDiscountValue = discountMode === "percentage"
    ? Number(currentDiscountPerc.toFixed(2))
    : currentDiscountFixed;

  React.useEffect(() => {
    if (originalPrice && originalPrice > price) {
      const diff = originalPrice - price;
      const perc = (diff / originalPrice) * 100;
      if (Number.isInteger(perc)) {
        setDiscountMode("percentage");
      } else {
        setDiscountMode("fixed");
      }
    }
  }, [originalPrice, price]);

  const handleRegularPriceChange = (val: number) => {
    const newOriginalPrice = val > salePrice ? val : undefined;
    setValue("originalPrice", newOriginalPrice, { shouldDirty: true, shouldValidate: true });
    if (salePrice > val) {
      setValue("price", val, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleSalePriceChange = (val: number) => {
    const newOriginalPrice = regularPrice > val ? regularPrice : undefined;
    setValue("price", val, { shouldDirty: true, shouldValidate: true });
    setValue("originalPrice", newOriginalPrice, { shouldDirty: true, shouldValidate: true });
  };

  const handleDiscountChange = (val: number) => {
    let newSalePrice = salePrice;
    if (discountMode === "percentage") {
      newSalePrice = Math.max(0, regularPrice - (regularPrice * val / 100));
    } else {
      newSalePrice = Math.max(0, regularPrice - val);
    }
    const newOriginalPrice = regularPrice > newSalePrice ? regularPrice : undefined;
    setValue("price", newSalePrice, { shouldDirty: true, shouldValidate: true });
    setValue("originalPrice", newOriginalPrice, { shouldDirty: true, shouldValidate: true });
  };

  const inStock = watch("inStock");
  const isSpotlight = watch("isSpotlight");
  const isFeatured = watch("isFeatured");

  return (
    <div className="space-y-6">
      {/* Pricing & Stock Card */}
      <Card className={cn(
        "bg-card border border-border p-6 space-y-6 transition-all duration-300",
        (errors.price || errors.stockQuantity || errors.costPrice) && "border-rose-500/30 bg-rose-500/2"
      )}>
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Package className="w-5 h-5 text-brand-secondary-400" />
          <h3 className="text-lg font-bold text-foreground">Pricing & Stock</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="regularPrice"
              className="text-sm font-medium text-muted-foreground flex items-center justify-between"
            >
              <span>Regular Price (MSRP) *</span>
              <span className="text-xs text-slate-600 font-mono">GHS</span>
            </label>
            <Input
              id="regularPrice"
              type="number"
              value={regularPrice || ""}
              onChange={(e) => handleRegularPriceChange(e.target.value ? Number.parseFloat(e.target.value) : 0)}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              className="bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500"
              placeholder="0.00"
            />
          </div>

          {/* Discount Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">Discount</label>
              <select
                value={discountMode}
                onChange={(e) => setDiscountMode(e.target.value as "percentage" | "fixed")}
                className="w-full h-10 px-3 py-2 bg-muted/50 border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-brand-secondary-500 text-sm"
              >
                <option value="percentage">%</option>
                <option value="fixed">GHS</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Discount</span>
                <span className="text-xs text-slate-600 font-mono">
                  {discountMode === "percentage" ? "%" : "GHS"}
                </span>
              </label>
              <Input
                type="number"
                value={displayDiscountValue || ""}
                onChange={(e) => handleDiscountChange(e.target.value ? Number.parseFloat(e.target.value) : 0)}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                className="bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500"
                placeholder="0"
                disabled={regularPrice === 0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="price"
              className="text-sm font-medium text-muted-foreground flex items-center justify-between"
            >
              <span>Final Sale Price *</span>
              <span className="text-xs text-slate-600 font-mono">GHS</span>
            </label>
            <Input
              id="price"
              type="number"
              value={salePrice || ""}
              onChange={(e) => handleSalePriceChange(e.target.value ? Number.parseFloat(e.target.value) : 0)}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              className={cn(
                "bg-muted/50 border-brand-secondary-500/30 text-foreground focus-visible:ring-brand-secondary-500",
                errors.price && "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500"
              )}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                {errors.price.message}
              </p>
            )}
            {regularPrice > salePrice && (
              <p className="text-[10px] text-emerald-400 italic mt-1 leading-relaxed">
                Customers will see a strikethrough price of GHS{regularPrice}.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="costPrice"
              className="text-sm font-medium text-muted-foreground flex items-center justify-between"
            >
              <span>Cost Price (Buying Price) *</span>
              <span className="text-xs text-slate-600 font-mono">GHS</span>
            </label>
            <Input
              id="costPrice"
              type="number"
              {...register("costPrice")}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              className={cn(
                "bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500",
                errors.costPrice && "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500"
              )}
              placeholder="Initial buying price"
            />
            {errors.costPrice && (
              <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                {errors.costPrice.message}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground italic mt-1 leading-relaxed">
              Internal only. Used to accurately calculate Net Profit.
            </p>
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="stockQuantity"
                className="text-sm font-medium text-muted-foreground"
              >
                Stock Quantity
              </label>
              <Input
                id="stockQuantity"
                type="number"
                placeholder="Available units (Optional)"
                {...register("stockQuantity")}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                className="bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-muted/30 border border-border">
              <span className="text-sm text-foreground font-medium">In Stock Status</span>
              <button
                type="button"
                onClick={() => setValue("inStock", !inStock, { shouldDirty: true, shouldValidate: true })}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-secondary-500",
                  inStock ? "bg-brand-secondary-600" : "bg-accent"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    inStock ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Categorization Card */}
      <Card className={cn(
        "bg-card border border-border p-6 space-y-6 transition-all duration-300",
        errors.category && "border-rose-500/30 bg-rose-500/2"
      )}>
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Tag className="w-5 h-5 text-brand-secondary-400" />
          <h3 className="text-lg font-bold text-foreground">Categorization</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="category"
                className="text-sm font-medium text-muted-foreground"
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
                            setValue("category", data.id, { shouldDirty: true, shouldValidate: true });
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
                "w-full bg-transparent border border-border text-foreground rounded px-4 py-2 outline-none focus:ring-2 focus:ring-brand-secondary-500/50",
                errors.category && "border-rose-500 focus:ring-rose-500/50 bg-transparent "
              )}
              {...register("category")}
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
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="condition"
              className="text-sm font-medium text-muted-foreground"
            >
              Condition
            </label>
            <select
              id="condition"
              className="w-full bg-transparent border border-border text-foreground rounded px-4 py-2 outline-none focus:ring-2 focus:ring-brand-secondary-500/50"
              {...register("condition")}
            >
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Refurbished">Refurbished</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Visibility & Promotion Card */}
      <Card className="bg-card border border-border p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Tag className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-bold text-foreground">Promotion & Visibility</h3>
        </div>

        <div className="space-y-4">
          {/* Spotlight Checkbox Card */}
          <div
            onClick={() => setValue("isSpotlight", !isSpotlight, { shouldDirty: true, shouldValidate: true })}
            className={cn(
              "cursor-pointer flex items-center justify-between p-4 bg-muted/30 border rounded transition-all duration-300 hover:bg-muted/50 group select-none",
              isSpotlight
                ? "border-brand-secondary-500 bg-brand-secondary-500/5 shadow-[0_0_12px_rgba(16,185,129,0.08)]"
                : "border-border"
            )}
          >
            <div className="space-y-1">
              <span className={cn(
                "block text-sm font-medium transition-colors",
                isSpotlight ? "text-brand-secondary-400" : "text-foreground"
              )}>
                Featured in Hero Spotlight
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight block">
                Showcases this item in the top homepage carousel.
              </span>
            </div>
            <div className={cn(
              "w-5 h-5 rounded flex items-center justify-center border transition-all duration-200",
              isSpotlight
                ? "border-brand-secondary-500 bg-brand-secondary-600 text-white"
                : "border-border bg-card group-hover:border-border"
            )}>
              {isSpotlight && (
                <svg className="w-3.5 h-3.5 stroke-2 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>

          {/* Featured Checkbox Card */}
          <div
            onClick={() => setValue("isFeatured", !isFeatured, { shouldDirty: true, shouldValidate: true })}
            className={cn(
              "cursor-pointer flex items-center justify-between p-4 bg-muted/30 border rounded transition-all duration-300 hover:bg-muted/50 group select-none",
              isFeatured
                ? "border-brand-secondary-500 bg-brand-secondary-500/5 shadow-[0_0_12px_rgba(16,185,129,0.08)]"
                : "border-border"
            )}
          >
            <div className="space-y-1">
              <span className={cn(
                "block text-sm font-medium transition-colors",
                isFeatured ? "text-brand-secondary-400" : "text-foreground"
              )}>
                Featured Recommendations
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight block">
                Prioritizes this item in recommendation lists and search.
              </span>
            </div>
            <div className={cn(
              "w-5 h-5 rounded flex items-center justify-center border transition-all duration-200",
              isFeatured
                ? "border-brand-secondary-500 bg-brand-secondary-600 text-white"
                : "border-border bg-card group-hover:border-border"
            )}>
              {isFeatured && (
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
