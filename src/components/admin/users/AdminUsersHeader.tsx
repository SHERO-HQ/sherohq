"use client";

import React from "react";
import { Users, Search, RefreshCw, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface AdminUsersHeaderProps {
  isFetching: boolean;
  refetchUsers: () => void;
  handleExport: (format: "csv" | "excel" | "pdf") => void;
  search: string;
  setSearch: (v: string) => void;
}

export function AdminUsersHeader({
  isFetching,
  refetchUsers,
  handleExport,
  search,
  setSearch,
}: AdminUsersHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-7 h-7 text-brand-secondary-400" />
            Customers
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your customer database and view their activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetchUsers()}
            disabled={isFetching}
            className="bg-muted/50 border-border"
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground font-medium px-6">
                <Printer className="mr-2 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-card border-border text-foreground"
            >
              <DropdownMenuItem
                onClick={() => handleExport("csv")}
                className="cursor-pointer hover:bg-accent"
              >
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("excel")}
                className="cursor-pointer hover:bg-accent"
              >
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("pdf")}
                className="cursor-pointer hover:bg-accent"
              >
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50"
          />
        </div>
      </div>
    </div>
  );
}
