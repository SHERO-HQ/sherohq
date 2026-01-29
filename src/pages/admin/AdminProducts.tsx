import { useState, useEffect, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { useTitle } from "@/hooks/useTitle";
import {
  fetchProducts,
  deleteProduct,
  updateProductStock,
} from "@/services/api";
import type { Product } from "@/data/products";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminProducts() {
  useTitle("Manage Products");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  }

  async function handleStockUpdate(id: string) {
    try {
      const { product } = await updateProductStock(id, stockValue);
      setProducts(
        products.map((p) =>
          p.id === id
            ? { ...p, inStock: product.inStock, stockQuantity: stockValue }
            : p,
        ),
      );
      setEditingStock(null);
    } catch (err) {
      console.error("Failed to update stock:", err);
    }
  }

  function startEditStock(product: Product) {
    setEditingStock(product.id);
    setStockValue(
      (product as Product & { stockQuantity?: number }).stockQuantity ?? 0,
    );
  }

  async function loadCategories() {
    try {
      const data = await import("@/services/api").then((m) =>
        m.fetchCategories(),
      );
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter
      ? p.category === categoryFilter
      : true;

    let matchesStock = true;
    const qty = (p as Product & { stockQuantity?: number }).stockQuantity ?? 0;

    if (stockFilter === "instock") matchesStock = p.inStock && qty > 10;
    else if (stockFilter === "lowstock")
      matchesStock = p.inStock && qty <= 10 && qty > 0;
    else if (stockFilter === "outstock") matchesStock = !p.inStock || qty === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  function getStockStatus(product: Product) {
    const qty =
      (product as Product & { stockQuantity?: number }).stockQuantity ?? 0;
    if (!product.inStock || qty === 0) {
      return { label: "Out of Stock", color: "text-red-400", icon: XCircle };
    }
    if (qty <= 10) {
      return {
        label: "Low Stock",
        color: "text-yellow-400",
        icon: AlertTriangle,
      };
    }
    return { label: "In Stock", color: "text-emerald-400", icon: CheckCircle };
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded bg-gradient-to-br from-purple-500 to-blue-600">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white font-sora">Products</h1>
              <p className="text-slate-400">{products.length} total products</p>
            </div>
          </div>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded hover:from-purple-500 hover:to-blue-500 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              className="w-full pl-12 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500 custom-select text-base"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id === "all" ? "" : c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500 custom-select text-base"
          >
            <option value="">All Stock Status</option>
            <option value="instock">In Stock</option>
            <option value="lowstock">Low Stock (≤10)</option>
            <option value="outstock">Out of Stock</option>
          </select>
        </div>

        {/* Products Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-4 font-sora text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 font-sora text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 font-sora text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 font-sora text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 font-sora text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 font-sora text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product);
                    const StatusIcon = status.icon;
                    const qty =
                      (product as Product & { stockQuantity?: number })
                        .stockQuantity ?? 0;

                    return (
                      <tr key={product.id} className="hover:bg-slate-800/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{product.image}</span>
                            <div>
                              <p className="font-medium text-white">
                                {product.name}
                              </p>
                              {product.badge && (
                                <span className="inline-block px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full mt-1">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300 capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-medium">
                            GH₵{product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="ml-2 text-sm text-slate-500 line-through">
                              GH₵{product.originalPrice}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingStock === product.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={stockValue}
                                onChange={(e) =>
                                  setStockValue(Number(e.target.value))
                                }
                                className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm"
                                min="0"
                              />
                              <button
                                onClick={() => handleStockUpdate(product.id)}
                                className="p-1 text-emerald-400 hover:text-emerald-300"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingStock(null)}
                                className="p-1 text-slate-400 hover:text-slate-300"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditStock(product)}
                              className="text-slate-300 hover:text-white"
                            >
                              {qty}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`flex items-center gap-1.5 ${status.color}`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-sm">{status.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/products/${product.id}/edit`}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            {deleteConfirm === product.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2 py-1 text-xs bg-slate-700 text-white rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(product.id)}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No products found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
