"use client";

import React from "react";
import { Mail, Hash, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderInternalActionsCardProps {
  onResendConfirmation: () => void;
  onCopyTrackingLink: () => void;
  onCopyPaymentLink: () => void;
  isStorePickupOrder: boolean;
}

export function OrderInternalActionsCard({
  onResendConfirmation,
  onCopyTrackingLink,
  onCopyPaymentLink,
  isStorePickupOrder,
}: OrderInternalActionsCardProps) {
  return (
    <div className="bg-card rounded p-5 border border-border relative group overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 relative z-10">
        Internal Actions
      </h4>
      <div className="space-y-2 relative z-10">
        <Button
          variant="ghost"
          onClick={onResendConfirmation}
          className="w-full justify-start text-xs text-muted-foreground hover:text-foreground hover:bg-accent h-9 rounded transition-all duration-200"
        >
          <Mail className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          Resend Confirmation
        </Button>
        <Button
          variant="ghost"
          onClick={onCopyTrackingLink}
          disabled={isStorePickupOrder}
          className="w-full justify-start text-xs text-muted-foreground hover:text-foreground hover:bg-accent h-9 rounded transition-all duration-200"
        >
          <Hash className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          {isStorePickupOrder ? "Tracking not available" : "Copy Tracking link"}
        </Button>
        <Button
          variant="ghost"
          onClick={onCopyPaymentLink}
          className="w-full justify-start text-xs text-muted-foreground hover:text-foreground hover:bg-accent h-9 rounded transition-all duration-200"
        >
          <CreditCard className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          Copy Payment link
        </Button>
      </div>
    </div>
  );
}
