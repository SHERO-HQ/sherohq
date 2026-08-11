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

interface ProductHeaderActionsProps {
  onRefetch: () => void;
  isFetching: boolean;
  onExport: (format: "csv" | "excel" | "pdf") => void;
}

export function ProductHeaderActions({
  onRefetch,
  isFetching,
  onExport,
}: ProductHeaderActionsProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground text-sm">
          Manage your store inventory and pricing
        </p>
      </div>
      <div className="flex items-center gap-3">
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
              <Printer className="w-4 h-4 mr-2" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-card border-border text-foreground"
            align="end"
          >
            <DropdownMenuItem
              onClick={() => onExport("csv")}
              className="hover:bg-accent cursor-pointer"
            >
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onExport("excel")}
              className="hover:bg-accent cursor-pointer"
            >
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onExport("pdf")}
              className="hover:bg-accent cursor-pointer"
            >
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground font-medium px-4"
          asChild
        >
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>
    </div>
  );
}
