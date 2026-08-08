"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "motion/react";
import { useProducts } from "@/hooks/queries/useProducts";
import { getImageUrl } from "@/services/api";
import AppImage from "@/components/common/AppImage";

interface SearchBarProps {
    className?: string;
    alwaysOpen?: boolean;
}

const SearchBar = ({ className = "", alwaysOpen = false }: SearchBarProps) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(alwaysOpen);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Live search from DB
    const { data: allProducts = [], isLoading: searchLoading } = useProducts(
        undefined,
        query.length > 1 ? query : undefined,
    );

    const filteredProducts = query.length > 1 ? allProducts : [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/shop?search=${encodeURIComponent(query)}`);
            closeSearch();
        }
    };

    const openSearch = () => {
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const closeSearch = useCallback(() => {
        if (alwaysOpen) return;
        setIsOpen(false);
        setQuery("");
    }, [alwaysOpen]);

    // Close on Escape key & lock scroll for desktop overlay only
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeSearch();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            // Only lock body scroll for the desktop overlay — the mobile
            // inline search (alwaysOpen) lives inside NavigationBar's menu
            // which already manages its own scroll lock.
            if (!alwaysOpen) {
                document.body.style.overflow = "hidden";
            }
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
            if (!alwaysOpen) {
                document.body.style.overflow = "unset";
            }
        };
    }, [isOpen, alwaysOpen, closeSearch]);

    // For alwaysOpen mode (mobile), render inline
    if (alwaysOpen) {
        return (
            <div className={`relative ${className}`}>
                <form onSubmit={handleSearch} className="relative">
                    <div className="flex items-center w-full rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus-within:border-brand-secondary-500 focus-within:ring-2 focus-within:ring-brand-secondary-500/30 transition-all pr-10">
                        <button
                            type="submit"
                            className="flex items-center justify-center w-10 h-10 text-slate-500 dark:text-slate-400 hover:text-brand-secondary-600 transition-colors shrink-0"
                            aria-label="Search"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search shop..."
                            className="bg-transparent border-none focus:ring-0 text-sm w-full h-10 outline-none text-slate-900 dark:text-white pr-4"
                        />
                    </div>
                </form>

                {/* Results Dropdown */}
                <AnimatePresence>
                    {query.length > 1 && (
                        <m.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded shadow border border-slate-200 dark:border-slate-800 max-h-96 overflow-y-auto z-50"
                        >
                            {filteredProducts.length > 0 ? (
                                <div className="py-2">
                                    {filteredProducts.slice(0, 5).map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => {
                                                router.push(`/shop/${product.id}`);
                                                setQuery("");
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors text-left"
                                        >
                                            <div className="relative w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                                <AppImage
                                                    src={getImageUrl(product.image)}
                                                    alt={product.name}
                                                    fill
                                                    sizes="40px"
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white line-clamp-1">
                                                    {product.name}
                                                </div>
                                                <div className="text-brand-secondary-600 dark:text-brand-secondary-400 text-sm font-bold">
                                                    GHS{product.price}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                                    No items found for "{query}"
                                </div>
                            )}
                        </m.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Desktop: Icon that opens overlay
    return (
        <div className={className}>
            {/* Search Trigger Button */}
            <button
                onClick={openSearch}
                className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors"
                aria-label="Open Search"
            >
                <Search className="w-5 h-5" />
            </button>

            {/* Search Overlay Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeSearch}
                            className="fixed inset-0 bg-black/50  z-100"
                        />

                        {/* Search Panel */}
                        <m.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 shadow z-101 p-4 border-b border-slate-200 dark:border-slate-800"
                        >
                            <div className="container max-w-3xl mx-auto">
                                <form onSubmit={handleSearch} className="relative">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800 rounded px-4 relative border border-slate-300 dark:border-slate-700 focus-within:border-brand-secondary-500 focus-within:ring-2 focus-within:ring-brand-secondary-500/30 transition-all">
                                            <Search className="w-5 h-5 text-slate-400 shrink-0" />
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                placeholder="Search our shop..."
                                                className="w-full h-10 bg-transparent border-none focus:ring-0 text-base outline-none text-slate-900 dark:text-white pl-3"
                                                autoComplete="off"
                                            />
                                            {searchLoading && (
                                                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                                                    <div className="w-5 h-5 border-2 border-brand-secondary-500 border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}
                                            {query && (
                                                <button
                                                    type="button"
                                                    onClick={() => setQuery("")}
                                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-slate-400" />
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={closeSearch}
                                            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>

                                {/* Results */}
                                {query.length > 1 && (
                                    <div className="mt-4 max-h-[60vh] overflow-y-auto">
                                        {filteredProducts.length > 0 ? (
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 mb-3">
                                                    {filteredProducts.length} result
                                                    {filteredProducts.length > 1 ? "s" : ""}
                                                </p>
                                                {filteredProducts.slice(0, 8).map((product) => (
                                                    <button
                                                        key={product.id}
                                                        onClick={() => {
                                                            router.push(`/shop/${product.id}`);
                                                            closeSearch();
                                                        }}
                                                        className="w-full flex items-center gap-4 p-3 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-left"
                                                    >
                                                        <div className="relative w-14 h-14 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                                            <AppImage
                                                                src={getImageUrl(product.image)}
                                                                alt={product.name}
                                                                fill
                                                                sizes="56px"
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                                                {product.name}
                                                            </div>
                                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                                {product.category}
                                                            </div>
                                                        </div>
                                                        <div className="text-brand-secondary-600 dark:text-brand-secondary-400 font-bold">
                                                            GHS{product.price}
                                                        </div>
                                                    </button>
                                                ))}

                                                {filteredProducts.length > 8 && (
                                                    <button
                                                        onClick={handleSearch}
                                                        className="w-full py-2 text-center text-brand-secondary-600 dark:text-brand-secondary-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                    >
                                                        View all {filteredProducts.length} results →
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <Search className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400">
                                                    No items found for{" "}
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                                        "{query}"
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Quick hint when empty */}
                                {!query && (
                                    <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                        <p>Start typing to search the shop</p>
                                        <p className="mt-1 text-xs">
                                            Press{" "}
                                            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 font-mono">
                                                Esc
                                            </kbd>{" "}
                                            to close
                                        </p>
                                    </div>
                                )}
                            </div>
                        </m.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchBar;
