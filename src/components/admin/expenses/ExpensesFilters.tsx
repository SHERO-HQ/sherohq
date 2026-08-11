"use client";

import React from "react";
import { Search, Download, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface ExpensesFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  dateFilter: string;
  setDateFilter: (val: string) => void;
  customRange: DateRange | undefined;
  setCustomRange: (val: DateRange | undefined) => void;
  categories: string[];
  handleExport: (fmt: "csv" | "excel" | "pdf") => void;
}

export function ExpensesFilters({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  dateFilter,
  setDateFilter,
  customRange,
  setCustomRange,
  categories,
  handleExport,
}: ExpensesFiltersProps) {
  return (
    <Card className="bg-card/40 border-border p-4">
      <div className="flex flex-wrap gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/50 border-border text-foreground"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-muted/50 border border-border rounded text-sm text-foreground p-2"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <div className="flex bg-muted/50 border border-border rounded p-1 w-fit">
          {[
            { value: "all", label: "All" },
            { value: "7d", label: "7d" },
            { value: "30d", label: "30d" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDateFilter(opt.value)}
              className={cn(
                "px-3 py-1 rounded text-xs font-medium transition",
                dateFilter === opt.value
                  ? "bg-accent text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "bg-muted/50 border-border text-muted-foreground hover:text-foreground h-9 py-0",
                dateFilter === "range" &&
                  "bg-accent text-foreground border-brand-secondary-500/50",
              )}
              onClick={() => setDateFilter("range")}
            >
              Range
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 dark border-border bg-card"
            align="end"
          >
            <Calendar
              mode="range"
              defaultMonth={customRange?.from}
              selected={customRange}
              onSelect={setCustomRange}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2 md:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-border text-muted-foreground hover:text-foreground py-0"
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem
                onClick={() => handleExport("csv")}
                className="text-foreground hover:bg-accent gap-2"
              >
                <FileText className="w-4 h-4" /> CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("excel")}
                className="text-foreground hover:bg-accent gap-2"
              >
                <FileText className="w-4 h-4" /> Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("pdf")}
                className="text-foreground hover:bg-accent gap-2"
              >
                <FileText className="w-4 h-4" /> PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
