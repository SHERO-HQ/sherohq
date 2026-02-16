import { useQuery } from "@tanstack/react-query";
import {
  getAdminStats,
  fetchActivityLogs,
  fetchRecentOrders,
  fetchAnalytics,
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
    placeholderData: (previousData: any) => previousData,
  });
};

export const useActivityLogs = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.activity(),
    queryFn: fetchActivityLogs,
    refetchInterval,
    placeholderData: (previousData: any) => previousData,
  });
};

export const useRecentOrders = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.recentOrders(),
    queryFn: () => fetchRecentOrders(),
    refetchInterval,
    placeholderData: (previousData: any) => previousData,
  });
};

export const useAnalytics = (period = "7d") => {
  return useQuery({
    queryKey: ADMIN_KEYS.analytics(period),
    queryFn: () => fetchAnalytics(period),
    placeholderData: (previousData: any) => previousData,
  });
};
