"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getAdminStats,
  fetchActivityLogs,
  fetchRecentOrders,
  fetchAnalytics,
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
};

export const useAdminStats = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.stats(),
    queryFn: getAdminStats,
    refetchInterval,
    placeholderData: (previousData: AdminStats | undefined) => previousData,
  });
};

export const useActivityLogs = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.activity(),
    queryFn: fetchActivityLogs,
    refetchInterval,
    placeholderData: (previousData: ActivityLog[] | undefined) => previousData,
  });
};

export const useRecentOrders = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.recentOrders(),
    queryFn: () => fetchRecentOrders(),
    refetchInterval,
    placeholderData: (previousData: RecentOrder[] | undefined) => previousData,
  });
};

export const useAnalytics = (period = "7d", refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.analytics(period),
    queryFn: () => fetchAnalytics(period),
    refetchInterval,
    placeholderData: (previousData: AnalyticsData[] | undefined) =>
      previousData,
  });
};
