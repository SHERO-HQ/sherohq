"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getAdminStats,
  fetchActivityLogs,
  fetchDashboardStats,
  fetchAnalytics,
  fetchTopProducts,
  fetchStockDistribution,
  fetchOrderStatusDistribution,
  fetchRecentOrders,
  fetchRegionalReport,
  fetchAIAnalyticsSummary,
  type AdminStats,
  type ActivityLog,
  type RecentOrder,
  type AnalyticsData,
  type TopProduct,
  type StockDistribution,
  type OrderStatusDistribution,
  type RegionalData,
} from "@/services/api";

export const ADMIN_KEYS = {
  all: ["admin"] as const,
  stats: () => [...ADMIN_KEYS.all, "stats"] as const,
  activity: () => [...ADMIN_KEYS.all, "activity"] as const,
  recentOrders: () => [...ADMIN_KEYS.all, "recent-orders"] as const,
  analytics: (period: string) =>
    [...ADMIN_KEYS.all, "analytics", period] as const,
  aiAnalytics: () => [...ADMIN_KEYS.all, "ai-analytics"] as const,
  dashboardStats: (start?: string, end?: string) => [...ADMIN_KEYS.all, "dashboard-stats", start, end] as const,
  topProducts: (start?: string, end?: string) => [...ADMIN_KEYS.all, "top-products", start, end] as const,
  stockDistribution: () => [...ADMIN_KEYS.all, "stock-distribution"] as const,
  orderStatusDistribution: (start?: string, end?: string) => [...ADMIN_KEYS.all, "order-status-distribution", start, end] as const,
  regionalReport: (start?: string, end?: string) => [...ADMIN_KEYS.all, "regional-report", start, end] as const,
  whatsappSupport: () => [...ADMIN_KEYS.all, "whatsapp-support"] as const,
  whatsappRetries: () => [...ADMIN_KEYS.all, "whatsapp-retries"] as const,
  whatsappAnalytics: () => [...ADMIN_KEYS.all, "whatsapp-analytics"] as const,
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

export const useAnalytics = (period = "7d", startDate?: string, endDate?: string, refetchInterval?: number | false) => {
  return useQuery({
    queryKey: [...ADMIN_KEYS.analytics(period), startDate, endDate],
    queryFn: () => fetchAnalytics(period, startDate, endDate),
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

export const useDashboardStats = (start?: string, end?: string, refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.dashboardStats(start, end),
    queryFn: () => fetchDashboardStats(start, end),
    refetchInterval,
    staleTime: 30000,
  });
};

export const useTopProducts = (start?: string, end?: string, refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.topProducts(start, end),
    queryFn: () => fetchTopProducts(start, end),
    refetchInterval,
    staleTime: 30000,
  });
};

export const useStockDistribution = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.stockDistribution(),
    queryFn: fetchStockDistribution,
    refetchInterval,
    staleTime: 30000,
  });
};

export const useOrderStatusDistribution = (start?: string, end?: string, refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.orderStatusDistribution(start, end),
    queryFn: () => fetchOrderStatusDistribution(start, end),
    refetchInterval,
    staleTime: 30000,
  });
};

export const useRegionalReport = (start?: string, end?: string, refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.regionalReport(start, end),
    queryFn: () => fetchRegionalReport(start, end),
    refetchInterval,
    staleTime: 30000,
  });
};

// WhatsApp specific hooks
export const useWhatsAppSupportTickets = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.whatsappSupport(),
    queryFn: async () => {
      const res = await fetch("/api/admin/whatsapp/support");
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.tickets;
    },
    refetchInterval,
    enabled: refetchInterval !== false,
  });
};

export const useWhatsAppRetries = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.whatsappRetries(),
    queryFn: async () => {
      const res = await fetch("/api/admin/whatsapp/retries");
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.retries;
    },
    refetchInterval,
    enabled: refetchInterval !== false,
  });
};

export const useWhatsAppAnalytics = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: ADMIN_KEYS.whatsappAnalytics(),
    queryFn: async () => {
      const res = await fetch("/api/admin/whatsapp/analytics");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch analytics");
      return data;
    },
    refetchInterval,
    enabled: refetchInterval !== false,
  });
};
