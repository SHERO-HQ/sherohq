"use client";

import { useMemo } from "react";
import { useAIAnalyticsSummary } from "@/hooks/queries/useAdmin";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import { Brain } from "lucide-react";
import { type AIAnalyticsTotals } from "@/services/api";
import { AIAnalyticsStatsGrid } from "@/components/admin/analytics/AIAnalyticsStatsGrid";
import { AIAnalyticsCharts } from "@/components/admin/analytics/AIAnalyticsCharts";
import { AIAnalyticsGapTable } from "@/components/admin/analytics/AIAnalyticsGapTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const EMPTY_TOTALS: AIAnalyticsTotals = {
  totalInteractions: 0,
  imageInteractions: 0,
  failedRecommendations: 0,
  openGapRequests: 0,
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
        <div
          key={i}
          className="bg-card border border-border p-6 space-y-4 rounded"
        >
          <div className="flex justify-between items-center">
            <div className="h-4 w-28 bg-accent/50 rounded" />
            <div className="h-6 w-6 bg-accent/50 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-8 w-24 bg-accent rounded" />
            <div className="h-3 w-32 bg-accent/50 rounded" />
          </div>
        </div>
      ))}
    </div>

    {/* Charts Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {new Array(4).fill(0).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border p-6 space-y-6 rounded"
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
        </div>
      ))}
    </div>
  </div>
);

export default function AIAnalytics() {
  const { data: result, isLoading: loading } = useAIAnalyticsSummary(
    ADMIN_POLLING_INTERVAL,
  );
  const data = result?.success ? result.data : null;

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

  if (loading) {
    return <AIAnalyticsSkeleton />;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={Brain}
        title="AI Intelligence Hub"
        description="Real-time insights into user queries, intent patterns, and catalog gaps."
      />

      {/* Stats Summary */}
      <AIAnalyticsStatsGrid
        totalInteractions={totalInteractions}
        avgDailyVolume={avgDailyVolume}
        imageUsageRate={imageUsageRate}
        resolutionRate={resolutionRate}
      />

      {/* Charts Grid */}
      <AIAnalyticsCharts
        dailyVolumeData={dailyVolumeData}
        trendDelta={trendDelta}
        intentData={intentData}
        gapPressureData={gapPressureData}
        openGapRequests={totals.openGapRequests}
      />

      {/* Catalog Gaps Table */}
      <AIAnalyticsGapTable topGaps={data?.topGaps} />
    </div>
  );
}
