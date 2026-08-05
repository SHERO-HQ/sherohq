"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminFeedback, deleteFeedback, promoteFeedback } from "@/services/api";

export const FEEDBACK_KEYS = {
  all: ["feedback"] as const,
  admin: () => [...FEEDBACK_KEYS.all, "admin"] as const,
};

export const useAdminFeedback = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: FEEDBACK_KEYS.admin(),
    queryFn: fetchAdminFeedback,
    refetchInterval,
  });
};

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEEDBACK_KEYS.admin() });
    },
  });
};

export const usePromoteFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: promoteFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEEDBACK_KEYS.admin() });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
};
