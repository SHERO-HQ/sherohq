"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { TrendingUp, Printer } from "lucide-react";
import { useAdminUser } from "@/hooks/queries/useAdminQuery";
import { cn } from "@/lib/utils";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useDashboardStats,
  useAnalytics,
  useTopProducts,
  useStockDistribution,
  useOrderStatusDistribution,
  useRecentOrders,
  useRegionalReport,
} from "@/hooks/queries/useAdmin";
import { ReportsStatsGrid } from "@/components/admin/reports/ReportsStatsGrid";
import {
  RevenueChartSection,
  StockDistributionChart,
  OrderStatusChart,
  RegionalSalesChart,
  RecentOrders,
  TopProducts,
} from "@/components/admin/reports/ReportsChartsSection";

type KpiPeriod = "today" | "week" | "month" | "year" | "custom";

const ReportsSkeleton = () => (
  <div className="space-y-8 animate-pulse select-none">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {new Array(3).fill(0).map((_, i) => (
        <div
          key={i}
          className="bg-card/50 border border-border rounded p-6 flex flex-col gap-3"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded bg-accent/50 h-12 w-12" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-accent/50 rounded" />
              <div className="h-6 w-32 bg-accent rounded" />
            </div>
          </div>
          <div className="h-4 w-28 bg-accent/50 rounded mt-2" />
        </div>
      ))}
    </div>

    {/* Main Area Chart Card */}
    <div className="bg-card/50 border border-border rounded p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-5 w-48 bg-accent/50 rounded" />
        <div className="h-8 w-24 bg-accent/50 rounded" />
      </div>
      <div className="h-80 bg-accent/50 rounded w-full flex items-end p-4 gap-3">
        {[30, 45, 60, 40, 75, 50, 90, 65, 80, 55].map((h, index) => (
          <div
            key={index}
            className="flex-1 bg-accent/50 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>

    {/* Three Pie/Bar columns */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {new Array(3).fill(0).map((_, i) => (
        <div
          key={i}
          className="bg-card/50 border border-border rounded p-6 space-y-6"
        >
          <div className="h-5 w-36 bg-accent/50 rounded" />
          <div className="h-48 bg-accent/50 rounded flex items-center justify-center">
            {i < 2 ? (
              <div className="w-24 h-24 rounded-full border-4 border-border" />
            ) : (
              <div className="w-full h-full flex items-end p-4 gap-2">
                {[40, 70, 50, 90].map((h, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-accent/50 rounded-t"
                    style={{ height: `${h}%` }}
                  />
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
  const [range, setRange] = useState("7d");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [kpiPeriod, setKpiPeriod] = useState<KpiPeriod>("today");
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const { data: adminData } = useAdminUser();
  const currentAdmin = adminData?.admin;
  const canExport = !["clerk", "attendant"].includes(currentAdmin?.role || "");

  const startDate =
    range === "custom" && customRange?.from
      ? format(customRange.from, "yyyy-MM-dd")
      : undefined;
  const endDate =
    range === "custom" && customRange?.to
      ? format(customRange.to, "yyyy-MM-dd")
      : undefined;

  const { data: statsData, isLoading: statsLoading } = useDashboardStats(
    startDate,
    endDate,
  );
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics(
    range,
    startDate,
    endDate,
  );
  const { data: topData, isLoading: topLoading } = useTopProducts(
    startDate,
    endDate,
  );
  const { data: stockData, isLoading: stockLoading } = useStockDistribution();
  const { data: orderStatusData, isLoading: orderStatusLoading } =
    useOrderStatusDistribution(startDate, endDate);
  const { data: recentData, isLoading: recentLoading } = useRecentOrders();
  const { data: regionalDataApi, isLoading: regionalLoading } =
    useRegionalReport(startDate, endDate);

  const isLoading =
    statsLoading ||
    analyticsLoading ||
    topLoading ||
    stockLoading ||
    orderStatusLoading ||
    recentLoading ||
    regionalLoading;

  const stats = statsData || null;
  const analytics = Array.isArray(analyticsData) ? analyticsData : [];
  const topProducts = Array.isArray(topData) ? topData : [];
  const stockDist = Array.isArray(stockData) ? stockData : [];
  const orderStatus = Array.isArray(orderStatusData) ? orderStatusData : [];
  const recentOrders = Array.isArray(recentData) ? recentData : [];
  const regionalData = Array.isArray(regionalDataApi) ? regionalDataApi : [];

  const activeKpiPeriod = range === "custom" ? "custom" : kpiPeriod;

  const handleExport = (format: "csv" | "excel" | "pdf") => {
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
      return `${format(customRange.from, "MMM d")} - ${
        customRange.to
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
              <div className="p-3 rounded bg-linear-to-br from-purple-500 bg-primary">
                <TrendingUp className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Reports & Analytics
                </h1>
                <p className="text-muted-foreground text-sm">
                  Overview of your store performance
                </p>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-2 lg:items-center lg:justify-end">
              <div className="flex bg-muted rounded p-1">
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
                        ? "bg-accent text-foreground shadow"
                        : "text-muted-foreground hover:text-foreground",
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
                      "bg-muted/50 border-border text-muted-foreground hover:text-foreground h-9",
                      range === "custom" &&
                        "bg-accent text-foreground border-brand-secondary-500/50",
                    )}
                    onClick={() => setRange("custom")}
                  >
                    Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 dark border-border bg-card"
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
                      className="border-border text-foreground hover:bg-accent"
                    >
                      <Printer className="mr-2 h-4 w-4" /> Export Summary
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-card border-border text-foreground"
                  >
                    <DropdownMenuItem
                      onSelect={() => handleExport("csv")}
                      className="cursor-pointer hover:bg-accent"
                    >
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleExport("excel")}
                      className="cursor-pointer hover:bg-accent"
                    >
                      Export as Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleExport("pdf")}
                      className="cursor-pointer hover:bg-accent"
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
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              KPI Period:
            </span>
            <div className="flex bg-muted p-0.5 rounded border border-border">
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
                  className={`px-3 py-1 text-[10px] font-bold rounded transition ${
                    activeKpiPeriod === opt.value
                      ? "bg-primary text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
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
              <ReportsStatsGrid
                stats={stats}
                kpiPeriod={activeKpiPeriod}
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
