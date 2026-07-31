"use client";
import { Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useProducts } from "@/hooks/queries/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";

interface ProductSearchProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  className?: string;
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  initialQuery = "",
  onSearch,
  className = "",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);
  const { data: productsData, isLoading } = useProducts(undefined, debouncedQuery);

  const products: Product[] = productsData || [];
  const showDropdown = isFocused && query.trim().length > 0;

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch(query);
    setIsFocused(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center gap-2 group"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-slate-400 text-slate-500 group-focus-within:text-brand-secondary-600 transition-colors z-10" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search for products..."
            aria-label="Search products"
            className="w-full pl-12 pr-10 py-2 rounded
              dark:bg-slate-900/60 bg-white
              border dark:border-white/10 border-slate-200
              dark:text-white text-slate-700 placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-brand-secondary-600/50 focus:border-brand-secondary-600/50
              transition shadow-sm"
          />
          {isLoading && query.trim().length > 0 && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-brand-secondary-600" />
          )}
        </div>

        <button
          type="submit"
          className="hidden sm:block px-8 py-2 rounded bg-brand-secondary-600 text-white font-semibold
            hover:bg-brand-secondary-500 hover:shadow hover:shadow-brand-secondary-500/25
            transition cursor-pointer whitespace-nowrap"
        >
          Search
        </button>
      </form>

      {/* Auto-complete Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              Searching...
            </div>
          ) : products.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto py-2">
              {products.slice(0, 5).map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.id}`}
                    onClick={() => setIsFocused(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="relative w-10 h-10 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                          <Search className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {product.category}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-brand-secondary-600 dark:text-brand-secondary-400">
                      ${Number(product.price).toFixed(2)}
                    </div>
                  </Link>
                </li>
              ))}
              {products.length > 5 && (
                <li className="px-4 py-2 text-center border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => handleSubmit()}
                    className="text-sm text-brand-secondary-600 dark:text-brand-secondary-400 hover:underline font-medium"
                  >
                    View all {products.length} results
                  </button>
                </li>
              )}
            </ul>
          ) : (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              No products found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
