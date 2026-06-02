"use client";
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
  type LucideIcon,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toReadableOrderId } from "@/utils/orderId";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  trend: number | string;
  subtext?: string;
}

import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

type KpiPeriod = "today" | "week" | "month" | "year" | "custom";

const getOrderStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-brand-secondary-500/10 border border-brand-secondary-500/20 text-brand-secondary-400";
    case "pending":
      return "bg-amber-500/10 border border-amber-500/20 text-amber-400";
    case "processing":
      return "bg-blue-500/10 border border-blue-500/20 text-blue-400";
    case "shipped":
      return "bg-purple-500/10 border border-purple-500/20 text-purple-400";
    default:
      return "bg-rose-500/10 border border-rose-500/20 text-rose-400";
  }
};


const parseLabel = (label: any) => {
  if (!label) return "";
  const parsed = Date.parse(label);
  if (!isNaN(parsed) && String(label).includes("-")) {
    return new Date(parsed).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return String(label);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 backdrop-blur-md border border-white/10 p-3 rounded shadow-[0_10px_25px_rgba(0,0,0,0.5)] space-y-1.5 animate-in fade-in zoom-in-95 duration-100 select-none">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
          {parseLabel(label)}
        </p>
        <div className="space-y-1">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shadow-xs"
                style={{ backgroundColor: item.stroke || item.color }}
              />
              <span className="text-xs text-slate-400 font-medium capitalize">
                {item.name === "revenue" ? "Revenue" : item.name === "expenses" ? "Expenses" : item.name === "profit" ? "Net Profit" : item.name}:
              </span>
              <span className="text-xs text-white font-bold font-mono">
                {String(item.name).toLowerCase().includes("revenue") || String(item.name).toLowerCase().includes("expenses") || String(item.name).toLowerCase().includes("profit")
                  ? `GH₵${(item.value || 0).toLocaleString()}`
                  : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};


const ReportsSkeleton = () => (
  <div className="space-y-8 animate-pulse select-none">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {new Array(3).fill(0).map((_, i) => (
        <div key={i} className="bg-slate-900/50 border border-slate-800 rounded p-6 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded bg-white/5 h-12 w-12" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-white/5 rounded" />
              <div className="h-6 w-32 bg-white/10 rounded" />
            </div>
          </div>
          <div className="h-4 w-28 bg-white/5 rounded mt-2" />
        </div>
      ))}
    </div>

    {/* Main Area Chart Card */}
    <div className="bg-slate-900/50 border border-slate-800 rounded p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-5 w-48 bg-white/5 rounded" />
        <div className="h-8 w-24 bg-white/5 rounded" />
      </div>
      <div className="h-80 bg-white/5 rounded w-full flex items-end p-4 gap-3">
        {[30, 45, 60, 40, 75, 50, 90, 65, 80, 55].map((h, index) => (
          <div key={index} className="flex-1 bg-white/5 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>

    {/* Three Pie/Bar columns */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {new Array(3).fill(0).map((_, i) => (
        <div key={i} className="bg-slate-900/50 border border-slate-800 rounded p-6 space-y-6">
          <div className="h-5 w-36 bg-white/5 rounded" />
          <div className="h-48 bg-white/5 rounded flex items-center justify-center">
            {i < 2 ? (
              <div className="w-24 h-24 rounded-full border-4 border-white/5" />
            ) : (
              <div className="w-full h-full flex items-end p-4 gap-2">
                {[40, 70, 50, 90].map((h, idx) => (
                  <div key={idx} className="flex-1 bg-white/5 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function AdminReports() {
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
  const [kpiPeriod, setKpiPeriod] = useState<KpiPeriod>("today");
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const { admin: currentAdmin } = useAdmin();
  const canExport = !["clerk", "attendant"].includes(currentAdmin?.role || "");

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

    const fileName = `SHERO-Reports-${new Date().toISOString().split("T")[0]}`;
    const columns = ["Metric", "Value"];

    if (format === "csv") exportToCSV(summaryData, fileName);
    else if (format === "excel") exportToExcel(summaryData, fileName);
    else
      exportToPDF(
        summaryData,
        columns,
        fileName,
        "SHERO Analytics Summary Report",
      );
  };

  const getKpiData = (period: typeof kpiPeriod) => {
    return stats?.kpis?.[period];
  };

  const getSubtext = (period: typeof kpiPeriod) => {
    if (period === "custom" && customRange?.from) {
      return `${format(customRange.from, "MMM d")} - ${customRange.to
          ? format(customRange.to, "MMM d")
          : format(customRange.from, "MMM d")
        }`;
    }
    return `vs prev ${period === "today" ? "day" : period}`;
  };

  return (
    <div className="space-y-8 pb-12">
      <ErrorBoundary>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded bg-linear-to-br from-purple-500 to-blue-600">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
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
                      "px-4 py-1 rounded text-sm font-medium transition",
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
                      "bg-slate-700 text-white border-brand-secondary-500/50",
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
              {canExport && (
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
              )}
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
                  onClick={() => setKpiPeriod(opt.value as KpiPeriod)}
                  className={`px-3 py-1 text-[10px] font-bold rounded transition ${kpiPeriod === opt.value
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
            <ReportsSkeleton />
          ) : (
            <>
              {/* Stats Grid */}
              <StatsGrid
                stats={stats}
                kpiPeriod={kpiPeriod}
                getKpiData={getKpiData}
                getSubtext={getSubtext}
              />

              <RevenueChartSection
                chartType={chartType}
                setChartType={setChartType}
                analytics={analytics}
              />

              <div className="grid lg:grid-cols-3 gap-8">
                <StockDistributionChart data={stockDist} />
                <OrderStatusChart data={orderStatus} />
                <RegionalSalesChart data={regionalData} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <RecentOrders orders={recentOrders} />
                <TopProducts products={topProducts} />
              </div>
            </>
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
}

const getTrendStyles = (trend: number) => {
  if (trend >= 0) return "bg-brand-secondary-500/10 text-brand-secondary-400";
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
    <div className="bg-slate-900/40 border border-white/10 hover:border-brand-secondary-500/30 transition-all duration-300 rounded p-5 flex flex-col gap-3 relative group overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="flex items-center gap-4 relative z-10">
        <div className={`p-2.5 rounded ${bg} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-xl font-bold text-white mt-0.5 tracking-tight">{value}</p>
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-2 mt-1 relative z-10">
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trendColor}`}
          >
            {renderTrendValue()}
          </span>
          {subtext && <span className="text-xs text-slate-500">{subtext}</span>}
        </div>
      )}
    </div>
  );
}

function RevenueChartSection({
  chartType,
  setChartType,
  analytics,
}: {
  readonly chartType: "line" | "bar";
  readonly setChartType: (type: "line" | "bar") => void;
  readonly analytics: AnalyticsData[];
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="bg-slate-900/40 border border-white/10 rounded p-6 relative group overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-brand-secondary-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-brand-secondary-400" />
        Revenue Over Time
      </h3>
      <div className="absolute top-6 right-6 bg-slate-800/80 backdrop-blur-md rounded border border-white/5 p-0.5 flex">
        <button
          onClick={() => setChartType("line")}
          className={`p-1.5 rounded transition-colors ${chartType === "line"
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:text-white"
            }`}
          title="Line Chart"
        >
          <LineChartIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setChartType("bar")}
          className={`p-1.5 rounded transition-colors ${chartType === "bar"
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
            <LineChart data={analytics} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: string) => {
                  try {
                    return format(new Date(value + "T00:00:00"), "MMM d");
                  } catch {
                    return value;
                  }
                }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `GH₵${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 2 }} />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={1500}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="expenses"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "#ef4444", strokeWidth: 2, fill: "#fff" }}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={1500}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="profit"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, stroke: "#3b82f6", strokeWidth: 2, fill: "#fff" }}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={2000}
              />
            </LineChart>
          ) : (
            <BarChart data={analytics} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReportRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: string) => {
                  try {
                    return format(new Date(value + "T00:00:00"), "MMM d");
                  } catch {
                    return value;
                  }
                }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `GH₵${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar dataKey="revenue" fill="url(#colorReportRev)" stroke="#3b82f6" strokeWidth={1} radius={[4, 4, 0, 0]} isAnimationActive={!prefersReducedMotion} animationDuration={1500} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StockDistributionChart({
  data,
}: {
  readonly data: StockDistribution[];
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="bg-slate-900/40 border border-white/10 rounded p-6 hover:border-blue-500/20 transition-colors duration-300">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <PieChartIcon className="w-5 h-5 text-blue-400" />
        Stock Distribution
      </h3>
      <div className="h-62">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={
                data.length > 0
                  ? data
                  : [{ name: "No Data", value: 1, color: "#334155" }]
              }
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              isAnimationActive={!prefersReducedMotion}
            >
              {(data.length > 0
                ? data
                : [{ name: "No Data", value: 1, color: "#334155" }]
              ).map((entry, index) => (
                <Cell key={`stock-${entry.name || index}`} fill={entry.color} stroke="rgba(15, 23, 42, 0.5)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OrderStatusChart({
  data,
}: {
  readonly data: OrderStatusDistribution[];
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="bg-slate-900/40 border border-white/10 rounded p-6 hover:border-amber-500/20 transition-colors duration-300">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-amber-400" />
        OrderStatus Chart
      </h3>
      <div className="h-62">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={
                data.length > 0
                  ? data
                  : [{ name: "No Data", value: 1, color: "#334155" }]
              }
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              isAnimationActive={!prefersReducedMotion}
            >
              {(data.length > 0
                ? data
                : [{ name: "No Data", value: 1, color: "#334155" }]
              ).map((entry, index) => (
                <Cell
                  key={`status-${entry.name || index}`}
                  fill={entry.color}
                  stroke="rgba(15, 23, 42, 0.5)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RegionalSalesChart({ data }: { readonly data: RegionalData[] }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="bg-slate-900/40 border border-white/10 rounded p-6 hover:border-brand-secondary-500/20 transition-colors duration-300">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-brand-secondary-400" />
        Sales by Region
      </h3>
      <div className="h-62">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRegionRev" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              horizontal={true}
              vertical={false}
            />
            <XAxis type="number" stroke="#94a3b8" fontSize={10} hide />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#94a3b8"
              fontSize={10}
              width={100}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
            <Bar
              dataKey="revenue"
              fill="url(#colorRegionRev)"
              stroke="#10b981"
              strokeWidth={1}
              radius={[0, 4, 4, 0]}
              barSize={16}
              isAnimationActive={!prefersReducedMotion}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RecentOrders({ orders }: { readonly orders: RecentOrder[] }) {
  return (
    <div className="lg:col-span-2 bg-slate-900/40 border border-white/10 rounded p-6 relative group overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-blue-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-blue-400" />
        Recent Orders
      </h3>
      <div className="space-y-3">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3.5 rounded bg-slate-950/20 border border-white/5 hover:border-blue-500/20 hover:bg-slate-900/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="font-mono text-sm text-slate-300 font-bold">
                    {toReadableOrderId(order.id)}
                  </span>
                  <span className="text-xs text-white font-semibold mt-0.5">
                    {order.customer.firstName} {order.customer.lastName}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate max-w-30 font-mono mt-0.5">
                    {order.customer.email}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getOrderStatusStyles(
                    order.status,
                  )}`}
                >
                  {order.status}
                </span>
                <span className="font-bold text-brand-secondary-400 text-sm font-mono">
                  GH₵{order.total.toLocaleString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-500 text-center py-4 italic">No orders yet</p>
        )}
      </div>
    </div>
  );
}

function TopProducts({ products }: { readonly products: TopProduct[] }) {
  return (
    <div className="lg:col-span-1 bg-slate-900/40 border border-white/10 rounded p-6 relative group overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-purple-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Package className="w-5 h-5 text-purple-400" />
        Top Selling Products
      </h3>
      <div className="space-y-4">
        {(products || []).map((product, idx) => (
          <div
            key={`${product.name}-${idx}`}
            className="flex items-center justify-between p-3.5 rounded bg-slate-950/20 border border-white/5 hover:border-purple-500/20 hover:bg-slate-900/50 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800/80 border border-white/10 text-[10px] font-bold text-white font-mono">
                {idx + 1}
              </span>
              <div>
                <p className="font-semibold text-white text-sm line-clamp-1">
                  {product.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {product.quantity} sold
                </p>
              </div>
            </div>
            <span className="font-bold text-brand-secondary-400 text-sm font-mono">
              GH₵{product.revenue.toLocaleString()}
            </span>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-slate-500 text-center py-4 italic">No sales data yet</p>
        )}
      </div>
    </div>
  );
}

function StatsGrid({
  stats,
  kpiPeriod,
  getKpiData,
  getSubtext,
}: {
  readonly stats: AdminStats | null;
  readonly kpiPeriod: KpiPeriod;
  readonly getKpiData: (
    period: KpiPeriod,
  ) => AdminStats["kpis"]["today"] | undefined | null;
  readonly getSubtext: (period: KpiPeriod) => string;
}) {
  const newProductsCount = getKpiData(kpiPeriod)?.newProducts ?? 0;
  const newProductsTrend =
    newProductsCount > 0 ? `+${newProductsCount} new` : undefined;
  const periodLabel = kpiPeriod === "week" ? "week" : kpiPeriod;
  const newProductsSubtext =
    kpiPeriod === "today" ? "added today" : `vs last ${periodLabel}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
      <StatCard
        title="Total Revenue"
        value={`GH₵${(getKpiData(kpiPeriod)?.revenue ?? stats?.revenue ?? 0).toLocaleString()}`}
        icon={DollarSign}
        color="text-brand-secondary-400"
        bg="bg-brand-secondary-400/10"
        trend={getKpiData(kpiPeriod)?.revenueGrowth ?? 0}
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
        trend={getKpiData(kpiPeriod)?.profitGrowth ?? 0}
        subtext={getSubtext(kpiPeriod)}
      />
      <StatCard
        title="Total Orders"
        value={(getKpiData(kpiPeriod)?.orders ?? stats?.orders ?? 0).toString()}
        icon={ShoppingCart}
        color="text-amber-400"
        bg="bg-amber-400/10"
        trend={getKpiData(kpiPeriod)?.ordersGrowth ?? 0}
        subtext={getSubtext(kpiPeriod)}
      />
      <StatCard
        title="Total Products"
        value={(stats?.products ?? 0).toString()}
        icon={Package}
        color="text-purple-400"
        bg="bg-purple-400/10"
        trend={newProductsTrend ?? 0}
        subtext={newProductsSubtext}
      />
      <StatCard
        title="Low Stock"
        value={(stats?.lowStock ?? 0).toString()}
        icon={AlertTriangle}
        color="text-red-400"
        bg="bg-red-400/10"
        trend={0}
      />
    </div>
  );
}
