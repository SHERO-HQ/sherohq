"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { globalAdminSearch, GlobalSearchResult } from "@/services/api";

import { SearchInput } from "./search/SearchInput";
import { SearchResults } from "./search/SearchResults";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>(null);

  const normalizedResults = results
    ? {
        products: Array.isArray(results.products) ? results.products : [],
        orders: Array.isArray(results.orders) ? results.orders : [],
        users: Array.isArray(results.users) ? results.users : [],
        inquiries: Array.isArray(results.inquiries) ? results.inquiries : [],
      }
    : null;

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults(null);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.trim().length < 2) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await globalAdminSearch(query);
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query]);

  // Flatten results for keyboard navigation
  const flatResults = useMemo(() => normalizedResults
    ? [
        ...normalizedResults.products.map((p: any) => ({
          ...p,
          type: "product",
          url: `/admin/products?edit=${p.id}`,
        })),
        ...normalizedResults.orders.map((o: any) => ({
          ...o,
          type: "order",
          url: `/admin/orders/${o.id}`,
        })),
        ...normalizedResults.users.map((u: any) => ({
          ...u,
          type: "user",
          url: `/admin/customers/${u.id}`,
        })),
        ...normalizedResults.inquiries.map((i: any) => ({
          ...i,
          type: "inquiry",
          url: `/admin/inquiries?id=${i.id}`,
        })),
      ]
    : [], [normalizedResults]);

  const handleSelect = useCallback(
    (item: any) => {
      router.push(item.url);
      onClose();
    },
    [router, onClose],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (flatResults.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) =>
            (prev - 1 + (flatResults.length || 1)) % (flatResults.length || 1),
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          handleSelect(flatResults[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, flatResults, selectedIndex, handleSelect, onClose]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-start justify-center pt-[10vh] px-4 md:px-0">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-card backdrop-blur-md"
            onClick={onClose}
          />

          <m.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl glass-surface-lg rounded overflow-hidden shadow flex flex-col"
          >
            <SearchInput 
              inputRef={inputRef} 
              query={query} 
              setQuery={setQuery} 
              isLoading={isLoading} 
              onClose={onClose} 
            />

            <SearchResults 
              normalizedResults={normalizedResults} 
              flatResults={flatResults} 
              isLoading={isLoading} 
              query={query} 
              selectedIndex={selectedIndex} 
              handleSelect={handleSelect} 
            />

            {/* Footer */}
            <div className="px-4 py-3 bg-accent/50 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 rounded bg-muted border border-border text-foreground">
                    ↵
                  </kbd>{" "}
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 rounded bg-muted border border-border text-foreground">
                    ↑↓
                  </kbd>{" "}
                  Navigate
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="hidden sm:inline">Press</span>
                <kbd className="px-1 rounded bg-muted border border-border text-foreground">
                  ESC
                </kbd>
                <span className="hidden sm:inline">to close</span>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default GlobalSearch;
