import { useState, useMemo } from "react";

import UniversalLink from "@/components/common/UniversalLink";
import { useAdmin } from "@/context/AdminContext";
import { useTitle } from "@/hooks/useTitle";
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
  RefreshCw,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import ActivityFeed from "@/components/admin/ActivityFeed";

// --- Internal Magnetic Card Component ---
interface StatCardItem {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend: string;
  subtext: string;
}

const MagneticStatCard = ({
  stat,
  index,
}: {
  stat: StatCardItem;
  index: number;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    x.set(mouseXPos / width - 0.5);
    y.set(mouseYPos / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="perspective-distant"
    >
      <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10 hover:border-emerald-500/40 transition-colors duration-500 group relative overflow-hidden h-full">
        {/* Subtle Glow Overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-slate-400 font-sora">
            {stat.title}
          </CardTitle>
          <div className={cn("p-2 rounded", stat.bgColor)}>
            <stat.icon className={cn("w-4 h-4", stat.color)} />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-white font-sora mb-1 tracking-tight">
            {stat.value}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                stat.trend.startsWith("+")
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-rose-500/10 text-rose-400",
              )}
            >
              {stat.trend}
            </span>
            <span className="text-xs text-slate-500">{stat.subtext}</span>
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
      return "bg-emerald-500/10 text-emerald-400";
    case "pending":
      return "bg-amber-500/10 text-amber-400";
    case "processing":
      return "bg-blue-500/10 text-blue-400";
    default:
      return "bg-rose-500/10 text-rose-400";
  }
};

export default function AdminDashboard() {
  useTitle("Admin Dashboard");
  const { admin } = useAdmin();
  const [period] = useState("7d");

  // React Query hooks with 30s auto-refresh
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useAdminStats(30000);

  const {
    data: analytics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useAnalytics(period);

  const {
    data: recentOrders,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useRecentOrders(30000);

  const {
    data: activityLogs,
    isLoading: activityLoading,
    refetch: refetchActivity,
  } = useActivityLogs(30000);

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

  const statCards = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: `GH₵${(stats?.revenue ?? 0).toLocaleString()}`,
        icon: DollarSign,
        color: "text-emerald-400",
        bgColor: "bg-emerald-400/10",
        trend: "+12.5%",
        subtext: "from last month",
      },
      {
        title: "Total Orders",
        value: stats?.orders ?? 0,
        icon: ShoppingCart,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        trend: "+8.2%",
        subtext: "from last month",
      },
      {
        title: "Active Products",
        value: stats?.products ?? 0,
        icon: Package,
        color: "text-purple-400",
        bgColor: "bg-purple-400/10",
        trend: "+2 new",
        subtext: "added this week",
      },
      {
        title: "Pending Orders",
        value: stats?.pendingOrders ?? 0,
        icon: Clock,
        color: "text-amber-400",
        bgColor: "bg-amber-400/10",
        trend: "-15%",
        subtext: "than yesterday",
      },
    ],
    [stats],
  );

  const isLoading =
    statsLoading || analyticsLoading || ordersLoading || activityLoading;
  const error = statsError
    ? statsError instanceof Error
      ? statsError.message
      : "Failed to load dashboard data"
    : "";

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="p-4 rounded bg-rose-500/10 mb-4">
            <XCircle className="w-12 h-12 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 font-sora">
            Failed to load dashboard
          </h2>
          <p className="text-slate-400 mb-6 max-w-md">
            {error}
            <br />
            <span className="text-xs text-slate-500 mt-2 block">
              Target: {import.meta.env.VITE_API_URL || "/api"}
            </span>
          </p>
          <Button
            onClick={handleManualRefresh}
            variant="outline"
            className="border-white/10 hover:bg-white/5"
          >
            Try Again
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white font-sora">
              Dashboard Overview
            </h1>
            <p className="text-slate-400">
              Welcome back,{" "}
              <span className="text-emerald-400 font-semibold">
                {admin?.username}
              </span>
              . Here's your store's performance at a glance.
            </p>
          </div>
          <div className="flex items-center flex-wrap gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="border-white/10 text-slate-400 hover:text-white hover:bg-white/5 h-10 w-10"
              title="Refresh Data"
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
            </Button>
            <Button
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
              asChild
            >
              <UniversalLink to="/admin/reports">
                <TrendingUp className="mr-2 h-4 w-4" /> View Detailed Reports
              </UniversalLink>
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              asChild
            >
              <UniversalLink to="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </UniversalLink>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? new Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={`skeleton-stat-${i}`}
                    className="h-32 rounded bg-slate-900 animate-pulse border border-white/5"
                  />
                ))
            : statCards.map((stat, index) => (
                <MagneticStatCard key={stat.title} stat={stat} index={index} />
              ))}
        </div>

        {/* Charts & Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border-white/10 p-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white font-sora">
                  Revenue & Order Trends
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Last 7 days performance
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-xs text-slate-400">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span className="text-xs text-slate-400">Orders</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full mt-4">
                {analyticsLoading ? (
                  <div className="w-full h-full bg-slate-800/50 rounded animate-pulse" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analytics}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRev"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorOrd"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.1}
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
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                        cursor={{ stroke: "#1e293b", strokeWidth: 2 }}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRev)"
                        animationDuration={1500}
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
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <div className="space-y-6">
            <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10 overflow-hidden">
              <div className="p-6 bg-linear-to-br from-emerald-600/20 to-transparent border-b border-white/5">
                <h3 className="text-lg font-bold text-white font-sora">
                  Quick Launch
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Common administrative tasks
                </p>
              </div>
              <div className="p-4 space-y-2">
                {[
                  {
                    title: "New Product",
                    icon: Plus,
                    link: "/admin/products/new",
                    color: "bg-emerald-500/10 text-emerald-400",
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
                    title: "Admin Settings",
                    icon: Settings,
                    link: "/admin/profile",
                    color: "bg-slate-500/10 text-slate-400",
                  },
                ].map((action) => (
                  <UniversalLink
                    key={action.title}
                    to={action.link}
                    className="flex items-center justify-between p-3 rounded hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded", action.color)}>
                        <action.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                        {action.title}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-500 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
                  </UniversalLink>
                ))}
              </div>
            </Card>

            <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-sora text-white">
                    Orders by Status
                  </CardTitle>
                  <ShoppingCart className="w-4 h-4 text-slate-500" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[200px] w-full">
                  {statsLoading ? (
                    <div className="w-full h-full bg-slate-800/50 rounded animate-pulse" />
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
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "2px",
                          }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-sora text-white">
                    Recent Activity
                  </CardTitle>
                  <Clock className="w-4 h-4 text-slate-500" />
                </div>
              </CardHeader>
              <CardContent className="pt-6 max-h-64 overflow-y-auto">
                <ActivityFeed
                  logs={activityLogs || []}
                  isLoading={activityLoading}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Orders Table */}
        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
            <div>
              <CardTitle className="text-lg text-white font-sora">
                Recent Incoming Orders
              </CardTitle>
              <CardDescription className="text-slate-500">
                Real-time order tracking
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
              asChild
            >
              <UniversalLink to="/admin/orders">
                View All Orders <ArrowRight className="ml-2 h-4 w-4" />
              </UniversalLink>
            </Button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ordersLoading ? (
                  new Array(5).fill(0).map((_, i) => (
                    <tr key={`skeleton-order-${i}`} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-4 bg-slate-800 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : !recentOrders || recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-slate-500 italic"
                    >
                      No recent orders found
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-white/2 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <UniversalLink
                          to={`/admin/orders/${order.id}`}
                          className="text-sm font-mono text-slate-400 group-hover:text-emerald-400 transition-colors"
                        >
                          #{order.id.slice(0, 8)}
                        </UniversalLink>
                      </td>
                      <td className="px-6 py-4">
                        <UniversalLink
                          to={`/admin/orders/${order.id}`}
                          className="flex flex-col"
                        >
                          <span className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {order.customer.firstName} {order.customer.lastName}
                          </span>
                          <span className="text-xs text-slate-500">
                            {order.customer.email}
                          </span>
                        </UniversalLink>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-400">
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
                          className="h-8 px-2 text-slate-400 hover:text-white hover:bg-white/10"
                          asChild
                        >
                          <UniversalLink to={`/admin/orders/${order.id}`}>
                            Details
                          </UniversalLink>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
