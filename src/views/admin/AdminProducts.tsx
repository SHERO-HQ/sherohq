"use client";
import React, { useState, useMemo, memo } from "react";
import Link from "next/link";
import { getImageUrl } from "@/services/api";
import { useNotifications } from "@/hooks/useNotifications";
import { useDialog } from "@/hooks/useDialog";
import { getErrorMessage } from "@/utils/error";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import type { Product, Category } from "@/types/product";
import AppImage from "@/components/common/AppImage";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Printer,
  RefreshCw,
  MoreVertical,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";
import {
  useProducts,
  useDeleteProduct,
  useUpdateProductStock,
} from "@/hooks/queries/useProducts";
import { useCategories } from "@/hooks/queries/useCategories";
import { Card } from "@/components/ui/card";

// Memoized row component for maximum performance during polling
const ProductRow = memo(({ 
  product, 
  canDelete, 
  handleDelete, 
  handleToggleStock 
}: { 
  product: Product; 
  canDelete: boolean;
  handleDelete: (id: string) => void;
  handleToggleStock: (product: Product) => void;
}) => (
  <tr className="hover:bg-accent transition-colors group">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded bg-muted overflow-hidden shrink-0 border border-border">
          <AppImage
            src={getImageUrl(product.image)}
            alt={product.name}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div>
          <Link
            href={`/admin/products/${product.slug || product.sku || product.id}/edit`}
            className="text-sm font-semibold text-foreground hover:text-brand-secondary-400 transition-colors"
          >
            {product.name}
          </Link>
          <p className="text-xs text-muted-foreground font-mono">
            ID: {product.id.slice(0, 8)}
          </p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
        {product.sku || "-"}
      </span>
    </td>
    <td className="px-6 py-4 bg-transparent">
      <Badge
        variant="outline"
        className="bg-brand-secondary-500/10 text-brand-secondary-400 border-none capitalize"
      >
        {product.category}
      </Badge>
    </td>
    <td className="px-6 py-4 text-sm font-bold text-foreground">
      GH₵{product.price.toLocaleString()}
    </td>
    <td className="px-6 py-4">
      <div className="flex flex-col gap-1">
        <span
          className={cn(
            "text-sm font-medium",
            (product.quantity ?? 0) === 0
              ? "text-rose-400"
              : (product.quantity ?? 0) <= 5
                ? "text-amber-400"
                : "text-brand-secondary-400",
          )}
        >
          {(product.quantity || 0) === 0
            ? "Out of stock"
            : `${product.quantity || 0} in stock`}
        </span>
        <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition duration-500",
              (product.quantity ?? 0) === 0
                ? "bg-rose-500"
                : (product.quantity ?? 0) <= 5
                  ? "bg-amber-500"
                  : "bg-brand-secondary-500",
            )}
            style={{
              width: `${Math.min(100, ((product.quantity || 0) / 20) * 100)}%`,
            }}
          />
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex items-center justify-end gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link
            href={`/admin/products/${product.slug || product.sku || product.id}/edit`}
          >
            <Edit2 className="w-4 h-4" />
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-card border-border text-foreground"
            align="end"
          >
            <DropdownMenuItem
              className="hover:bg-accent cursor-pointer"
              asChild
            >
              <a
                href={`/shop/${product.slug || product.sku || product.id}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" /> View
                on Site
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-accent cursor-pointer"
              onClick={() => handleToggleStock(product)}
            >
              {product.inStock ? (
                <>
                  <X className="w-4 h-4 mr-2" /> Mark Out of
                  Stock
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />{" "}
                  Mark In Stock
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-accent/50" />
            {canDelete && (
              <DropdownMenuItem
                className="text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                onClick={() => handleDelete(product.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
                Product
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </td>
  </tr>
));

export default function AdminProducts() {
  const { addNotification } = useNotifications();
  const dialog = useDialog();
  const { admin: currentAdmin } = useAdmin();
  const canDelete = !["clerk", "attendant"].includes(currentAdmin?.role || "");

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // React Query Hooks
  const {
    data: allProducts = [],
    isLoading: productsLoading,
    isPlaceholderData,
    refetch: refetchProducts,
    isFetching,
  } = useProducts(
    selectedCategory === "all" ? undefined : selectedCategory,
    search,
    ADMIN_POLLING_INTERVAL,
  );

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const deleteMutation = useDeleteProduct();
  const stockMutation = useUpdateProductStock();

  const isLoading = productsLoading || categoriesLoading;

  // Filtered products for stock filter (searching is handled by the hook)
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const stock = product.stockQuantity ?? product.quantity ?? 0;
      if (stockFilter === "low") return stock > 0 && stock <= 5;
      if (stockFilter === "out") return stock === 0;
      return true;
    });
  }, [allProducts, stockFilter]);

  // Client-side pagination for the filtered results
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDelete = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: "Delete Product",
      message: "Are you sure you want to delete this product?",
      type: "error",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
      addNotification("Success", "Product deleted successfully", "success");
    } catch (err) {
      addNotification("Error", getErrorMessage(err, "Failed to delete product"), "error");
    }
  };

  const handleToggleStock = async (product: Product) => {
    try {
      let newQuantity = 0;
      
      if (!product.inStock) {
        const input = await dialog.prompt({
          title: "Update Stock Quantity",
          message: "Enter the stock quantity for this product:",
          defaultValue: "1",
        });
        if (input === null || input.trim() === "") return; // User cancelled
        
        newQuantity = parseInt(input, 10);
        if (isNaN(newQuantity) || newQuantity <= 0) {
          addNotification("Error", "Please enter a valid number greater than 0", "error");
          return;
        }
      }

      await stockMutation.mutateAsync({
        id: product.id,
        quantity: newQuantity,
      });
      addNotification(
        "Success",
        `Product marked as ${newQuantity > 0 ? "in stock" : "out of stock"}`,
        "success",
      );
    } catch (err) {
      addNotification("Error", getErrorMessage(err, "Failed to update stock"), "error");
    }
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    const dataToExport = filteredProducts.map((p) => ({
      ID: p.id,
      Name: p.name,
      Category: p.category,
      Price: `GH₵ ${p.price.toLocaleString()}`,
      Stock: p.quantity ?? 0,
      Status: (p.quantity ?? 0) > 0 ? "In Stock" : "Out of Stock",
    }));

    const fileName = `SHERO-Products-${new Date().toISOString().split("T")[0]}`;
    const columns = ["ID", "Name", "Category", "Price", "Stock", "Status"];

    if (format === "csv") await exportToCSV(dataToExport, fileName);
    else if (format === "excel") await exportToExcel(dataToExport, fileName);
    else await exportToPDF(dataToExport, columns, fileName, "Products Report");

    addNotification(
      "Export",
      `Products exported as ${format.toUpperCase()}`,
      "success",
    );
  };

  return (
    <div className="space-y-6 relative">
        {isPlaceholderData && (
          <div className="absolute inset-0 bg-card/10 -[1px] z-10 pointer-events-none transition-opacity" />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground text-sm">
              Manage your store inventory and pricing
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetchProducts()}
              disabled={isFetching}
              className="bg-muted/50 border-border"
            >
              <RefreshCw
                className={cn("w-4 h-4", isFetching && "animate-spin")}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-muted/50 border-border text-foreground hover:bg-accent"
                >
                  <Printer className="w-4 h-4 mr-2" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-card border-border text-foreground"
                align="end"
              >
                <DropdownMenuItem
                  onClick={() => handleExport("csv")}
                  className="hover:bg-accent cursor-pointer"
                >
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("excel")}
                  className="hover:bg-accent cursor-pointer"
                >
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("pdf")}
                  className="hover:bg-accent cursor-pointer"
                >
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white font-medium px-4"
              asChild
            >
              <Link href="/admin/products/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-card/40  border-border p-4">
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

        {/* Products Table */}
        <div className="bg-card/40  border border-border rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  new Array(5).fill(0).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse border-b border-border">
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
