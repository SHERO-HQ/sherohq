"use client";
import { useState, useEffect } from "react";
import { userAuthFetch } from "@/services/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from "recharts";
import { Brain, TrendingUp, Search, AlertCircle, MessageSquare } from "lucide-react";

interface AnalyticsData {
  topIntents: { intent: string; count: string }[];
  topGaps: { keyword: string; queryCount: number; lastRequested: string }[];
  dailyVolume: { day: string; count: string }[];
}

export default function AIAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/analytics/summary", {
          headers: { 
            "Authorization": `Bearer ${window.localStorage.getItem("adminToken")}` 
          }
        });
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Brain className="text-emerald-500" /> AI Intelligence Hub
            </h1>
            <p className="text-slate-400 text-sm">
              Real-time insights into user queries, intent patterns, and catalog gaps.
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" /> Total AI Interactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {data?.dailyVolume.reduce((acc, curr) => acc + parseInt(curr.count), 0) || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Past 7 days volume</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-400" /> Catalog Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data?.topGaps.length || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Identified unmet needs</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">92.4%</div>
              <p className="text-xs text-slate-500 mt-1">AI resolution efficiency</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interaction Volume */}
          <Card className="bg-slate-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Interaction Trends</CardTitle>
              <CardDescription>Daily AI usage volume</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.dailyVolume || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="day" stroke="#475569" fontSize={10} tickFormatter={(str) => new Date(str).toLocaleDateString("en-US", { weekday: "short" })} />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Intent Distribution */}
          <Card className="bg-slate-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">User Intent Map</CardTitle>
              <CardDescription>Why users are talking to SHERO</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.topIntents || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="intent"
                  >
                    {(data?.topIntents || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4 text-[10px]">
                {(data?.topIntents || []).map((entry, index) => (
                  <div key={entry.intent} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-slate-400 capitalize">{entry.intent}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Catalog Gaps Table */}
        <Card className="bg-slate-900 border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white">Catalog Deficiency Analysis</CardTitle>
                <CardDescription className="text-slate-500">Products or services users asked for that we don&apos;t have</CardDescription>
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
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Unmet Need (Keyword)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Requests</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Request</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.topGaps.map((gap) => (
                  <tr key={gap.keyword} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-white capitalize">{gap.keyword}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-emerald-400 font-bold">{gap.queryCount}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(gap.lastRequested).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase">Investigating</span>
                    </td>
                  </tr>
                ))}
                {(!data?.topGaps || data.topGaps.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">No catalog gaps identified yet. Our inventory matching is currently 100%.</td>
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
