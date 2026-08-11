"use client";
import React from "react";
import { Search, Loader2, X } from "lucide-react";

interface SearchInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  query: string;
  setQuery: (val: string) => void;
  isLoading: boolean;
  onClose: () => void;
}

export function SearchInput({
  inputRef,
  query,
  setQuery,
  isLoading,
  onClose,
}: SearchInputProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
      <Search className="w-5 h-5 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search products, orders, customers..."
        className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-slate-500 text-lg"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="flex items-center gap-2">
        {isLoading && (
          <Loader2 className="w-4 h-4 text-brand-secondary-400 animate-spin" />
        )}
        <button
          onClick={onClose}
          className="p-1 hover:bg-accent rounded text-muted-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
