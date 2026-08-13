"use client";

import React from "react";
import { Mail, Hash, CreditCard, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderInternalActionsCardProps {
  onResendConfirmation: () => void;
  onCopyTrackingLink: () => void;
  onCopyPaymentLink: () => void;
  isStorePickupOrder: boolean;
  isSendingEmail?: boolean;
  orderStatus?: string;
}

export function OrderInternalActionsCard({
  onResendConfirmation,
  onCopyTrackingLink,
  onCopyPaymentLink,
  isStorePickupOrder,
  isSendingEmail = false,
  orderStatus,
}: OrderInternalActionsCardProps) {
  const isPending = orderStatus?.toLowerCase() === "pending";
  const isProcessing = orderStatus?.toLowerCase() === "processing";

  const emailActionLabel = isSendingEmail
    ? "Sending Email..."
    : isPending
      ? "Send Payment Reminder"
      : isProcessing
        ? "Resend Order Confirmation"
        : "Send Status Email";

  return (
    <div className="bg-card rounded p-5 border border-border relative group overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 relative z-10">
        Customer Communications & Links
      </h4>
      <div className="space-y-2 relative z-10">
        <Button
          variant="ghost"
          onClick={onResendConfirmation}
          disabled={isSendingEmail}
          className={`w-full justify-start text-xs h-9 rounded transition-all duration-200 ${
            isPending
              ? "text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-500/10"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
          title={isPending ? "Send 1-click payment reminder email with secure payment link" : "Send 1-click email confirmation to customer"}
        >
          {isSendingEmail ? (
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-muted-foreground" />
          ) : isPending ? (
            <Send className="w-3.5 h-3.5 mr-2 text-amber-500" />
          ) : (
            <Mail className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          )}
          <span>{emailActionLabel}</span>
        </Button>

        <Button
          variant="ghost"
          onClick={onCopyPaymentLink}
          className="w-full justify-start text-xs text-muted-foreground hover:text-foreground hover:bg-accent h-9 rounded transition-all duration-200"
        >
          <CreditCard className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          Copy Payment link
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
      </div>
    </div>
  );
}
