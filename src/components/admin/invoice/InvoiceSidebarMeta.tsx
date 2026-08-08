"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InvoiceSidebarMetaProps {
  totalAmount: number;
  isSaving: boolean;
  mode: "invoice" | "quote";
  onSubmit: () => void;
  hasItems: boolean;
}

export default function InvoiceSidebarMeta({
  totalAmount,
  isSaving,
  mode,
  onSubmit,
  hasItems }: InvoiceSidebarMetaProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-card border border-border p-6 sticky top-24">
        <h3 className="text-lg font-bold text-foreground mb-6 border-b border-border pb-2">Summary</h3>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-muted-foreground font-mono">GHS{totalAmount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (0%)</span>
            <span className="text-muted-foreground font-mono">GHS0.00</span>
          </div>
          <div className="border-t border-border pt-4 flex justify-between items-center">
            <span className="font-bold text-foreground text-base">Total Due</span>
            <span className="text-2xl font-bold text-brand-secondary-400 font-mono">
              GHS{totalAmount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <Button
          onClick={onSubmit}
          disabled={isSaving || !hasItems}
          className={cn(
            "w-full font-bold h-11 text-slate-100 transition-all select-none shadow-lg",
            mode === "invoice"
              ? "bg-brand-secondary-600 hover:bg-brand-secondary-500 shadow-brand-secondary-500/10"
              : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/10"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Create {mode === "invoice" ? "Invoice" : "Quote"}
            </>
          )}
        </Button>

        <div className="mt-4 p-3 bg-muted/30 border border-border rounded flex gap-2">
          <Calendar className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Ensure customer information is exact. MANUALLY issued {mode}s will generate notifications automatically.
          </p>
        </div>
      </Card>
    </div>
  );
}
