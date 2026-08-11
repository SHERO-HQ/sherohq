"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartTooltip } from "@/components/admin/ChartTooltip";

const BarChart = dynamic(
  () => import("recharts").then((m) => m.BarChart),
  { ssr: false },
);
const Bar = dynamic(
  () => import("recharts").then((m) => m.Bar),
  { ssr: false },
);
const XAxis = dynamic(
  () => import("recharts").then((m) => m.XAxis),
  { ssr: false },
);
const YAxis = dynamic(
  () => import("recharts").then((m) => m.YAxis),
  { ssr: false },
);
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false },
);
const Tooltip = dynamic(
  () => import("recharts").then((m) => m.Tooltip),
  { ssr: false },
);
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false },
);
const LineChart = dynamic(
  () => import("recharts").then((m) => m.LineChart),
  { ssr: false },
);
const Line = dynamic(
  () => import("recharts").then((m) => m.Line),
  { ssr: false },
);
const PieChart = dynamic(
  () => import("recharts").then((m) => m.PieChart),
  { ssr: false },
);
const Pie = dynamic(
  () => import("recharts").then((m) => m.Pie),
  { ssr: false },
);
const Cell = dynamic(
  () => import("recharts").then((m) => m.Cell),
  { ssr: false },
);

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

interface AIAnalyticsChartsProps {
  dailyVolumeData: Array<{ day: string; count: number; label: string }>;
  trendDelta: number;
  intentData: Array<{ intent: string; count: number }>;
  gapPressureData: Array<{ keyword: string; queryCount: number }>;
  openGapRequests: number;
}

export function AIAnalyticsCharts({
  dailyVolumeData,
  trendDelta,
  intentData,
  gapPressureData,
  openGapRequests,
}: AIAnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Interaction Volume */}
      <Card className="bg-card/40 border-border hover:border-brand-secondary-500/30 transition-colors duration-300 relative group overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-brand-secondary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <CardHeader>
          <CardTitle className="text-foreground">Interaction Trends</CardTitle>
          <CardDescription className="text-muted-foreground">
            30-day AI usage volume
          </CardDescription>
        </CardHeader>
        <CardContent className="h-75 min-h-50">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dailyVolumeData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.02)" }}
              />
              <Bar
                dataKey="count"
                fill="url(#colorCount)"
                stroke="#10b981"
                strokeWidth={1.5}
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Volume Velocity */}
      <Card className="bg-card/40 border-border hover:border-blue-500/30 transition-colors duration-300 relative group overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <CardHeader>
          <CardTitle className="text-foreground">Engagement Velocity</CardTitle>
          <CardDescription className="text-muted-foreground">
            {trendDelta >= 0 ? "+" : ""}
            {trendDelta.toFixed(1)}% change from first to latest day
          </CardDescription>
        </CardHeader>
        <CardContent className="h-75 min-h-50">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailyVolumeData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{
                  r: 3,
                  stroke: "#3b82f6",
                  strokeWidth: 2,
                  fill: "#0f172a",
                }}
                activeDot={{
                  r: 5,
                  stroke: "#fff",
                  strokeWidth: 2,
                  fill: "#3b82f6",
                }}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Intent Distribution */}
      <Card className="bg-card/40 border-border hover:border-purple-500/30 transition-colors duration-300 relative group overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <CardHeader>
          <CardTitle className="text-foreground">User Intent Map</CardTitle>
          <CardDescription className="text-muted-foreground">
            Why users are talking to SHERO
          </CardDescription>
        </CardHeader>
        <CardContent className="h-75 min-h-50">
          {intentData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={intentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={84}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="intent"
                  >
                    {intentData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.intent}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="rgba(15, 23, 42, 0.5)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4 text-[10px]">
                {intentData.map((entry, index) => (
                  <div key={entry.intent} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                    <span className="text-muted-foreground capitalize">
                      {entry.intent}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No intent data available yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Catalog Gap Pressure */}
      <Card className="bg-card/40 border-border hover:border-amber-500/30 transition-colors duration-300 relative group overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <CardHeader>
          <CardTitle className="text-foreground">Gap Pressure</CardTitle>
          <CardDescription className="text-muted-foreground">
            Open gap requests: {openGapRequests}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-75 min-h-50">
          {gapPressureData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={gapPressureData}
                layout="vertical"
                margin={{ top: 8, right: 10, left: -10, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="colorGap" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="#475569"
                  fontSize={10}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="keyword"
                  width={110}
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    String(value).length > 16
                      ? `${String(value).slice(0, 16)}...`
                      : String(value)
                  }
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{
                    stroke: "rgba(255,255,255,0.05)",
                    strokeWidth: 2,
                  }}
                />
                <Bar
                  dataKey="queryCount"
                  fill="url(#colorGap)"
                  stroke="#f59e0b"
                  strokeWidth={1}
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No unresolved catalog gaps to chart.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
