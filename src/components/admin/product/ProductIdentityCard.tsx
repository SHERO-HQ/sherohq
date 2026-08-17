"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFormContext, Controller } from "react-hook-form";
import type { ProductFormValues } from "@/lib/validations/product";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function ProductIdentityCard() {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<ProductFormValues>();

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitized = value
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/(^-|-$)/g, "");
    setValue("slug", sanitized, { shouldDirty: true, shouldValidate: true });
  };

  const slug = watch("slug");

  return (
    <Card className={cn(
      "bg-card border border-border p-6 md:p-8 space-y-6 transition-all duration-300",
      (errors.name || errors.description) && "border-rose-500/30 bg-rose-500/2"
    )}>
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Info className="w-5 h-5 text-brand-secondary-400" />
        <h3 className="text-lg font-bold text-foreground">General Information</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-muted-foreground"
            >
              Product Name *
            </label>
            <Input
              id="name"
              placeholder="e.g. MacBook Pro M3"
              {...register("name")}
              className={cn(
                "bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500",
                errors.name && "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500"
              )}
            />
            {errors.name && (
              <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <label
              htmlFor="sku"
              className="text-sm font-medium text-muted-foreground"
            >
              SKU (Optional)
            </label>
            <Input
              id="sku"
              placeholder="e.g. LAP-MAC-16M3"
              {...register("sku")}
              className="bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500 font-mono"
            />
            <p className="text-[10px] text-muted-foreground italic mt-1 leading-relaxed">
              Leave blank to auto-generate based on Product ID.
            </p>
          </div>

          {/* URL Slug */}
          <div className="space-y-2">
            <label
              htmlFor="slug"
              className="text-sm font-medium text-muted-foreground"
            >
              URL Slug
            </label>
            <Input
              id="slug"
              placeholder="e.g. macbook-pro-m3"
              {...register("slug")}
              onChange={handleSlugChange}
              className="bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500 font-mono"
            />
            {/* Dynamic URL Path Preview */}
            <p className="text-[10px] text-muted-foreground mt-1 truncate">
              <span className="text-slate-600 select-none">Live URL: </span>
              <span className="text-muted-foreground font-mono select-all">https://sherohq.com/shop/</span>
              <span className="text-brand-secondary-400 font-semibold font-mono select-all">{slug || "product-slug"}</span>
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2" data-color-mode="dark">
          <label
            htmlFor="description"
            className="text-sm font-medium text-muted-foreground"
          >
            Description *
          </label>
          <div className={cn(
            "rounded overflow-hidden border border-border transition-all",
            errors.description && "border-rose-500"
          )}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <MDEditor
                  value={field.value || ""}
                  onChange={(val) => field.onChange(val || "")}
                  preview="edit"
                  height={300}
                  textareaProps={{
                    placeholder: "Provide a detailed, rich description of this product... (Markdown supported)"
                  }}
                  className="!bg-muted/50"
                />
              )}
            />
          </div>
          {errors.description && (
            <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
