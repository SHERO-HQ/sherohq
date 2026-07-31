"use client";
import { useMemo } from "react";
import { useAIAnalyticsSummary } from "@/hooks/queries/useAdmin";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Brain,
  AlertCircle,
  MessageSquare,
  Camera,
  Activity,
  ShieldCheck,
} from "lucide-react";

import { type AIAnalyticsTotals } from "@/services/api";

const EMPTY_TOTALS: AIAnalyticsTotals = {
  totalInteractions: 0,
  imageInteractions: 0,
  failedRecommendations: 0,
  openGapRequests: 0,
};

// --- Premium Glassmorphic Recharts Tooltip ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 backdrop-blur-md border border-border p-3 rounded shadow-[0_10px_25px_rgba(0,0,0,0.5)] space-y-1.5 animate-in fade-in zoom-in-95 duration-100 select-none">
        {label && (
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider font-mono">
            {label}
          </p>
        )}
        <div className="space-y-1">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shadow-xs"
                style={{
                  backgroundColor: item.fill || item.stroke || item.color,
                }}
              />
              <span className="text-xs text-muted-foreground font-medium capitalize">
                {item.name === "count"
                  ? "Interactions"
                  : item.name === "queryCount"
                    ? "Queries"
                    : item.name}
                :
              </span>
              <span className="text-xs text-foreground font-bold font-mono">
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const AIAnalyticsSkeleton = () => (
  <div className="space-y-8 animate-pulse select-none">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-accent/50 rounded" />
        <div className="h-4 w-96 bg-accent/50 rounded" />
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {new Array(4).fill(0).map((_, i) => (
        <Card
          key={i}
          className="bg-card border border-border p-6 space-y-4"
        >
          <div className="flex justify-between items-center">
            <div className="h-4 w-28 bg-accent/50 rounded" />
            <div className="h-6 w-6 bg-accent/50 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-8 w-24 bg-accent rounded" />
            <div className="h-3 w-32 bg-accent/50 rounded" />
          </div>
        </Card>
      ))}
    </div>

    {/* Charts Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {new Array(4).fill(0).map((_, i) => (
        <Card
          key={i}
          className="bg-card border border-border p-6 space-y-6"
        >
          <div className="space-y-2">
            <div className="h-5 w-40 bg-accent/50 rounded" />
            <div className="h-3 w-28 bg-accent/50 rounded" />
          </div>
          <div className="h-60 bg-accent/50 rounded w-full flex items-end p-4">
            {i % 2 === 0 ? (
              <div className="w-full flex items-end gap-3 h-full">
                {[30, 60, 45, 80, 55, 90, 40].map((h, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-accent/50 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-border flex items-center justify-center" />
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

export default function AIAnalytics() {
  const { data: result, isLoading: loading } = useAIAnalyticsSummary(
    ADMIN_POLLING_INTERVAL,
  );
  const data = result?.success ? result.data : null;

  // All hooks must be called unconditionally (before any early return)
  const dailyVolumeData = useMemo(() => {
    const rows = (data?.dailyVolume || []).map(
      (entry: { day: string; count: string | number }) => ({
        day: entry.day,
        count: Number(entry.count) || 0,
        label: new Date(entry.day).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }),
    );

    return rows.sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime(),
    );
  }, [data?.dailyVolume]);

  const intentData = useMemo(
    () =>
      (data?.topIntents || []).map(
        (entry: { intent: string; count: string | number }) => ({
          intent: entry.intent || "unknown",
          count: Number(entry.count) || 0,
        }),
      ),
    [data?.topIntents],
  );

  const gapPressureData = useMemo(
    () =>
      (data?.topGaps || [])
        .slice(0, 6)
        .map((entry: { keyword: string; queryCount: number }) => ({
          keyword: entry.keyword,
          queryCount: Number(entry.queryCount) || 0,
        })),
    [data?.topGaps],
  );

  const totals = data?.totals || EMPTY_TOTALS;

  const totalInteractions =
    totals.totalInteractions ||
    dailyVolumeData.reduce((acc, curr) => acc + curr.count, 0);
  const imageUsageRate =
    totalInteractions > 0
      ? (totals.imageInteractions / totalInteractions) * 100
      : 0;
  const resolutionRate =
    totalInteractions > 0
      ? (1 - totals.failedRecommendations / totalInteractions) * 100
      : 100;
  const avgDailyVolume =
    dailyVolumeData.length > 0 ? totalInteractions / dailyVolumeData.length : 0;

  const firstDayVolume = dailyVolumeData[0]?.count || 0;
  const lastDayVolume = dailyVolumeData[dailyVolumeData.length - 1]?.count || 0;
  const trendDelta =
    firstDayVolume > 0
      ? ((lastDayVolume - firstDayVolume) / firstDayVolume) * 100
      : 0;

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

  if (loading) {
    return <AIAnalyticsSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Brain className="text-brand-secondary-500" /> AI Intelligence Hub
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time insights into user queries, intent patterns, and catalog
            gaps.
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" /> Total AI
              Interactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalInteractions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Past 30 days volume</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Avg Daily Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {avgDailyVolume.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Conversations per day</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Camera className="w-4 h-4 text-purple-400" /> Image-Assisted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {imageUsageRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Image-assisted sessions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-secondary-400" />{" "}
              Resolution Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {resolutionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Non-fallback response ratio
            </p>
          </CardContent>
        </Card>
      </div>

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
                  content={<CustomTooltip />}
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
                  content={<CustomTooltip />}
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
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4 text-[10px]">
                  {intentData.map((entry, index) => (
                    <div
                      key={entry.intent}
                      className="flex items-center gap-1.5"
                    >
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
              Open gap requests: {totals.openGapRequests}
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
                      <stop
                        offset="95%"
                        stopColor="#f59e0b"
                        stopOpacity={0.2}
                      />
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
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
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

      {/* Catalog Gaps Table */}
      <Card className="bg-card/40 border-border overflow-hidden relative group">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <CardHeader className="border-b border-border bg-card/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-foreground">
                Catalog Deficiency Analysis
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Products or services users asked for that we don't have
              </CardDescription>
            </div>
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Unmet Need (Keyword)
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Requests
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Last Request
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.topGaps.map((gap) => (
                <tr
                  key={gap.keyword}
                  className="border-b border-border last:border-0 hover:bg-accent transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-foreground capitalize">
                      {gap.keyword}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-brand-secondary-400 font-bold font-mono">
                      {gap.queryCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(gap.lastRequested).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      Investigating
                    </span>
                  </td>
                </tr>
              ))}
              {(!data?.topGaps || data.topGaps.length === 0) && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-muted-foreground italic"
                  >
                    No catalog gaps identified yet. Our inventory matching is
                    currently 100%.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
