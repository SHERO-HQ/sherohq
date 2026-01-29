import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { products } from "@/data/products";

interface SearchBarProps {
  className?: string;
  alwaysOpen?: boolean;
}

const SearchBar = ({ className = "", alwaysOpen = false }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(alwaysOpen);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const filteredProducts =
    query.length > 1
      ? products.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()),
        )
      : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      closeSearch();
    }
  };

  const openSearch = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    if (alwaysOpen) return;
    setIsOpen(false);
    setQuery("");
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, alwaysOpen]);

  // For alwaysOpen mode (mobile), render inline
  if (alwaysOpen) {
    return (
      <div className={`relative ${className}`}>
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center w-full rounded-full bg-slate-100 dark:bg-slate-800 border border-transparent focus-within:border-emerald-500 pr-10">
            <button
              type="submit"
              className="flex items-center justify-center w-10 h-10 text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="bg-transparent border-none focus:ring-0 text-sm w-full h-10 outline-none text-slate-900 dark:text-white pr-4"
            />
          </div>
        </form>

        {/* Results Dropdown */}
        <AnimatePresence>
          {query.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded shadow-xl border border-slate-200 dark:border-slate-800 max-h-96 overflow-y-auto z-50"
            >
              {filteredProducts.length > 0 ? (
                <div className="py-2">
                  {filteredProducts.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        navigate(`/products/${product.id}`);
                        setQuery("");
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          navigate(`/products/${product.id}`);
                          setQuery("");
                        }
                      }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {product.image?.startsWith("/") ||
                        product.image?.startsWith("http") ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">{product.image}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white line-clamp-1">
                          {product.name}
                        </div>
                        <div className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                          GH₵{product.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No products found for "{query}"
                </div>
              )}
            </motion.div>
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
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        aria-label="Open Search"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Search Overlay Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSearch}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />

            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 shadow-2xl z-[101] p-4 border-b border-slate-200 dark:border-slate-800"
            >
              <div className="container max-w-3xl mx-auto">
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800 rounded px-4">
                      <Search className="w-5 h-5 text-slate-400 shrink-0" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full h-14 bg-transparent border-none focus:ring-0 text-lg outline-none text-slate-900 dark:text-white pl-3"
                        autoComplete="off"
                      />
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
                          <div
                            key={product.id}
                            onClick={() => {
                              navigate(`/products/${product.id}`);
                              closeSearch();
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                navigate(`/products/${product.id}`);
                                closeSearch();
                              }
                            }}
                            className="flex items-center gap-4 p-3 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                          >
                            <div className="w-14 h-14 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                              {product.image?.startsWith("/") ||
                              product.image?.startsWith("http") ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl">
                                  {product.image}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                {product.name}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {product.category}
                              </div>
                            </div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                              GH₵{product.price}
                            </div>
                          </div>
                        ))}

                        {filteredProducts.length > 8 && (
                          <button
                            onClick={handleSearch}
                            className="w-full py-2 text-center text-emerald-600 dark:text-emerald-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
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
                          No products found for "
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {query}
                          </span>
                          "
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick hint when empty */}
                {!query && (
                  <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    <p>Start typing to search for products</p>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
