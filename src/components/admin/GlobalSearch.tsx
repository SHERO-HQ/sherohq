"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  ChevronRight,
  Loader2,
  X,
  Command,
} from "lucide-react";
import { m, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { globalAdminSearch, GlobalSearchResult } from "@/services/api";
import { cn } from "@/lib/utils";
import AppImage from "@/components/common/AppImage";

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
            {/* Search Input Area */}
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

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
              {!results && !isLoading && query.length < 2 && (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground text-sm">
                  <Command className="w-12 h-12 mb-4 opacity-10" />
                  <p>Type at least 2 characters to search...</p>
                  <div className="mt-6 flex items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-accent/50 border border-border text-foreground">
                        ↑↓
                      </kbd>{" "}
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-accent/50 border border-border text-foreground">
                        ↵
                      </kbd>{" "}
                      Select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-accent/50 border border-border text-foreground">
                        ESC
                      </kbd>{" "}
                      Close
                    </span>
                  </div>
                </div>
              )}

              {isLoading && !results && (
                <div className="py-12 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-brand-secondary-400 animate-spin opacity-50" />
                </div>
              )}

              {normalizedResults && flatResults.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                  <p>No results found for "{query}"</p>
                </div>
              )}

              {normalizedResults && (
                <div className="space-y-4 py-2">
                  {/* Products Section */}
                  {normalizedResults.products.length > 0 && (
                    <div>
                      <h3 className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Package className="w-3 h-3" />
                        Products
                      </h3>
                      <div className="mt-1 space-y-1">
                        {normalizedResults.products.map(
                          (item: any, id: number) => {
                            const index = id; // This needs proper global index
                            return (
                              <ResultItem
                                key={item.id}
                                icon={<Package className="w-4 h-4" />}
                                title={item.name}
                                subtitle={`SKU: ${item.sku} • $${item.price}`}
                                image={item.image}
                                isSelected={
                                  flatResults[selectedIndex]?.id === item.id
                                }
                                onClick={() =>
                                  handleSelect({
                                    ...item,
                                    url: `/admin/products?edit=${item.id}`,
                                  })
                                }
                              />
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}

                  {/* Orders Section */}
                  {normalizedResults.orders.length > 0 && (
                    <div>
                      <h3 className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <ShoppingCart className="w-3 h-3" />
                        Orders
                      </h3>
                      <div className="mt-1 space-y-1">
                        {normalizedResults.orders.map((item: any) => (
                          <ResultItem
                            key={item.id}
                            icon={<ShoppingCart className="w-4 h-4" />}
                            title={`Order #${item.id.slice(0, 8)}`}
                            subtitle={`${item.shippingInfo?.firstName} ${item.shippingInfo?.lastName} • $${item.total} • ${item.status}`}
                            isSelected={
                              flatResults[selectedIndex]?.id === item.id
                            }
                            onClick={() =>
                              handleSelect({
                                ...item,
                                url: `/admin/orders/${item.id}`,
                              })
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customers Section */}
                  {normalizedResults.users.length > 0 && (
                    <div>
                      <h3 className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Customers
                      </h3>
                      <div className="mt-1 space-y-1">
                        {normalizedResults.users.map((item: any) => (
                          <ResultItem
                            key={item.id}
                            icon={<Users className="w-4 h-4" />}
                            title={item.name}
                            subtitle={item.email}
                            image={item.avatar}
                            isSelected={
                              flatResults[selectedIndex]?.id === item.id
                            }
                            onClick={() =>
                              handleSelect({
                                ...item,
                                url: `/admin/customers/${item.id}`,
                              })
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inquiries Section */}
                  {normalizedResults.inquiries.length > 0 && (
                    <div>
                      <h3 className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" />
                        Inquiries
                      </h3>
                      <div className="mt-1 space-y-1">
                        {normalizedResults.inquiries.map((item: any) => (
                          <ResultItem
                            key={item.id}
                            icon={<MessageSquare className="w-4 h-4" />}
                            title={item.subject}
                            subtitle={`${item.name} • ${item.status}`}
                            isSelected={
                              flatResults[selectedIndex]?.id === item.id
                            }
                            onClick={() =>
                              handleSelect({
                                ...item,
                                url: `/admin/inquiries?id=${item.id}`,
                              })
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

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

interface ResultItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  image?: string;
  isSelected: boolean;
  onClick: () => void;
}

const ResultItem = ({
  icon,
  title,
  subtitle,
  image,
  isSelected,
  onClick,
}: ResultItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded transition-all text-left group",
        isSelected
          ? "bg-brand-secondary-500/10 border-l-2 border-brand-secondary-500 pl-2.5"
          : "hover:bg-accent border-l-2 border-transparent",
      )}
    >
      <div
        className={cn(
          "relative shrink-0 w-8 h-8 rounded flex items-center justify-center overflow-hidden border",
          isSelected
            ? "bg-brand-secondary-500/20 border-brand-secondary-500/30 text-brand-secondary-400"
            : "bg-muted border-border text-muted-foreground",
        )}
      >
        {image ? (
          <AppImage
            src={image}
            alt=""
            fill
            sizes="32px"
            className="object-cover"
          />
        ) : (
          icon
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-sm font-medium truncate",
            isSelected ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {title}
        </div>
        <div className="text-xs text-muted-foreground truncate">{subtitle}</div>
      </div>
      <ChevronRight
        className={cn(
          "w-4 h-4 transition-transform",
          isSelected
            ? "text-brand-secondary-500 translate-x-0"
            : "text-slate-700 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0",
        )}
      />
    </button>
  );
};

export default GlobalSearch;
