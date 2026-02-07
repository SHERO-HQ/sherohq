import { useState, useMemo } from "react";
import UniversalLink from "@/components/common/UniversalLink";
import { getImageUrl } from "@/services/api";
import { useNotifications } from "@/hooks/useNotifications";
import type { Product, Category } from "@/types/product";
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
import AdminLayout from "@/components/admin/AdminLayout";
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

export default function AdminProducts() {
  const { addNotification } = useNotifications();

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
  );

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const deleteMutation = useDeleteProduct();
  const stockMutation = useUpdateProductStock();

  const isLoading = productsLoading || categoriesLoading;

  // Filtered products for stock filter (searching is handled by the hook)
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const stock = product.stockQuantity ?? product.quantity;
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
    if (!globalThis.confirm?.("Are you sure you want to delete this product?"))
      return;

    try {
      await deleteMutation.mutateAsync(id);
      addNotification("Success", "Product deleted successfully", "success");
    } catch {
      addNotification("Error", "Failed to delete product", "error");
    }
  };

  const handleToggleStock = async (product: Product) => {
    try {
      const newQuantity = product.inStock ? 0 : 10;
      await stockMutation.mutateAsync({
        id: product.id,
        quantity: newQuantity,
      });
      addNotification(
        "Success",
        `Product marked as ${newQuantity > 0 ? "in stock" : "out of stock"}`,
        "success",
      );
    } catch {
      addNotification("Error", "Failed to update stock", "error");
    }
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const dataToExport = filteredProducts.map((p) => ({
      ID: p.id,
      Name: p.name,
      Category: p.category,
      Price: `GH₵ ${p.price}`,
      Stock: p.stockQuantity,
      Status: p.inStock ? "In Stock" : "Out of Stock",
    }));

    const filename = `products-export-${new Date().toISOString().split("T")[0]}`;
    const columns = ["ID", "Name", "Category", "Price", "Stock", "Status"];

    if (format === "csv") exportToCSV(dataToExport, filename);
    else if (format === "excel") exportToExcel(dataToExport, filename);
    else exportToPDF(dataToExport, columns, filename, "Products List");

    addNotification(
      "Export",
      `Products exported as ${format.toUpperCase()}`,
      "success",
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6 relative">
        {isPlaceholderData && (
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-10 pointer-events-none transition-opacity" />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white font-sora">
              Products
            </h1>
            <p className="text-slate-400 text-sm">
              Manage your store inventory and pricing
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetchProducts()}
              disabled={isFetching}
              className="bg-slate-800/50 border-white/5"
            >
              <RefreshCw
                className={cn("w-4 h-4", isFetching && "animate-spin")}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-slate-800/50 border-white/5 text-white hover:bg-white/5"
                >
                  <Printer className="w-4 h-4 mr-2" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-slate-900 border-white/10 text-white"
                align="end"
              >
                <DropdownMenuItem
                  onClick={() => handleExport("csv")}
                  className="hover:bg-white/5 cursor-pointer"
                >
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("excel")}
                  className="hover:bg-white/5 cursor-pointer"
                >
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("pdf")}
                  className="hover:bg-white/5 cursor-pointer"
                >
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4"
              asChild
            >
              <UniversalLink to="/admin/products/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </UniversalLink>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-800/50 border-white/5 text-white"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-800/50 border border-white/5 rounded text-sm text-white p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
              className="bg-slate-800/50 border border-white/5 rounded text-sm text-white p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="all">All Stock Status</option>
              <option value="low">Low Stock (≤ 5)</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </Card>

        {/* Products Table */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/50 border-b border-white/5">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  new Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8">
                        <div className="h-4 bg-slate-800 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No products found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-slate-800 overflow-hidden shrink-0 border border-white/5">
                            <img
                              src={getImageUrl(product.image)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <UniversalLink
                              to={`/admin/products/${product.slug || product.sku || product.id}/edit`}
                              className="text-sm font-semibold text-white hover:text-emerald-400 font-sora transition-colors"
                            >
                              {product.name}
                            </UniversalLink>
                            <p className="text-xs text-slate-500 font-mono">
                              ID: {product.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                          {product.sku || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 bg-transparent">
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-400 border-none capitalize"
                        >
                          {product.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-white">
                        GH₵{product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              product.quantity === 0
                                ? "text-rose-400"
                                : product.quantity <= 5
                                  ? "text-amber-400"
                                  : "text-emerald-400",
                            )}
                          >
                            {product.quantity} in stock
                          </span>
                          <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                product.quantity === 0
                                  ? "bg-rose-500"
                                  : product.quantity <= 5
                                    ? "bg-amber-500"
                                    : "bg-emerald-500",
                              )}
                              style={{
                                width: `${Math.min(100, (product.quantity / 20) * 100)}%`,
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
                            className="h-8 w-8 text-slate-400 hover:text-white"
                            asChild
                          >
                            <UniversalLink
                              to={`/admin/products/${product.slug || product.sku || product.id}/edit`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </UniversalLink>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-slate-400 hover:text-white"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className="bg-slate-900 border-white/10 text-white"
                              align="end"
                            >
                              <DropdownMenuItem
                                className="hover:bg-white/5 cursor-pointer"
                                asChild
                              >
                                <a
                                  href={`/products/${product.slug || product.sku || product.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" /> View
                                  on Site
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="hover:bg-white/5 cursor-pointer"
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
                              <DropdownMenuSeparator className="bg-white/5" />
                              <DropdownMenuItem
                                className="text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                Product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-800/30 border-t border-white/5 flex items-center justify-between">
              <p className="text-sm text-slate-400 font-sora">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)}{" "}
                of {filteredProducts.length} entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-white/10"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 text-white" />
                </Button>
                <div className="flex items-center gap-1">
                  {new Array(totalPages).fill(0).map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      className={cn(
                        "h-8 w-8 text-xs",
                        currentPage === i + 1
                          ? "bg-emerald-600 hover:bg-emerald-500 border-none"
                          : "border-white/10 text-white",
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
                  className="h-8 w-8 border-white/10"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
