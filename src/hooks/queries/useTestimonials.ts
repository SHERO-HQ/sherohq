"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTestimonials,
  fetchAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  syncTrustpilotTestimonials,
} from "@/services/api";
import type { Testimonial } from "@/types/testimonial";

export const TESTIMONIAL_KEYS = {
  all: ["testimonials"] as const,
  admin: () => [...TESTIMONIAL_KEYS.all, "admin"] as const,
};

export const useTestimonials = () => {
  return useQuery({
    queryKey: TESTIMONIAL_KEYS.all,
    queryFn: fetchTestimonials,
  });
};

export const useAdminTestimonials = () => {
  return useQuery({
    queryKey: TESTIMONIAL_KEYS.admin(),
    queryFn: fetchAdminTestimonials,
  });
};

export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TESTIMONIAL_KEYS.all });
    },
  });
};

export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Testimonial> }) =>
      updateTestimonial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TESTIMONIAL_KEYS.all });
    },
  });
};

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TESTIMONIAL_KEYS.all });
    },
  });
};

export const useSyncTrustpilotTestimonials = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (limit?: number) => syncTrustpilotTestimonials(limit ?? 20),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TESTIMONIAL_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TESTIMONIAL_KEYS.admin() });
    },
  });
};
