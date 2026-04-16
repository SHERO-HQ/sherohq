"use client";
import { useEffect, useMemo, useState } from "react";
import { authFetch } from "@/services/client";
import AdminLayout from "@/components/admin/AdminLayout";
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
  TrendingUp,
  Search,
  AlertCircle,
  MessageSquare,
  Camera,
  Activity,
  ShieldCheck,
} from "lucide-react";

interface AnalyticsTotals {
  totalInteractions: number;
  imageInteractions: number;
  failedRecommendations: number;
  openGapRequests: number;
}

interface AnalyticsData {
  topIntents: { intent: string; count: string | number }[];
  topGaps: { keyword: string; queryCount: number; lastRequested: string }[];
  dailyVolume: { day: string; count: string | number }[];
  totals: AnalyticsTotals;
}

const EMPTY_TOTALS: AnalyticsTotals = {
  totalInteractions: 0,
  imageInteractions: 0,
  failedRecommendations: 0,
  openGapRequests: 0,
};

export default function AIAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await authFetch("/api/analytics/summary");
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch AI analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // All hooks must be called unconditionally (before any early return)
  const dailyVolumeData = useMemo(() => {
    const rows = (data?.dailyVolume || []).map((entry) => ({
      day: entry.day,
      count: Number(entry.count) || 0,
      label: new Date(entry.day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));

    return rows.sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime(),
    );
  }, [data?.dailyVolume]);

  const intentData = useMemo(
    () =>
      (data?.topIntents || []).map((entry) => ({
        intent: entry.intent || "unknown",
        count: Number(entry.count) || 0,
      })),
    [data?.topIntents],
  );

  const gapPressureData = useMemo(
    () =>
      (data?.topGaps || []).slice(0, 6).map((entry) => ({
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
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Brain className="text-emerald-500" /> AI Intelligence Hub
            </h1>
            <p className="text-slate-400 text-sm">
              Real-time insights into user queries, intent patterns, and catalog
              gaps.
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="bg-slate-900 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" /> Total AI
                Interactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {totalInteractions}
              </div>
              <p className="text-xs text-slate-500 mt-1">Past 30 days volume</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Avg Daily Load
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {avgDailyVolume.toFixed(1)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Conversations per day
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" /> Image-Assisted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {imageUsageRate.toFixed(1)}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Image-assisted sessions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Resolution
                Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {resolutionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Non-fallback response ratio
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interaction Volume */}
          <Card className="bg-slate-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Interaction Trends</CardTitle>
              <CardDescription>30-day AI usage volume</CardDescription>
            </CardHeader>
            <CardContent className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyVolumeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                    vertical={false}
                  />
                  <XAxis dataKey="label" stroke="#475569" fontSize={10} />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Volume Velocity */}
          <Card className="bg-slate-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Engagement Velocity</CardTitle>
              <CardDescription>
                {trendDelta >= 0 ? "+" : ""}
                {trendDelta.toFixed(1)}% change from first to latest day
              </CardDescription>
            </CardHeader>
            <CardContent className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyVolumeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                    vertical={false}
                  />
                  <XAxis dataKey="label" stroke="#475569" fontSize={10} />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Intent Distribution */}
          <Card className="bg-slate-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">User Intent Map</CardTitle>
              <CardDescription>Why users are talking to SHERO</CardDescription>
            </CardHeader>
            <CardContent className="h-75">
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
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      />
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
                        <span className="text-slate-400 capitalize">
                          {entry.intent}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  No intent data available yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Catalog Gap Pressure */}
          <Card className="bg-slate-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Gap Pressure</CardTitle>
              <CardDescription>
                Open gap requests: {totals.openGapRequests}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-75">
              {gapPressureData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={gapPressureData}
                    layout="vertical"
                    margin={{ top: 8, right: 10, left: 8, bottom: 8 }}
                  >
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
                    />
                    <YAxis
                      type="category"
                      dataKey="keyword"
                      width={110}
                      stroke="#475569"
                      fontSize={10}
                      tickFormatter={(value) =>
                        String(value).length > 16
                          ? `${String(value).slice(0, 16)}...`
                          : String(value)
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="queryCount"
                      fill="#f59e0b"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  No unresolved catalog gaps to chart.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Catalog Gaps Table */}
        <Card className="bg-slate-900 border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white">
                  Catalog Deficiency Analysis
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Products or services users asked for that we don&apos;t have
                </CardDescription>
              </div>
              <div className="p-2 rounded bg-amber-500/10 text-amber-500">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Unmet Need (Keyword)
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Last Request
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.topGaps.map((gap) => (
                  <tr
                    key={gap.keyword}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-white capitalize">
                        {gap.keyword}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-emerald-400 font-bold">
                        {gap.queryCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(gap.lastRequested).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase">
                        Investigating
                      </span>
                    </td>
                  </tr>
                ))}
                {(!data?.topGaps || data.topGaps.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-slate-500 italic"
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
    </AdminLayout>
  );
}
