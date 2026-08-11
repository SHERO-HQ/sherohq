"use client";

import React from "react";
import {
  ArrowLeft,
  Copy,
  Printer,
  FileText,
  CheckCircle2,
  Truck,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface OrderHeaderActionsProps {
  printOrderId: string;
  onCopyOrderId: () => void;
  onBack: () => void;
  onExportPDF: () => void;
  onPrint: (type: "invoice" | "receipt" | "receiptA5" | "receipt58") => void;
  onUpdateStatus: (status: string) => void;
  isUpdating: boolean;
}

export function OrderHeaderActions({
  printOrderId,
  onCopyOrderId,
  onBack,
  onExportPDF,
  onPrint,
  onUpdateStatus,
  isUpdating,
}: OrderHeaderActionsProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4 text-foreground">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground mb-1">
            <span>{printOrderId}</span>
            <button
              type="button"
              onClick={onCopyOrderId}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              title="Copy order ID"
              aria-label="Copy order ID"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onExportPDF}
          className="border-amber-500/20 text-amber-500 hover:bg-amber-500/10 h-10 font-bold px-3 hidden sm:flex"
        >
          <FileText className="w-4 h-4 mr-2" />
          Export PDF
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-brand-secondary-500/20 text-brand-secondary-500 hover:bg-brand-secondary-500/10 h-10 font-bold"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-card border-border text-foreground w-48"
          >
            <DropdownMenuItem
              onClick={() => onPrint("invoice")}
              className="cursor-pointer hover:bg-accent"
            >
              <Printer className="w-4 h-4 mr-2 text-brand-secondary-400" />
              Print Invoice
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onPrint("receipt")}
              className="cursor-pointer hover:bg-accent"
            >
              <Printer className="w-4 h-4 mr-2 text-brand-primary-400" />
              Print Receipt (A4)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onPrint("receiptA5")}
              className="cursor-pointer hover:bg-accent"
            >
              <Printer className="w-4 h-4 mr-2 text-brand-primary-400" />
              Print Receipt (A5)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onPrint("receipt58")}
              className="cursor-pointer hover:bg-accent"
            >
              <Printer className="w-4 h-4 mr-2 text-cyan-400" />
              Print Thermal 58mm
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-accent/50 sm:hidden" />
            <DropdownMenuItem
              onClick={onExportPDF}
              className="cursor-pointer hover:bg-accent sm:hidden"
            >
              <FileText className="w-4 h-4 mr-2 text-amber-400" />
              Export PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground font-bold h-10"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Update Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-card border-border text-foreground w-48"
          >
            <DropdownMenuItem
              onClick={() => onUpdateStatus("processing")}
              className="cursor-pointer hover:bg-accent"
            >
              <Truck className="w-4 h-4 mr-2 text-blue-400" /> Processing
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUpdateStatus("intransit")}
              className="cursor-pointer hover:bg-accent"
            >
              <Truck className="w-4 h-4 mr-2 text-purple-400" /> Shipped
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUpdateStatus("delivered")}
              className="cursor-pointer hover:bg-accent"
            >
              <CheckCircle2 className="w-4 h-4 mr-2 text-brand-secondary-400" />{" "}
              Delivered
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-accent/50" />
            <DropdownMenuItem
              onClick={() => onUpdateStatus("cancelled")}
              className="cursor-pointer text-rose-400 focus:text-rose-400 focus:bg-rose-500/10"
            >
              <XCircle className="w-4 h-4 mr-2" /> Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
