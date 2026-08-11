"use client";

import React from "react";
import {
  MessageSquare,
  Send,
  AlertTriangle,
  BarChart3,
  LineChart as LineChartIcon,
  Loader2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { ChartTooltip } from "@/components/admin/ChartTooltip";

const ComposedChart = dynamic(() => import("recharts").then((m) => m.ComposedChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });

interface AnalyticsData {
  dailyData: { date: string; inbound: number; outbound: number }[];
  totals: { inbound: number; outbound: number; failedOutbound: number };
}

interface WhatsAppAnalyticsTabProps {
  analyticsData: AnalyticsData | null;
  analyticsLoading: boolean;
  chartType: "composed" | "line" | "bar";
  setChartType: (type: "composed" | "line" | "bar") => void;
  prefersReducedMotion: boolean;
}

export function WhatsAppAnalyticsTab({
  analyticsData,
  analyticsLoading,
  chartType,
  setChartType,
  prefersReducedMotion,
}: WhatsAppAnalyticsTabProps) {
  if (analyticsLoading || !analyticsData) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-secondary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card/40 border border-border rounded p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Inbound Messages</h3>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {analyticsData.totals.inbound}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Received in last 14 days</p>
        </div>

        <div className="bg-card/40 border border-border rounded p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded">
              <Send className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Outbound Messages</h3>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {analyticsData.totals.outbound}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Sent in last 14 days</p>
        </div>

        <div className="bg-card/40 border border-border rounded p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Failed Deliveries</h3>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {analyticsData.totals.failedOutbound}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Failed to send in last 14 days</p>
        </div>
      </div>

      <div className="bg-card/40 border border-border rounded p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground">Message Volume (Last 14 Days)</h3>
          <div className="flex items-center gap-1 bg-background/50 border border-border p-1 rounded-md">
            <button
              onClick={() => setChartType("composed")}
              className={`p-1.5 rounded transition-colors ${
                chartType === "composed"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Mixed Chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
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
        </div>
        <div className="h-100 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={analyticsData.dailyData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorWaOutbound" x1="0" y1="0" x2="0" y2="1">
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
                    const d = new Date(value);
                    return isNaN(d.getTime())
                      ? value
                      : new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                        }).format(d);
                  } catch {
                    return value;
                  }
                }}
              />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Legend verticalAlign="top" height={36} />
              {chartType === "bar" || chartType === "composed" ? (
                <Bar
                  dataKey="outbound"
                  name="Outbound"
                  fill="url(#colorWaOutbound)"
                  stroke="#3b82f6"
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={!prefersReducedMotion}
                  animationDuration={1500}
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey="outbound"
                  name="Outbound"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 4,
                    stroke: "#3b82f6",
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                  isAnimationActive={!prefersReducedMotion}
                  animationDuration={1500}
                />
              )}

              {chartType === "bar" ? (
                <Bar
                  dataKey="inbound"
                  name="Inbound"
                  fill="#10b981"
                  stroke="#10b981"
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={!prefersReducedMotion}
                  animationDuration={1500}
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey="inbound"
                  name="Inbound"
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
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
