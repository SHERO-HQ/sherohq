"use client";
import { useState, useMemo } from "react";

import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import {
  useAdminStats,
  useAnalytics,
  useRecentOrders,
  useActivityLogs,
} from "@/hooks/queries/useAdmin";
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  Plus,
  TrendingUp,
  Settings,
  Brain,
  RefreshCw,
} from "lucide-react";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import dynamic from "next/dynamic";

// Dynamically import heavy chart components
const AreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  { ssr: false },
);
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false },
);
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false },
);
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), {
  ssr: false,
});
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), {
  ssr: false,
});

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import ActivityFeed from "@/components/admin/ActivityFeed";
import { toReadableOrderId } from "@/utils/orderId";

// --- Premium Glassmorphic Recharts Tooltip ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 backdrop-blur-md border border-border p-3 rounded shadow-[0_10px_25px_rgba(0,0,0,0.5)] space-y-1.5 animate-in fade-in zoom-in-95 duration-100 select-none">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider font-mono">
          {label ? new Date(label).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) : ""}
        </p>
        <div className="space-y-1">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shadow-xs"
                style={{ backgroundColor: item.stroke || item.color }}
              />
              <span className="text-xs text-muted-foreground font-medium capitalize">
                {item.name === "revenue" ? "Revenue" : item.name === "orders" ? "Orders" : item.name}:
              </span>
              <span className="text-xs text-foreground font-bold font-mono">
                {item.name === "revenue" ? `GH₵${(item.value || 0).toLocaleString()}` : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// --- Shape-Preserving AreaChart Shimmer Loader ---
const ChartSkeleton = () => (
  <div className="w-full h-full animate-pulse flex flex-col justify-between p-4 space-y-4 select-none">
    <div className="flex-1 w-full flex items-end gap-3 pt-6 border-b border-border pb-2">
      {[40, 65, 80, 50, 95, 70, 110].map((height, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
          <div
            className="w-full bg-accent/50 rounded-t transition-all duration-500"
            style={{ height: `${(height / 110) * 100}%` }}
          />
          <div className="h-1.5 w-8 bg-accent/50 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// --- Shape-Preserving PieChart Shimmer Loader ---
const PieSkeleton = () => (
  <div className="w-full h-full animate-pulse flex items-center justify-center relative py-6 select-none">
    <div className="w-28 h-28 rounded-full border-[6px] border-border flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-card border-2 border-slate-950/20 flex items-center justify-center">
        <div className="h-3 w-8 bg-accent/50 rounded" />
      </div>
    </div>
  </div>
);

// --- Internal Magnetic Card Component ---
interface StatCardItem {
  readonly title: string;
  readonly value: string | number;
  readonly icon: React.ElementType;
  readonly color: string;
  readonly bgColor: string;
  readonly trend: string;
  readonly subtext: string;
}

const MagneticStatCard = ({
  stat,
  index,
  prefersReducedMotion,
}: {
  readonly stat: StatCardItem;
  readonly index: number;
  readonly prefersReducedMotion: boolean;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    x.set(mouseXPos / width - 0.5);
    y.set(mouseYPos / height - 0.5);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={prefersReducedMotion ? {} : {
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="perspective-distant"
    >
      <Card className="bg-card/40  border-border hover:border-brand-secondary-500/40 transition-colors duration-500 group relative overflow-hidden h-full">
        {/* Subtle Glow Overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-brand-secondary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {stat.title}
          </CardTitle>
          <div className={cn("p-2 rounded", stat.bgColor)}>
            <stat.icon className={cn("w-4 h-4", stat.color)} />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-foreground mb-1 tracking-tight">
            {stat.value}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                stat.trend.startsWith("+")
                  ? "bg-brand-secondary-500/10 text-brand-secondary-400"
                  : "bg-rose-500/10 text-rose-400",
              )}
            >
              {stat.trend}
            </span>
            <span className="text-xs text-muted-foreground">{stat.subtext}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Helper for order status styles
const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-brand-secondary-500/10 border border-brand-secondary-500/20 text-brand-secondary-400";
    case "pending":
      return "bg-amber-500/10 border border-amber-500/20 text-amber-400";
    case "processing":
      return "bg-blue-500/10 border border-blue-500/20 text-blue-400";
    default:
      return "bg-rose-500/10 border border-rose-500/20 text-rose-400";
  }
};

const getTrendStyles = (trend: number) => {
  if (trend >= 0) return "bg-brand-secondary-500/10 text-brand-secondary-400";
  return "bg-rose-500/10 text-rose-400";
};

export default function AdminDashboard() {
  const { admin } = useAdmin();
  const prefersReducedMotion = useReducedMotion();
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year">(
    "today",
  );

  // React Query hooks with 30s auto-refresh
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
  } = useAnalytics(period, ADMIN_POLLING_INTERVAL);

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
        value: `GH₵${kpi.revenue.toLocaleString()}`,
        icon: DollarSign,
        color: "text-brand-secondary-400",
        bgColor: "bg-brand-secondary-400/10",
        trend: `${kpi.revenueGrowth >= 0 ? "+" : ""}${kpi.revenueGrowth}%`,
        trendColor: getTrendStyles(kpi.revenueGrowth),
        subtext: subtextMap[period],
      },
      {
        title: "Total Orders",
        value: kpi.orders,
        icon: ShoppingCart,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        trend: `${kpi.ordersGrowth >= 0 ? "+" : ""}${kpi.ordersGrowth}%`,
        trendColor: getTrendStyles(kpi.ordersGrowth),
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
        title: "Pending Orders",
        value: stats?.pendingOrders ?? 0,
        icon: Clock,
        color: "text-amber-400",
        bgColor: "bg-amber-400/10",
        trend: `${(stats?.pendingGrowth ?? 0) >= 0 ? "+" : ""}${stats?.pendingGrowth ?? 0}%`,
        trendColor: getTrendStyles(stats?.pendingGrowth ?? 0),
        subtext: "vs yesterday",
      },
    ];
  }, [stats, period]);

  const isLoading =
    statsLoading || analyticsLoading || ordersLoading || activityLoading;
  const getErrorMessage = () => {
    if (!statsError) return "";
    return statsError instanceof Error
      ? statsError.message
      : "Failed to load dashboard data";
  };
  const error = getErrorMessage();

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-sm">
            Welcome back,{" "}
            <span className="text-brand-secondary-400 font-semibold">
              {admin?.username}
            </span>
            . Here's your store's performance at a glance.
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex bg-card/50 p-1 rounded border border-border">
            {[
              { value: "today", label: "Today" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  setPeriod(opt.value as "today" | "week" | "month" | "year")
                }
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded transition",
                  period === opt.value
                    ? "bg-brand-secondary-600 text-white shadow"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-accent h-9 w-9"
            title="Refresh Data"
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </Button>
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-accent"
            asChild
          >
            <Link href="/admin/reports">
              <TrendingUp className="mr-2 h-4 w-4" /> View Detailed Reports
            </Link>
          </Button>
          <Button
            className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white font-bold"
            asChild
          >
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? new Array(4).fill(0).map((_, i) => (
            <div
              key={`skeleton-stat-summary-${i}`}
              className="h-36 rounded bg-card/40  border border-border animate-pulse relative overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-accent/50 rounded" />
                  <div className="h-8 w-8 bg-accent/50 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-32 bg-accent rounded" />
                  <div className="h-4 w-20 bg-accent/50 rounded" />
                </div>
              </div>
            </div>
          ))
          : statCards.map((stat, index) => (
            <MagneticStatCard key={stat.title} stat={stat} index={index} prefersReducedMotion={prefersReducedMotion} />
          ))}
      </div>

      {/* Row 1: Revenue Trends and Sales Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 bg-card/40  border-border p-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-foreground">
                Revenue & Order Trends
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Last 7 days performance
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-brand-secondary-500" />
                <span className="text-xs text-muted-foreground">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-xs text-muted-foreground">Orders</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-125 w-full mt-4">
              {analyticsLoading ? (
                <ChartSkeleton />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analytics}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(str) => {
                        const date = new Date(str);
                        return date.toLocaleDateString("en-US", {
                          weekday: "short",
                        });
                      }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `GH₵${val}`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 2 }} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                      animationDuration={1500}
                      isAnimationActive={!prefersReducedMotion}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorOrd)"
                      animationDuration={2000}
                      isAnimationActive={!prefersReducedMotion}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Side Widgets */}
        <div className="space-y-6">
          <Card className="bg-card/40  border-border overflow-hidden">
            <div className="p-6 bg-linear-to-br from-brand-secondary-600/20 to-transparent border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Quick Launch</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Common administrative tasks
              </p>
            </div>
            <div className="p-4 space-y-2">
              {[
                {
                  title: "New Product",
                  icon: Plus,
                  link: "/admin/products/new",
                  color: "bg-brand-secondary-500/10 text-brand-secondary-400",
                },
                {
                  title: "View All Orders",
                  icon: ShoppingCart,
                  link: "/admin/orders",
                  color: "bg-blue-500/10 text-blue-400",
                },
                {
                  title: "Stock Alerts",
                  icon: AlertTriangle,
                  link: "/admin/products?stock=low",
                  color: "bg-amber-500/10 text-amber-400",
                },
                {
                  title: "AI Intelligence Hub",
                  icon: Brain,
                  link: "/admin/ai-analytics",
                  color: "bg-purple-500/10 text-purple-400",
                },
                {
                  title: "Admin Settings",
                  icon: Settings,
                  link: "/admin/profile",
                  color: "bg-slate-500/10 text-muted-foreground",
                },
              ].map((action) => (
                <Link
                  key={action.title}
                  href={action.link}
                  className="flex items-center justify-between p-3 rounded bg-slate-950/20 border border-border hover:border-brand-secondary-500/20 hover:bg-card/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded", action.color)}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {action.title}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand-secondary-500 transition opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </Card>

          <Card className="bg-card/40 border-border overflow-hidden relative group">
            <div className="absolute inset-0 bg-radial-gradient from-blue-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <CardHeader className="pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-foreground">
                  Orders by Status
                </CardTitle>
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-50 w-full">
                {statsLoading ? (
                  <PieSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Pending",
                            value: stats?.pendingOrders || 0,
                            fill: "#f59e0b",
                          },
                          {
                            name: "Delivered",
                            value:
                              (stats?.orders || 0) -
                              (stats?.pendingOrders || 0),
                            fill: "#10b981",
                          },
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="rgba(15, 23, 42, 0.5)"
                        strokeWidth={2}
                        isAnimationActive={!prefersReducedMotion}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 2: Tables & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2 bg-card/40  border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <div>
              <CardTitle className="text-lg text-foreground">
                Recent Incoming Orders
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Real-time order tracking
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              className="text-brand-secondary-400 hover:text-brand-secondary-300 hover:bg-brand-secondary-500/10"
              asChild
            >
              <Link href="/admin/orders">
                View All Orders <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(() => {
                  const hasNoOrders =
                    !recentOrders ||
                    !Array.isArray(recentOrders) ||
                    recentOrders.length === 0;

                  if (ordersLoading) {
                    return new Array(5).fill(0).map((_, i) => (
                      <tr
                        key={`skeleton-recent-order-${i}`}
                        className="animate-pulse border-b border-border last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div className="h-4 bg-accent/50 rounded w-16" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="h-4 bg-accent rounded w-32" />
                            <div className="h-3 bg-accent/50 rounded w-24" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-accent/50 rounded w-20" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-accent rounded w-16" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-5 bg-accent/50 rounded-full w-20" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="h-8 bg-accent/50 rounded w-16 ml-auto" />
                        </td>
                      </tr>
                    ));
                  }

                  if (hasNoOrders) {
                    return (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-muted-foreground italic"
                        >
                          No recent orders found
                        </td>
                      </tr>
                    );
                  }

                  return recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border last:border-0 hover:bg-accent transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-mono text-muted-foreground group-hover:text-brand-secondary-400 transition-colors"
                        >
                          {toReadableOrderId(order.id)}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="flex flex-col"
                        >
                          <span className="text-sm font-semibold text-foreground group-hover:text-brand-secondary-400 transition-colors">
                            {order.customer.firstName} {order.customer.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {order.customer.email}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-brand-secondary-400">
                        GH₵{order.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                            getStatusStyles(order.status),
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                          asChild
                        >
                          <Link href={`/admin/orders/${order.id}`}>
                            Details
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activity Card */}
        <Card className="bg-card/40  border-border">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-foreground">
                Recent Activity
              </CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-6 max-h-125 overflow-y-auto">
            <ActivityFeed
              logs={activityLogs || []}
              isLoading={activityLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
