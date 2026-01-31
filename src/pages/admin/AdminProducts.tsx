import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  fetchProducts,
  fetchCategories,
  deleteProduct,
  updateProductStock,
  getImageUrl,
} from "@/services/api";
import type { Product } from "@/data/products";
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
  MoreVertical,
  Printer,
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

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts(selectedCategory, search),
        fetchCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!globalThis.confirm?.("Are you sure you want to delete this product?"))
      return;

    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert(
        "Failed to delete product: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    }
  };

  const handleToggleStock = async (product: Product) => {
    try {
      const newQuantity = product.inStock ? 0 : 10;
      await updateProductStock(product.id, newQuantity);
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, inStock: !p.inStock } : p,
        ),
      );
    } catch (err) {
      alert(
        "Failed to update stock: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    }
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const dataToExport = filteredProducts.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      inStock: p.inStock ? "Yes" : "No",
      description: p.description,
    }));

    const fileName = `products_${new Date().toISOString().split("T")[0]}`;
    const columns = [
      "id",
      "name",
      "category",
      "price",
      "inStock",
      "description",
    ];

    if (format === "csv") exportToCSV(dataToExport, fileName);
    else if (format === "excel") exportToExcel(dataToExport, fileName);
    else
      exportToPDF(dataToExport, columns, fileName, "Products Inventory Report");
  };

  const filteredProducts = products.filter((product) => {
    if (stockFilter === "in-stock" && !product.inStock) return false;
    if (stockFilter === "out-of-stock" && product.inStock) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white font-sora">
              Products
            </h1>
            <p className="text-slate-400 text-sm">
              Manage your inventory and product listings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5"
                >
                  <Printer className="mr-2 h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-900 border-white/10 text-white"
              >
                <DropdownMenuItem
                  onClick={() => handleExport("csv")}
                  className="cursor-pointer hover:bg-white/5"
                >
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("excel")}
                  className="cursor-pointer hover:bg-white/5"
                >
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("pdf")}
                  className="cursor-pointer hover:bg-white/5"
                >
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              asChild
            >
              <Link to="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" /> Add New Product
              </Link>
            </Button>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/5 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search products..."
                className="pl-10 bg-slate-800/50 border-white/5 text-white placeholder:text-slate-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="bg-slate-800 border-white/5 text-sm text-white rounded px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500/50"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                className="bg-slate-800 border-white/5 text-sm text-white rounded px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500/50"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-white/5"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                  setStockFilter("all");
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Product
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
                      <td colSpan={5} className="px-6 py-6">
                        <div className="h-10 bg-slate-800 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : currentProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No products found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  currentProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-white/2 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded bg-slate-800 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden text-2xl">
                            {product.image.length <= 4 ? (
                              product.image
                            ) : (
                              <img
                                src={getImageUrl(product.image)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-white truncate">
                              {product.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ID: {product.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="bg-slate-800/50 border-white/5 text-slate-300 capitalize"
                        >
                          {product.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-white">
                        GH₵{product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              product.inStock
                                ? "bg-emerald-500"
                                : "bg-rose-500",
                            )}
                          />
                          <span
                            className={cn(
                              "text-sm font-medium",
                              product.inStock
                                ? "text-emerald-400"
                                : "text-rose-400",
                            )}
                          >
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-white"
                            asChild
                          >
                            <Link to={`/admin/products/${product.id}/edit`}>
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-white"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-slate-900 border-white/10 text-white"
                            >
                              <DropdownMenuItem asChild>
                                <Link
                                  to={`/products/${product.id}`}
                                  target="_blank"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" /> View
                                  Site
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStock(product)}
                              >
                                {product.inStock ? (
                                  <X className="mr-2 h-4 w-4 text-rose-400" />
                                ) : (
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />
                                )}
                                {product.inStock
                                  ? "Mark Out of Stock"
                                  : "Mark In Stock"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/5" />
                              <DropdownMenuItem
                                className="text-rose-400 focus:text-rose-400"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
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

          {!isLoading && filteredProducts.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Page <span className="text-white">{currentPage}</span> of{" "}
                {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}

function Card({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded border bg-slate-950", className)} {...props}>
      {children}
    </div>
  );
}
