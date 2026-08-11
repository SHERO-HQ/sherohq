"use client";

import React from "react";
import Link from "next/link";
import { Plus, Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AdminOrdersHeaderProps {
  onRefetch: () => void;
  isFetching: boolean;
  onExport: (format: "csv" | "excel" | "pdf") => void;
}

export function AdminOrdersHeader({
  onRefetch,
  isFetching,
  onExport,
}: AdminOrdersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground text-sm">
          Monitor and manage customer transactions
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onRefetch}
          disabled={isFetching}
          className="bg-muted/50 border-border"
        >
          <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-muted/50 border-border text-foreground hover:bg-accent"
            >
              <Printer className="mr-2 h-4 w-4" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-card border-border text-foreground"
          >
            <DropdownMenuItem
              onClick={() => onExport("csv")}
              className="cursor-pointer hover:bg-accent"
            >
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onExport("excel")}
              className="cursor-pointer hover:bg-accent"
            >
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onExport("pdf")}
              className="cursor-pointer hover:bg-accent"
            >
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/admin/orders/new">
          <Button className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground font-bold transition shadow shadow-brand-secondary-500/20">
            <Plus className="mr-2 h-4 w-4" /> Create Order
          </Button>
        </Link>
      </div>
    </div>
  );
}
