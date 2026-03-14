"use client";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center gap-2 group ${className}`}
    >
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-slate-400 text-slate-500 group-focus-within:text-emerald-600 transition-colors z-10" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products..."
          aria-label="Search products"
          className="w-full pl-12 pr-4 py-2 rounded
                   dark:bg-slate-900/60 bg-white
                   border dark:border-white/10 border-slate-200
                   dark:text-white text-slate-700 placeholder:text-slate-500
                   focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50
                   transition shadow-sm"
        />
      </div>

      <button
        type="submit"
        className="hidden sm:block px-8 py-2 rounded bg-emerald-600 text-white font-semibold
                 hover:bg-emerald-500 hover:shadow-md hover:shadow-emerald-500/25
                 transition cursor-pointer whitespace-nowrap"
      >
        Search
      </button>
    </form>
  );
};

export default ProductSearch;
