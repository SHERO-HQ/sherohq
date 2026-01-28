import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { useTitle } from "@/hooks/useTitle";
import { getAdminStats, type AdminStats } from "@/services/api";
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminDashboard() {
  useTitle("Admin Dashboard");
  const { admin } = useAdmin();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats?.products ?? 0,
      icon: Package,
      color: "purple",
      link: "/admin/products",
    },
    {
      title: "Total Orders",
      value: stats?.orders ?? 0,
      icon: ShoppingCart,
      color: "blue",
      link: "/admin/orders",
    },
    {
      title: "Total Revenue",
      value: `GH₵${(stats?.revenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: "green",
      link: "/admin/orders",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      color: "yellow",
      link: "/admin/orders?status=pending",
    },
    {
      title: "Low Stock",
      value: stats?.lowStock ?? 0,
      icon: AlertTriangle,
      color: "orange",
      link: "/admin/products?stock=low",
    },
    {
      title: "Out of Stock",
      value: stats?.outOfStock ?? 0,
      icon: XCircle,
      color: "red",
      link: "/admin/products?stock=out",
    },
  ];

  const colorClasses: Record<string, string> = {
    purple: "from-purple-500 to-purple-600 text-purple-400",
    blue: "from-blue-500 to-blue-600 text-blue-400",
    green: "from-emerald-500 to-emerald-600 text-emerald-400",
    yellow: "from-yellow-500 to-yellow-600 text-yellow-400",
    orange: "from-orange-500 to-orange-600 text-orange-400",
    red: "from-red-500 to-red-600 text-red-400",
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded bg-gradient-to-br from-purple-500 to-blue-600">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400">Welcome back, {admin?.username}!</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const colors = colorClasses[stat.color];

            return (
              <Link
                key={stat.title}
                to={stat.link}
                className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded p-6 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded bg-gradient-to-br ${colors.split(" ").slice(0, 2).join(" ")}`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm text-slate-500 group-hover:text-purple-400 transition-colors">
                  View details
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/products/new"
              className="flex items-center gap-3 p-4 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors"
            >
              <Package className="w-5 h-5 text-purple-400" />
              <span className="text-white">Add Product</span>
            </Link>
            <Link
              to="/admin/products"
              className="flex items-center gap-3 p-4 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors"
            >
              <Package className="w-5 h-5 text-blue-400" />
              <span className="text-white">Manage Products</span>
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 p-4 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <span className="text-white">View Orders</span>
            </Link>
            <Link
              to="/admin/orders?status=pending"
              className="flex items-center gap-3 p-4 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors"
            >
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-white">Pending Orders</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
