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
  fetchRegionalReport,
  type AdminStats,
  type AnalyticsData,
  type TopProduct,
  type StockDistribution,
  type OrderStatusDistribution,
  type RecentOrder,
  type RegionalData,
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
  Printer,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { cn } from "@/lib/utils";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

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

const getOrderStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-emerald-900/30 text-emerald-400";
    case "pending":
      return "bg-amber-900/30 text-amber-400";
    case "processing":
      return "bg-blue-900/30 text-blue-400";
    case "shipped":
      return "bg-purple-900/30 text-purple-400";
    default:
      return "bg-red-900/30 text-red-400";
  }
};

export default function AdminReports() {
  useTitle("Reports & Analytics");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [range, setRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [stockDist, setStockDist] = useState<StockDistribution[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatusDistribution[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [kpiPeriod, setKpiPeriod] = useState<
    "today" | "week" | "month" | "year" | "custom"
  >("today");
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        const startDate =
          range === "custom" && customRange?.from
            ? format(customRange.from, "yyyy-MM-dd")
            : undefined;
        const endDate =
          range === "custom" && customRange?.to
            ? format(customRange.to, "yyyy-MM-dd")
            : undefined;

        const [
          statsData,
          analyticsData,
          topData,
          stockData,
          orderStatusData,
          recentData,
          regionalData,
        ] = await Promise.all([
          fetchDashboardStats(startDate, endDate),
          fetchAnalytics(range, startDate, endDate),
          fetchTopProducts(startDate, endDate),
          fetchStockDistribution(),
          fetchOrderStatusDistribution(startDate, endDate),
          fetchRecentOrders(startDate, endDate),
          fetchRegionalReport(startDate, endDate),
        ]);
        setStats(statsData || null);
        setAnalytics(Array.isArray(analyticsData) ? analyticsData : []);
        setTopProducts(Array.isArray(topData) ? topData : []);
        setStockDist(Array.isArray(stockData) ? stockData : []);
        setOrderStatus(Array.isArray(orderStatusData) ? orderStatusData : []);
        setRecentOrders(Array.isArray(recentData) ? recentData : []);
        setRegionalData(Array.isArray(regionalData) ? regionalData : []);

        // Automatically set KPI period to custom if a custom range is used
        if (range === "custom") {
          setKpiPeriod("custom");
        }
      } catch (err: unknown) {
        console.error("Failed to load reports:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [range, customRange]);

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    // Exporting a summary report
    const summaryData = [
      { Metric: "Total Revenue", Value: stats?.revenue ?? 0 },
      { Metric: "Total Expenses", Value: stats?.expenses ?? 0 },
      { Metric: "Net Profit", Value: stats?.profit ?? 0 },
      { Metric: "Total Orders", Value: stats?.orders ?? 0 },
      { Metric: "Total Products", Value: stats?.products ?? 0 },
      { Metric: "Low Stock Items", Value: stats?.lowStock ?? 0 },
      { Metric: "Out of Stock Items", Value: stats?.outOfStock ?? 0 },
    ];

    const fileName = `analytics_summary_${new Date().toISOString().split("T")[0]}`;
    const columns = ["Metric", "Value"];

    if (format === "csv") exportToCSV(summaryData, fileName);
    else if (format === "excel") exportToExcel(summaryData, fileName);
    else
      exportToPDF(summaryData, columns, fileName, "Analytics Summary Report");
  };

  const getKpiData = (period: typeof kpiPeriod) => {
    return stats?.kpis?.[period];
  };

  const getSubtext = (period: typeof kpiPeriod) => {
    if (period === "custom" && customRange?.from) {
      return `${format(customRange.from, "MMM d")} - ${
        customRange.to
          ? format(customRange.to, "MMM d")
          : format(customRange.from, "MMM d")
      }`;
    }
    return `vs prev ${period === "today" ? "day" : period}`;
  };

  return (
    <AdminLayout>
      <ErrorBoundary>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded bg-linear-to-br from-purple-500 to-blue-600">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-sora font-bold text-white">
                  Reports & Analytics
                </h1>
                <p className="text-slate-400 text-sm">
                  Overview of your store performance
                </p>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-2 lg:items-center lg:justify-end">
              <div className="flex bg-slate-800 rounded p-1">
                {[
                  { value: "7d", label: "7 Days" },
                  { value: "30d", label: "30 Days" },
                  { value: "90d", label: "90 Days" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRange(option.value)}
                    className={cn(
                      "px-4 py-1 rounded text-sm font-medium transition-all",
                      range === option.value
                        ? "bg-slate-700 text-white shadow"
                        : "text-slate-400 hover:text-white",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "bg-slate-800/50 border-white/10 text-slate-300 hover:text-white h-9",
                      range === "custom" &&
                        "bg-slate-700 text-white border-emerald-500/50",
                    )}
                    onClick={() => setRange("custom")}
                  >
                    Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 dark border-slate-800 bg-slate-900"
                  align="end"
                >
                  <Calendar
                    mode="range"
                    defaultMonth={customRange?.from}
                    selected={customRange}
                    onSelect={setCustomRange}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    <Printer className="mr-2 h-4 w-4" /> Export Summary
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-slate-900 border-white/10 text-white"
                >
                  <DropdownMenuItem
                    onSelect={() => handleExport("csv")}
                    className="cursor-pointer hover:bg-white/5"
                  >
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => handleExport("excel")}
                    className="cursor-pointer hover:bg-white/5"
                  >
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => handleExport("pdf")}
                    className="cursor-pointer hover:bg-white/5"
                  >
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {/* KPI Period Selector */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              KPI Period:
            </span>
            <div className="flex bg-slate-800 p-0.5 rounded border border-white/5">
              {[
                { value: "today", label: "Today" },
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
                { value: "year", label: "Year" },
                { value: "custom", label: "Custom" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setKpiPeriod(
                      opt.value as
                        | "today"
                        | "week"
                        | "month"
                        | "year"
                        | "custom",
                    )
                  }
                  className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                    kpiPeriod === opt.value
                      ? "bg-purple-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <StatsGrid
                stats={stats}
                kpiPeriod={kpiPeriod}
                getKpiData={getKpiData}
                getSubtext={getSubtext}
              />

              {/* Charts Row */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded p-6 relative">
                  <h3 className="text-lg font-bold font-sora text-white mb-6 flex items-center gap-2">
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
                  <div className="h-82">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "line" ? (
                        <LineChart data={analytics}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#1e293b"
                          />
                          <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickFormatter={(value) => {
                              try {
                                // Add time component to ensure local day parsing
                                return format(
                                  new Date(value + "T00:00:00"),
                                  "MMM d",
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
                            formatter={(
                              value: number | undefined,
                              name: string | undefined,
                            ) => [
                              `GH₵${(value ?? 0).toLocaleString()}`,
                              (name ?? "").charAt(0).toUpperCase() +
                                (name ?? "").slice(1),
                            ]}
                            labelFormatter={(label) => {
                              try {
                                return format(
                                  new Date(label + "T00:00:00"),
                                  "MMMM d, yyyy",
                                );
                              } catch {
                                return label;
                              }
                            }}
                          />
                          <Legend verticalAlign="top" height={36} />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="expenses"
                            name="Expenses"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="profit"
                            name="Net Profit"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={false}
                          />
                        </LineChart>
                      ) : (
                        <BarChart data={analytics}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#1e293b"
                          />
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
                  <h3 className="text-lg font-bold font-sora text-white mb-6 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-blue-400" />
                    Stock Distribution
                  </h3>
                  <div className="h-62">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={
                            stockDist.length > 0
                              ? stockDist
                              : [
                                  {
                                    name: "No Data",
                                    value: 1,
                                    color: "#334155",
                                  },
                                ]
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
                            <Cell
                              key={entry.name || index}
                              fill={entry.color}
                            />
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
                  <div className="h-62">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={
                            orderStatus.length > 0
                              ? orderStatus
                              : [
                                  {
                                    name: "No Data",
                                    value: 1,
                                    color: "#334155",
                                  },
                                ]
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
                            <Cell
                              key={entry.name || index}
                              fill={entry.color}
                            />
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

                {/* Regional Data Chart */}
                <div className="bg-slate-900/50 border border-slate-800 rounded p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Sales by Region
                  </h3>
                  <div className="h-62">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={regionalData} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1e293b"
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis
                          type="number"
                          stroke="#94a3b8"
                          fontSize={10}
                          hide
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          stroke="#94a3b8"
                          fontSize={11}
                          width={100}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#1e293b",
                            color: "#f8fafc",
                          }}
                          formatter={(value: number | undefined) => [
                            `GH₵${(value ?? 0).toLocaleString()}`,
                            "Revenue",
                          ]}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#10b981"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        />
                      </BarChart>
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
                              <span className="text-xs text-slate-300">
                                {order.customer.firstName}{" "}
                                {order.customer.lastName}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                {order.customer.email}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold capitalize ${getOrderStatusColor(
                                order.status,
                              )}`}
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
                  <h3 className="text-lg font-bold font-sora text-white mb-6 flex items-center gap-2">
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
            </>
          )}
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
}

interface StatCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly icon: React.ElementType;
  readonly color: string;
  readonly bg: string;
  readonly trend?: number | string;
  readonly subtext?: string;
}

const getTrendStyles = (trend: number) => {
  if (trend >= 0) return "bg-emerald-500/10 text-emerald-400";
  return "bg-rose-500/10 text-rose-400";
};

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bg,
  trend,
  subtext,
}: StatCardProps) {
  const trendValue = typeof trend === "number" ? trend : 0;
  const isPositive = trendValue >= 0;
  const trendColor =
    typeof trend === "number"
      ? getTrendStyles(trend)
      : "bg-blue-500/10 text-blue-400";

  const renderTrendValue = () => {
    if (typeof trend === "number") {
      return `${isPositive ? "+" : ""}${trend}%`;
    }
    return trend;
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded p-6 flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded ${bg} ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-400 font-sora">
            {title}
          </p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${trendColor}`}
          >
            {renderTrendValue()}
          </span>
          {subtext && <span className="text-xs text-slate-500">{subtext}</span>}
        </div>
      )}
    </div>
  );
}

function StatsGrid({
  stats,
  kpiPeriod,
  getKpiData,
  getSubtext,
}: {
  stats: AdminStats | null;
  kpiPeriod: "today" | "week" | "month" | "year" | "custom";
  getKpiData: (
    period: "today" | "week" | "month" | "year" | "custom",
  ) => AdminStats["kpis"]["today"] | undefined | null;
  getSubtext: (
    period: "today" | "week" | "month" | "year" | "custom",
  ) => string;
}) {
  const newProductsCount = getKpiData(kpiPeriod)?.newProducts ?? 0;
  const newProductsTrend =
    newProductsCount > 0 ? `+${newProductsCount} new` : undefined;
  const newProductsSubtext =
    kpiPeriod === "today"
      ? "added today"
      : `vs last ${kpiPeriod === "week" ? "week" : kpiPeriod}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 font-sora">
      <StatCard
        title="Total Revenue"
        value={`GH₵${(getKpiData(kpiPeriod)?.revenue ?? stats?.revenue ?? 0).toLocaleString()}`}
        icon={DollarSign}
        color="text-emerald-400"
        bg="bg-emerald-400/10"
        trend={getKpiData(kpiPeriod)?.revenueGrowth}
        subtext={getSubtext(kpiPeriod)}
      />
      <StatCard
        title="Total Expenses"
        value={`GH₵${(getKpiData(kpiPeriod)?.expenses ?? stats?.expenses ?? 0).toLocaleString()}`}
        icon={BarChart3}
        color="text-rose-400"
        bg="bg-rose-400/10"
        trend={0}
        subtext={getSubtext(kpiPeriod)}
      />
      <StatCard
        title="Net Profit"
        value={`GH₵${(getKpiData(kpiPeriod)?.profit ?? stats?.profit ?? 0).toLocaleString()}`}
        icon={TrendingUp}
        color="text-blue-400"
        bg="bg-blue-400/10"
        trend={getKpiData(kpiPeriod)?.profitGrowth}
        subtext={getSubtext(kpiPeriod)}
      />
      <StatCard
        title="Total Orders"
        value={(getKpiData(kpiPeriod)?.orders ?? stats?.orders ?? 0).toString()}
        icon={ShoppingCart}
        color="text-amber-400"
        bg="bg-amber-400/10"
        trend={getKpiData(kpiPeriod)?.ordersGrowth}
        subtext={getSubtext(kpiPeriod)}
      />
      <StatCard
        title="Total Products"
        value={(stats?.products ?? 0).toString()}
        icon={Package}
        color="text-purple-400"
        bg="bg-purple-400/10"
        trend={newProductsTrend}
        subtext={newProductsSubtext}
      />
      <StatCard
        title="Low Stock"
        value={(stats?.lowStock ?? 0).toString()}
        icon={AlertTriangle}
        color="text-red-400"
        bg="bg-red-400/10"
      />
    </div>
  );
}
