"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductReviews,
  submitProductReview,
  fetchAdminReviews,
  deleteReview,
} from "@/services/api";

export const REVIEW_KEYS = {
  all: ["reviews"] as const,
  product: (productId: string) =>
    [...REVIEW_KEYS.all, "product", productId] as const,
  admin: () => [...REVIEW_KEYS.all, "admin"] as const,
};

export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: REVIEW_KEYS.product(productId),
    queryFn: () => getProductReviews(productId),
    enabled: !!productId,
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: { userName: string; rating: number; comment: string };
    }) => submitProductReview(productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: REVIEW_KEYS.product(variables.productId),
      });
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.admin() });
    },
  });
};

export const useAdminReviews = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: REVIEW_KEYS.admin(),
    queryFn: fetchAdminReviews,
    refetchInterval,
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.admin() });
      // We should also invalidate product reviews, but we don't know the productId effectively here
      // invalidate all reviews to be safe or refine API to return productId
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all });
    },
  });
};
