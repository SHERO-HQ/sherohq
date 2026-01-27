import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  fetchDashboardStats,
  fetchAnalytics,
  fetchTopProducts,
  fetchStockDistribution,
  fetchOrderStatusDistribution,
  fetchRecentOrders,
  type DashboardStats,
  type AnalyticsData,
  type TopProduct,
  type StockDistribution,
  type OrderStatusDistribution,
  type RecentOrder,
} from "@/services/api";
import { useTitle } from "@/hooks/useTitle";
import {
  PieChart as PieChartIcon,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  Loader2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Reports Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-900/20 text-red-200 rounded border border-red-900">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <pre className="bg-black/50 p-4 rounded overflow-auto text-sm">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function AdminReports() {
  useTitle("Reports & Analytics");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [range, setRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [stockDist, setStockDist] = useState<StockDistribution[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatusDistribution[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        const [
          statsData,
          analyticsData,
          topData,
          stockData,
          orderStatusData,
          recentData,
        ] = await Promise.all([
          fetchDashboardStats(),
          fetchAnalytics(range),
          fetchTopProducts(),
          fetchStockDistribution(),
          fetchOrderStatusDistribution(),
          fetchRecentOrders(),
        ]);
        setStats(statsData || null);
        setAnalytics(Array.isArray(analyticsData) ? analyticsData : []);
        setTopProducts(Array.isArray(topData) ? topData : []);
        setStockDist(Array.isArray(stockData) ? stockData : []);
        setOrderStatus(Array.isArray(orderStatusData) ? orderStatusData : []);
        setRecentOrders(Array.isArray(recentData) ? recentData : []);
      } catch (err: unknown) {
        console.error("Failed to load reports:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [range]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ErrorBoundary>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded bg-gradient-to-br from-purple-500 to-blue-600">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Reports & Analytics
                </h1>
                <p className="text-slate-400">
                  Overview of your store performance
                </p>
              </div>
            </div>

            <div className="flex bg-slate-800 rounded p-1">
              {[
                { value: "7d", label: "7 Days" },
                { value: "30d", label: "30 Days" },
                { value: "90d", label: "90 Days" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRange(option.value)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                    range === option.value
                      ? "bg-slate-700 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={`GH₵${stats?.revenue.toLocaleString() ?? 0}`}
              icon={DollarSign}
              color="text-emerald-400"
              bg="bg-emerald-400/10"
            />
            <StatCard
              title="Total Orders"
              value={stats?.orders.toString() ?? "0"}
              icon={ShoppingCart}
              color="text-blue-400"
              bg="bg-blue-400/10"
            />
            <StatCard
              title="Total Products"
              value={stats?.products.toString() ?? "0"}
              icon={Package}
              color="text-purple-400"
              bg="bg-purple-400/10"
            />
            <StatCard
              title="Low Stock"
              value={stats?.lowStock.toString() ?? "0"}
              icon={AlertTriangle}
              color="text-red-400"
              bg="bg-red-400/10"
            />
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded p-6 relative">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Revenue Over Time
              </h3>
              <div className="absolute top-6 right-6 bg-slate-800 rounded p-1 flex">
                <button
                  onClick={() => setChartType("line")}
                  className={`p-2 rounded transition-colors ${
                    chartType === "line"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Line Chart"
                >
                  <LineChartIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChartType("bar")}
                  className={`p-2 rounded transition-colors ${
                    chartType === "bar"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Bar Chart"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <LineChart data={analytics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickFormatter={(value) => {
                          try {
                            return new Date(value).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                              },
                            );
                          } catch {
                            return value;
                          }
                        }}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickFormatter={(value) => `GH₵${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#1e293b",
                          color: "#f8fafc",
                        }}
                        itemStyle={{ color: "#f8fafc" }}
                        formatter={(value: number | undefined) => [
                          `GH₵${(value ?? 0).toLocaleString()}`,
                          "Revenue",
                        ]}
                        labelFormatter={(label) => {
                          try {
                            return new Date(label).toLocaleDateString();
                          } catch {
                            return label;
                          }
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={analytics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickFormatter={(value) => {
                          try {
                            return new Date(value).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                              },
                            );
                          } catch {
                            return value;
                          }
                        }}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickFormatter={(value) => `GH₵${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#1e293b",
                          color: "#f8fafc",
                        }}
                        itemStyle={{ color: "#f8fafc" }}
                        formatter={(value: number | undefined) => [
                          `GH₵${(value ?? 0).toLocaleString()}`,
                          "Revenue",
                        ]}
                        labelFormatter={(label) => {
                          try {
                            return new Date(label).toLocaleDateString();
                          } catch {
                            return label;
                          }
                        }}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stock Distribution Chart */}
            <div className="bg-slate-900/50 border border-slate-800 rounded p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-blue-400" />
                Stock Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        stockDist.length > 0
                          ? stockDist
                          : [{ name: "No Data", value: 1, color: "#334155" }]
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(stockDist.length > 0
                        ? stockDist
                        : [{ name: "No Data", value: 1, color: "#334155" }]
                      ).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#1e293b",
                        color: "#f8fafc",
                      }}
                      itemStyle={{ color: "#f8fafc" }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Order Status & Recent Orders Row */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Status Distribution */}
            <div className="bg-slate-900/50 border border-slate-800 rounded p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                Order Status
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        orderStatus.length > 0
                          ? orderStatus
                          : [{ name: "No Data", value: 1, color: "#334155" }]
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(orderStatus.length > 0
                        ? orderStatus
                        : [{ name: "No Data", value: 1, color: "#334155" }]
                      ).map((entry, index) => (
                        <Cell key={`order-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#1e293b",
                        color: "#f8fafc",
                      }}
                      itemStyle={{ color: "#f8fafc" }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
                Recent Orders
              </h3>
              <div className="space-y-3">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-mono text-sm text-white">
                            #{order.id.slice(0, 8)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {order.customer.firstName} {order.customer.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                            order.status === "delivered"
                              ? "bg-emerald-900/30 text-emerald-400"
                              : order.status === "pending"
                                ? "bg-amber-900/30 text-amber-400"
                                : order.status === "processing"
                                  ? "bg-blue-900/30 text-blue-400"
                                  : order.status === "shipped"
                                    ? "bg-purple-900/30 text-purple-400"
                                    : "bg-red-900/30 text-red-400"
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="font-bold text-emerald-400 text-sm">
                          GH₵{order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">
                    No orders yet
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Top Products */}
            <div className="lg:col-span-3 bg-slate-900/50 border border-slate-800 rounded p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                Top Selling Products
              </h3>
              <div className="space-y-4">
                {(topProducts || []).map((product, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium text-white text-sm line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {product.quantity} sold
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400 text-sm">
                      GH₵{product.revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
                {topProducts.length === 0 && (
                  <p className="text-slate-500 text-center py-4">
                    No sales data yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

function StatCard({ title, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded p-6 flex items-center gap-4">
      <div className={`p-3 rounded ${bg} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
