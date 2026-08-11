"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Category } from "@/types/product";

interface ProductFiltersBarProps {
  search: string;
  setSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  stockFilter: string;
  setStockFilter: (val: string) => void;
  categories: Category[];
  setCurrentPage: (page: number) => void;
}

export function ProductFiltersBar({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  stockFilter,
  setStockFilter,
  categories,
  setCurrentPage,
}: ProductFiltersBarProps) {
  return (
    <Card className="bg-card/40 border-border p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/50 border-border text-foreground"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-muted/50 border border-border rounded text-sm text-foreground p-2 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50"
        >
          <option value="all">All Categories</option>
          {categories.map((cat: Category) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => {
            setStockFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-muted/50 border border-border rounded text-sm text-foreground p-2 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50"
        >
          <option value="all">All Stock Status</option>
          <option value="low">Low Stock (≤ 5)</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>
    </Card>
  );
}
