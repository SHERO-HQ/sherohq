"use client";

import React from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import type { AdminStats } from "@/services/api";

type KpiPeriod = "today" | "week" | "month" | "year" | "custom";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  trend: number | string;
  subtext?: string;
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
    <div className="bg-card/40 border border-border hover:border-brand-secondary-500/30 transition-all duration-300 rounded p-5 flex flex-col gap-3 relative group overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="flex items-center gap-4 relative z-10">
        <div className={`p-2.5 rounded ${bg} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-xl font-bold text-foreground mt-0.5 tracking-tight">
            {value}
          </p>
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-2 mt-1 relative z-10">
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trendColor}`}
          >
            {renderTrendValue()}
          </span>
          {subtext && (
            <span className="text-xs text-muted-foreground">{subtext}</span>
          )}
        </div>
      )}
    </div>
  );
}

interface ReportsStatsGridProps {
  stats: AdminStats | null;
  kpiPeriod: KpiPeriod;
  getKpiData: (period: KpiPeriod) => AdminStats["kpis"]["today"] | undefined | null;
  getSubtext: (period: KpiPeriod) => string;
}

export function ReportsStatsGrid({
  stats,
  kpiPeriod,
  getKpiData,
  getSubtext,
}: ReportsStatsGridProps) {
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
        value={`GHS${(getKpiData(kpiPeriod)?.revenue ?? stats?.revenue ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={DollarSign}
        color="text-brand-secondary-400"
        bg="bg-brand-secondary-400/10"
        trend={getKpiData(kpiPeriod)?.revenueGrowth ?? 0}
        subtext={getSubtext(kpiPeriod)}
      />
      <StatCard
        title="Total Expenses"
        value={`GHS${(getKpiData(kpiPeriod)?.expenses ?? stats?.expenses ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={BarChart3}
        color="text-rose-400"
        bg="bg-rose-400/10"
        trend={0}
        subtext={getSubtext(kpiPeriod)}
      />
      <StatCard
        title="Net Profit"
        value={`GHS${(getKpiData(kpiPeriod)?.profit ?? stats?.profit ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
