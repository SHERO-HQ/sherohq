"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductRow } from "@/components/admin/product/ProductRow";
import { ProductHeaderActions } from "@/components/admin/product/ProductHeaderActions";
import { ProductFiltersBar } from "@/components/admin/product/ProductFiltersBar";
import { useAdminProducts } from "@/components/admin/product/useAdminProducts";

export default function AdminProducts() {
  const {
    canDelete,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    stockFilter,
    setStockFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    categories,
    isLoading,
    isPlaceholderData,
    refetchProducts,
    isFetching,
    filteredProducts,
    totalPages,
    paginatedProducts,
    handleDelete,
    handleToggleStock,
    handleExport,
  } = useAdminProducts();

  return (
    <div className="space-y-6 relative">
      {isPlaceholderData && (
        <div className="absolute inset-0 bg-card/10 z-10 pointer-events-none transition-opacity" />
      )}

      {/* Header & Filters Sticky Bar */}
      <div className="sticky top-20 z-20 bg-background/95 backdrop-blur-md py-3 pb-4 -mx-3 px-3 md:-mx-6 md:px-6 border-b border-border/50 space-y-4 shadow-xs rounded-b">
        <ProductHeaderActions
          onRefetch={() => refetchProducts()}
          isFetching={isFetching}
          onExport={handleExport}
        />

        {/* Filters */}
        <ProductFiltersBar
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          stockFilter={stockFilter}
          setStockFilter={setStockFilter}
          categories={categories}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Products Table */}
      <div className="bg-card/40 border border-border rounded overflow-hidden max-h-[calc(100vh-16rem)] flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Product
                </th>
                <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  SKU
                </th>
                <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Price
                </th>
                <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Stock
                </th>
                <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                new Array(5).fill(0).map((_, i) => (
                  <tr
                    key={`skel-${i}`}
                    className="animate-pulse border-b border-border"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-muted shrink-0" />
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-24" />
                          <div className="h-3 bg-muted rounded w-16 opacity-50" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-muted rounded w-12" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-muted rounded w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-muted rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-20" />
                        <div className="h-1 bg-muted rounded w-12" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <div className="w-8 h-8 rounded bg-muted" />
                        <div className="w-8 h-8 rounded bg-muted" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No products found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    canDelete={canDelete}
                    handleDelete={handleDelete}
                    handleToggleStock={handleToggleStock}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)}{" "}
              of {filteredProducts.length} entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-border"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </Button>
              <div className="flex items-center gap-1">
                {new Array(totalPages).fill(0).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    className={cn(
                      "h-8 w-8 text-xs",
                      currentPage === i + 1
                        ? "bg-brand-secondary-600 hover:bg-brand-secondary-500 border-none"
                        : "border-border text-foreground",
                    )}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-border"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4 text-foreground" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
