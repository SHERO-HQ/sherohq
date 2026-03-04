"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchStats, createStat, updateStat, deleteStat } from "@/services/api";
import type { SiteStat } from "@/types/stat";

export const STAT_KEYS = {
  all: ["site-stats"] as const,
};

export const useStats = () => {
  return useQuery({
    queryKey: STAT_KEYS.all,
    queryFn: fetchStats,
  });
};

export const useCreateStat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAT_KEYS.all });
    },
  });
};

export const useUpdateStat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SiteStat> }) =>
      updateStat(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAT_KEYS.all });
    },
  });
};

export const useDeleteStat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAT_KEYS.all });
    },
  });
};
