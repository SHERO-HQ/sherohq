"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ShoppingCart, PieChart as PieChartIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartTooltip } from "@/components/admin/ChartTooltip";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { AnalyticsData, OrderStatusDistribution } from "@/services/api";

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

const PieSkeleton = () => (
  <div className="w-full h-full animate-pulse flex items-center justify-center relative py-6 select-none">
    <div className="w-28 h-28 rounded-full border-[6px] border-border flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center">
        <div className="h-3 w-8 bg-accent/50 rounded" />
      </div>
    </div>
  </div>
);

export function DashboardRevenueChart({
  analytics,
  isLoading,
}: {
  analytics: AnalyticsData[] | undefined;
  isLoading: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <Card className="bg-card/40 border-border p-2">
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
      <CardContent className="pb-2">
        <div className="h-75 w-full mt-4">
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics || []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                  tickFormatter={(str: string) => {
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
                  tickFormatter={(val: number) => `GHS${val}`}
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
                  content={<ChartTooltip />}
                  cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 2 }}
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
  );
}

export function DashboardOrderStatusPieChart({
  orderStatusDist,
  isLoading,
}: {
  orderStatusDist: OrderStatusDistribution[] | undefined;
  isLoading: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const hasData =
    orderStatusDist &&
    orderStatusDist.length > 0 &&
    orderStatusDist.some((item) => item.value > 0);

  return (
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
        <div className="h-75 w-full flex items-center justify-center">
          {isLoading ? (
            <PieSkeleton />
          ) : hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusDist}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="rgba(15, 23, 42, 0.5)"
                  strokeWidth={2}
                  isAnimationActive={!prefersReducedMotion}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <PieChartIcon className="w-10 h-10 stroke-1 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium">No order status data available</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Orders will appear here once recorded.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
