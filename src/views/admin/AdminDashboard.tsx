"use client";

import { useState, useMemo } from "react";
import { useAdminUser } from "@/hooks/queries/useAdminQuery";
import { TopProductsWidget } from "@/components/admin/dashboard/TopProductsWidget";
import { LowStockAlerts } from "@/components/admin/dashboard/LowStockAlerts";
import {
  useAdminStats,
  useAnalytics,
  useRecentOrders,
  useActivityLogs,
  useOrderStatusDistribution,
} from "@/hooks/queries/useAdmin";
import { useSupportTickets } from "@/hooks/queries/useSupport";
import {
  Package,
  ShoppingCart,
  DollarSign,
  XCircle,
  Clock,
} from "lucide-react";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActivityFeed from "@/components/admin/ActivityFeed";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { DashboardStatsGrid } from "@/components/admin/dashboard/DashboardStatsGrid";
import {
  DashboardRevenueChart,
  DashboardOrderStatusPieChart,
} from "@/components/admin/dashboard/DashboardChartsSection";
import { DashboardRecentOrders } from "@/components/admin/dashboard/DashboardRecentOrders";
import { DashboardQuickLaunch } from "@/components/admin/dashboard/DashboardQuickLaunch";

const getTrendStyles = (trend: number) => {
  if (trend >= 0) return "bg-brand-secondary-500/10 text-brand-secondary-400";
  return "bg-rose-500/10 text-rose-400";
};

export default function AdminDashboard() {
  const { data: adminData } = useAdminUser();
  const admin = adminData?.admin;
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year">("today");

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useAdminStats(ADMIN_POLLING_INTERVAL);

  const {
    data: analytics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useAnalytics(period, undefined, undefined, ADMIN_POLLING_INTERVAL);

  const {
    data: recentOrders,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useRecentOrders(ADMIN_POLLING_INTERVAL);

  const {
    data: activityLogs,
    isLoading: activityLoading,
    refetch: refetchActivity,
  } = useActivityLogs(ADMIN_POLLING_INTERVAL);

  const { data: supportTickets, isLoading: ticketsLoading } =
    useSupportTickets(ADMIN_POLLING_INTERVAL);

  const { data: orderStatusDist, isLoading: orderStatusLoading } =
    useOrderStatusDistribution(undefined, undefined, ADMIN_POLLING_INTERVAL);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchStats(),
      refetchAnalytics(),
      refetchOrders(),
      refetchActivity(),
    ]);
    setIsRefreshing(false);
  };

  const statCards = useMemo(() => {
    const kpi = stats?.kpis?.[period] || {
      revenue: stats?.revenue || 0,
      orders: stats?.orders || 0,
      revenueGrowth: stats?.revenueGrowth || 0,
      ordersGrowth: stats?.ordersGrowth || 0,
      newProducts: stats?.newProductsCount || 0,
    };

    const subtextMap = {
      today: "vs yesterday",
      week: "vs last week",
      month: "from last month",
      year: "from last year",
    };

    return [
      {
        title: "Total Revenue",
        value: `GHS${kpi.revenue.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: DollarSign,
        color: "text-brand-secondary-400",
        bgColor: "bg-brand-secondary-400/10",
        trend: `${kpi.revenueGrowth >= 0 ? "+" : ""}${kpi.revenueGrowth}%`,
        subtext: subtextMap[period],
      },
      {
        title: "Total Orders",
        value: kpi.orders,
        icon: ShoppingCart,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        trend: `${kpi.ordersGrowth >= 0 ? "+" : ""}${kpi.ordersGrowth}%`,
        subtext: subtextMap[period],
      },
      {
        title: "Active Products",
        value: stats?.products ?? 0,
        icon: Package,
        color: "text-purple-400",
        bgColor: "bg-purple-400/10",
        trend: `+${kpi.newProducts ?? 0} new`,
        subtext: period === "today" ? "added today" : subtextMap[period],
      },
      {
        title: "Avg. Order Value",
        value: `GHS${(kpi.orders > 0 ? kpi.revenue / kpi.orders : 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: DollarSign,
        color: "text-emerald-400",
        bgColor: "bg-emerald-400/10",
        trend: "",
        subtext: `over ${kpi.orders} orders`,
      },
      {
        title: "Abandoned Carts",
        value: stats?.abandonedCarts ?? 0,
        icon: ShoppingCart,
        color: "text-rose-400",
        bgColor: "bg-rose-400/10",
        trend: "",
        subtext: "Total unfinished checkouts",
      },
      {
        title: "Pending Tickets",
        value: supportTickets
          ? supportTickets.filter(
              (t: any) =>
                t.status?.toLowerCase() === "open" ||
                t.status?.toLowerCase() === "pending",
            ).length
          : 0,
        icon: Clock,
        color: "text-amber-400",
        bgColor: "bg-amber-400/10",
        trend: supportTickets ? `${supportTickets.length} total` : "0 total",
        subtext: "All support channels",
      },
    ];
  }, [stats, period, supportTickets]);

  const isLoading =
    statsLoading || analyticsLoading || ordersLoading || activityLoading || ticketsLoading;

  const getErrorMessageText = () => {
    if (!statsError) return "";
    return statsError instanceof Error
      ? statsError.message
      : "Failed to load dashboard data";
  };
  const error = getErrorMessageText();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-center">
        <div className="p-4 rounded bg-rose-500/10 mb-4">
          <XCircle className="w-12 h-12 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Failed to load dashboard
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {error}
          <br />
          <span className="text-xs text-muted-foreground mt-2 block">
            Target: {process.env.NEXT_PUBLIC_API_URL || "/api"}
          </span>
        </p>
        <Button
          onClick={handleManualRefresh}
          variant="outline"
          className="border-border hover:bg-accent"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <DashboardHeader
        username={admin?.username}
        period={period}
        setPeriod={setPeriod}
        handleManualRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Stats Grid */}
      <DashboardStatsGrid statCards={statCards} />

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (Chart + Recent Orders) */}
        <div className="lg:col-span-2 space-y-8">
          <DashboardRevenueChart analytics={analytics} isLoading={isLoading} />
          <DashboardRecentOrders recentOrders={recentOrders} isLoading={ordersLoading} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TopProductsWidget />
            <LowStockAlerts />
          </div>
        </div>

        {/* Right Column (Widgets + Activity) */}
        <div className="space-y-8">
          <DashboardQuickLaunch />

          <DashboardOrderStatusPieChart
            orderStatusDist={orderStatusDist}
            isLoading={orderStatusLoading}
          />

          <Card className="bg-card/40 border-border">
            <CardHeader className="pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-foreground">
                  Recent Activity
                </CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-6 max-h-125 overflow-y-auto custom-scrollbar pr-2">
              <ActivityFeed logs={activityLogs || []} isLoading={activityLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
