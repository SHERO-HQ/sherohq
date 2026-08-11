"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminOrdersFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  setCurrentPage: (page: number) => void;
}

export function AdminOrdersFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  setCurrentPage,
}: AdminOrdersFiltersProps) {
  return (
    <Card className="bg-card/40 border-border p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID, customer name or email..."
            className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:gap-0 lg:bg-card lg:p-1 lg:rounded lg:border lg:border-border overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "processing", label: "Processing" },
            { id: "intransit", label: "In Transit" },
            { id: "delivered", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" },
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => {
                setStatusFilter(status.id);
                setCurrentPage(1);
              }}
              className={cn(
                "px-4 py-1 rounded text-sm font-medium transition whitespace-nowrap",
                statusFilter === status.id
                  ? "bg-brand-secondary-600 text-white shadow shadow-brand-secondary-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
