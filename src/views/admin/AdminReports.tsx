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
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

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
          <AdminPageHeader
            icon={TrendingUp}
            title="Reports & Analytics"
            description="Overview of your store performance and financial summary"
          >
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
                    variant="outline"
                    className={cn(
                      "bg-muted border-none text-muted-foreground text-xs h-8 hover:text-foreground",
                      range === "custom" && "bg-accent text-foreground",
                    )}
                  >
                    {range === "custom" && customRange?.from
                      ? `${format(customRange.from, "MMM d")} - ${
                          customRange.to ? format(customRange.to, "MMM d") : ""
                        }`
                      : "Custom Range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-card border-border"
                  align="end"
                >
                  <Calendar
                    mode="range"
                    selected={customRange}
                    onSelect={(val) => {
                      setCustomRange(val);
                      if (val?.from) setRange("custom");
                    }}
                    numberOfMonths={2}
                    className="bg-card text-foreground"
                  />
                </PopoverContent>
              </Popover>

              {canExport && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground font-medium px-4 h-8 text-xs">
                      <Printer className="mr-1.5 h-3.5 w-3.5" /> Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-card border-border text-foreground"
                  >
                    <DropdownMenuItem
                      onClick={() => handleExport("csv")}
                      className="cursor-pointer hover:bg-accent"
                    >
                      Export Summary (CSV)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport("excel")}
                      className="cursor-pointer hover:bg-accent"
                    >
                      Export Summary (Excel)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport("pdf")}
                      className="cursor-pointer hover:bg-accent"
                    >
                      Export Summary (PDF)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </AdminPageHeader>
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
