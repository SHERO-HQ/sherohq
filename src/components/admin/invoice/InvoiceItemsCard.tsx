"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Plus, Search, Trash2, Loader2, Info, RotateCcw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface InvoiceItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  type: "product" | "custom";
}

interface InvoiceItemsCardProps {
  items: InvoiceItem[];
  onAddItem: (item: InvoiceItem) => void;
  onUpdateItem: (id: string, field: keyof InvoiceItem, value: string | number) => void;
  onRemoveItem: (id: string) => void;
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  products: Product[];
  isLoadingProducts: boolean;
  onAddProduct: (product: Product) => void;
  onAddCustomItem: () => void;
  errors?: Record<string, string>;
}

export default function InvoiceItemsCard({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  searchQuery,
  onSearchQueryChange,
  products,
  isLoadingProducts,
  onAddProduct,
  onAddCustomItem,
  errors = {} }: InvoiceItemsCardProps) {
  const [deletingIds, setDeletingIds] = useState<Record<string, number>>({});
  const timersRef = useRef<Record<string, NodeJS.Timeout>>({});

  const initiateDelete = (id: string) => {
    if (id in deletingIds) return;

    // Initialize with 3-second countdown
    setDeletingIds((prev) => ({ ...prev, [id]: 3 }));

    const tick = (secondsLeft: number) => {
      if (secondsLeft === 0) {
        onRemoveItem(id);
        cancelDelete(id);
      } else {
        setDeletingIds((prev) => ({ ...prev, [id]: secondsLeft }));
        timersRef.current[id] = setTimeout(() => tick(secondsLeft - 1), 1000);
      }
    };

    timersRef.current[id] = setTimeout(() => tick(2), 1000);
  };

  const cancelDelete = (id: string) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setDeletingIds((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  useEffect(() => {
    const currentTimers = timersRef.current;
    return () => {
      Object.values(currentTimers).forEach(clearTimeout);
    };
  }, []);

  return (
    <Card className={cn(
      "bg-card border border-border p-6 md:p-8 space-y-6 transition-all duration-300",
      errors.items && "border-rose-500/30 bg-rose-500/2"
    )}>
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-secondary-400" />
          <h2 className="text-lg font-bold text-foreground">Invoice Items</h2>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddCustomItem}
          className="border-border text-brand-secondary-400 hover:bg-brand-secondary-500/10"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Custom Item
        </Button>
      </div>

      {/* Product Search */}
      <div className="relative" id="items">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
          Search products to add
        </label>
        <div className="relative">
          <Input
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="bg-card border-border text-foreground pl-10 focus-visible:ring-brand-secondary-500"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>

        {searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded shadow-2xl z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            {isLoadingProducts ? (
              <div className="p-4 text-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-secondary-400" />
              </div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => onAddProduct(product)}
                  className="w-full text-left p-3 hover:bg-accent flex items-center gap-3 border-b border-border last:border-0 transition-colors"
                >
                  <div className="w-10 h-10 bg-muted border border-border rounded overflow-hidden shrink-0">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-brand-secondary-400 font-semibold font-mono">
                      GHS{product.price.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 ml-auto text-brand-secondary-400" />
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground text-xs italic">
                No matching products found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {errors.items && (
          <p className="text-xs text-rose-400 animate-pulse">
            {errors.items}
          </p>
        )}

        {items.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded flex flex-col items-center justify-center gap-2">
            <Info className="w-6 h-6 text-slate-600" />
            <p className="text-sm">No items added to this invoice yet.</p>
            <p className="text-xs text-slate-600">Search products or add custom items to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const isDeleting = item.id in deletingIds;
              const secondsLeft = deletingIds[item.id];

              return (
                <div
                  key={item.id}
                  className={cn(
                    "bg-card p-4 rounded border transition-all duration-300 relative overflow-hidden",
                    isDeleting ? "border-rose-500/25 bg-rose-500/2 opacity-90 scale-[0.99]" : "border-border"
                  )}
                >
                  {isDeleting ? (
                    <div className="absolute inset-0 bg-card backdrop-blur-xs z-20 flex items-center justify-between px-6 py-2 text-center animate-in fade-in duration-200">
                      <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest animate-pulse">
                        Removing "{item.name}" in {secondsLeft}s
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => cancelDelete(item.id)}
                        className="h-8 px-4 bg-accent hover:bg-muted/50 text-foreground rounded text-[11px] flex items-center gap-1.5 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Undo Deletion
                      </Button>
                    </div>
                  ) : null}

                  <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                    <div className="flex-1 space-y-3 w-full">
                      {/* Name editor (only editable if custom item) */}
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          onUpdateItem(item.id, "name", e.target.value)
                        }
                        className={cn(
                          "bg-transparent border-transparent text-foreground font-bold h-auto focus-visible:ring-0 focus-visible:border-border text-sm placeholder:text-slate-600 truncate",
                          item.type === "product" ? "pointer-events-none select-none text-muted-foreground" : "hover:border-border"
                        )}
                        placeholder="Item Name"
                        disabled={item.type === "product"}
                      />

                      <div className="flex gap-4">
                        <div className="w-28 space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            Price (GHS)
                          </Label>
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                              onUpdateItem(
                                item.id,
                                "price",
                                Number(e.target.value)
                              )
                            }
                            className="h-8 bg-card border-border text-foreground focus-visible:ring-brand-secondary-500 text-xs font-mono"
                          />
                        </div>
                        <div className="w-24 space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            Qty
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              onUpdateItem(
                                item.id,
                                "quantity",
                                Number(e.target.value)
                              )
                            }
                            className="h-8 bg-card border-border text-foreground focus-visible:ring-brand-secondary-500 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-start w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      <p className="text-sm font-bold text-foreground font-mono">
                        GHS{(item.price * item.quantity).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => initiateDelete(item.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
