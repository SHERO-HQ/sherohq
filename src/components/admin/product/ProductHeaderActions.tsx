"use client";

import React from "react";
import Link from "next/link";
import { Package, Plus, Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

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
    <AdminPageHeader
      icon={Package}
      title="Inventory & Products"
      description="Manage your store inventory and pricing"
      sticky={false}
    >
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
    </AdminPageHeader>
  );
}
