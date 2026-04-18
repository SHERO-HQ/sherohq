"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getAdminStats,
  fetchActivityLogs,
  fetchRecentOrders,
  fetchAnalytics,
  fetchAIAnalyticsSummary,
  type AdminStats,
  type ActivityLog,
  type RecentOrder,
  type AnalyticsData,
} from "@/services/api";

export const ADMIN_KEYS = {
  all: ["admin"] as const,
  stats: () => [...ADMIN_KEYS.all, "stats"] as const,
  activity: () => [...ADMIN_KEYS.all, "activity"] as const,
  recentOrders: () => [...ADMIN_KEYS.all, "recent-orders"] as const,
  analytics: (period: string) =>
    [...ADMIN_KEYS.all, "analytics", period] as const,
  aiAnalytics: () => [...ADMIN_KEYS.all, "ai-analytics"] as const,
};

export const useAdminStats = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.stats(),
    queryFn: getAdminStats,
    refetchInterval,
    staleTime: 30000, // 30s fresh
    placeholderData: (previousData: AdminStats | undefined) => previousData,
  });
};

export const useActivityLogs = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.activity(),
    queryFn: fetchActivityLogs,
    refetchInterval,
    staleTime: 30000, // 30s fresh for logs
    placeholderData: (previousData: ActivityLog[] | undefined) => previousData,
  });
};

export const useRecentOrders = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.recentOrders(),
    queryFn: () => fetchRecentOrders(),
    refetchInterval,
    staleTime: 15000, // 15s fresh
    placeholderData: (previousData: RecentOrder[] | undefined) => previousData,
  });
};

export const useAnalytics = (period = "7d", refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.analytics(period),
    queryFn: () => fetchAnalytics(period),
    refetchInterval,
    staleTime: 60000, // 1m fresh for analytics graphs
    placeholderData: (previousData: AnalyticsData[] | undefined) =>
      previousData,
  });
};

export const useAIAnalyticsSummary = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.aiAnalytics(),
    queryFn: fetchAIAnalyticsSummary,
    refetchInterval,
  });
};
