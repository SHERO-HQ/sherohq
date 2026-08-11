"use client";

import React from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
} from "lucide-react";
import { toReadableOrderId } from "@/utils/orderId";
import { ChartTooltip } from "@/components/admin/ChartTooltip";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type {
  AnalyticsData,
  StockDistribution,
  OrderStatusDistribution,
  RecentOrder,
  RegionalData,
  TopProduct,
} from "@/services/api";

const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false },
);
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false },
);

const getOrderStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-brand-secondary-500/10 border border-brand-secondary-500/20 text-brand-secondary-400";
    case "pending":
      return "bg-amber-500/10 border border-amber-500/20 text-amber-400";
    case "processing":
      return "bg-blue-500/10 border border-blue-500/20 text-blue-400";
    case "intransit":
      return "bg-purple-500/10 border border-purple-500/20 text-purple-400";
    default:
      return "bg-rose-500/10 border border-rose-500/20 text-rose-400";
  }
};

export function RevenueChartSection({
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
    <div className="bg-card/40 border border-border rounded p-6 relative group overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-brand-secondary-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-brand-secondary-400" />
        Revenue Over Time
      </h3>
      <div className="absolute top-6 right-6 bg-muted/80 backdrop-blur-md rounded border border-border p-0.5 flex">
        <button
          onClick={() => setChartType("line")}
          className={`p-1.5 rounded transition-colors ${
            chartType === "line"
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Line Chart"
        >
          <LineChartIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setChartType("bar")}
          className={`p-1.5 rounded transition-colors ${
            chartType === "bar"
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Bar Chart"
        >
          <BarChart3 className="w-4 h-4" />
        </button>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart
              data={analytics}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
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
                tickFormatter={(value: number) => `GHS${value}`}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 2 }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: "#10b981",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
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
                activeDot={{
                  r: 4,
                  stroke: "#ef4444",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
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
                activeDot={{
                  r: 5,
                  stroke: "#3b82f6",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={2000}
              />
            </LineChart>
          ) : (
            <BarChart
              data={analytics}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorReportRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
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
                tickFormatter={(value: number) => `GHS${value}`}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.02)" }}
              />
              <Bar
                dataKey="revenue"
                fill="url(#colorReportRev)"
                stroke="#3b82f6"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={1500}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StockDistributionChart({
  data,
}: {
  readonly data: StockDistribution[];
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="bg-card/40 border border-border rounded p-6 hover:border-blue-500/20 transition-colors duration-300">
      <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
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
                <Cell
                  key={`stock-${entry.name || index}`}
                  fill={entry.color}
                  stroke="rgba(15, 23, 42, 0.5)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function OrderStatusChart({
  data,
}: {
  readonly data: OrderStatusDistribution[];
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="bg-card/40 border border-border rounded p-6 hover:border-amber-500/20 transition-colors duration-300">
      <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
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
            <Tooltip content={<ChartTooltip />} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RegionalSalesChart({ data }: { readonly data: RegionalData[] }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="bg-card/40 border border-border rounded p-6 hover:border-brand-secondary-500/20 transition-colors duration-300">
      <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-brand-secondary-400" />
        Sales by Region
      </h3>
      <div className="h-62">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
          >
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
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.02)" }}
            />
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

export function RecentOrders({ orders }: { readonly orders: RecentOrder[] }) {
  return (
    <div className="lg:col-span-2 bg-card/40 border border-border rounded p-6 relative group overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-blue-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-blue-400" />
        Recent Orders
      </h3>
      <div className="space-y-3 max-h-100 overflow-y-auto custom-scrollbar pr-2">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3.5 rounded bg-card border border-border hover:border-blue-500/20 hover:bg-card/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="font-mono text-sm text-muted-foreground font-bold">
                    {toReadableOrderId(order.id)}
                  </span>
                  <span className="text-xs text-foreground font-semibold mt-0.5">
                    {order.customer.firstName} {order.customer.lastName}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-30 font-mono mt-0.5">
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
                  GHS
                  {order.total.toLocaleString("en-GH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-4 italic">
            No orders yet
          </p>
        )}
      </div>
    </div>
  );
}

export function TopProducts({ products }: { readonly products: TopProduct[] }) {
  return (
    <div className="lg:col-span-1 bg-card/40 border border-border rounded p-6 relative group overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-purple-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
        <Package className="w-5 h-5 text-purple-400" />
        Top Selling Products
      </h3>
      <div className="space-y-4">
        {(products || []).map((product, idx) => (
          <div
            key={`${product.name}-${idx}`}
            className="flex items-center justify-between p-3.5 rounded bg-card border border-border hover:border-purple-500/20 hover:bg-card/50 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted/80 border border-border text-[10px] font-bold text-foreground font-mono">
                {idx + 1}
              </span>
              <div>
                <p className="font-semibold text-foreground text-sm line-clamp-1">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {product.quantity} sold
                </p>
              </div>
            </div>
            <span className="font-bold text-brand-secondary-400 text-sm font-mono">
              GHS
              {product.revenue.toLocaleString("en-GH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-muted-foreground text-center py-4 italic">
            No sales data yet
          </p>
        )}
      </div>
    </div>
  );
}
