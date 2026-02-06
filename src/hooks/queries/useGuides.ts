import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGuides,
  getGuideBySlug,
  getAdminGuides,
  createGuide,
  updateGuide,
  deleteGuide,
} from "@/services/guides";
import type { UpdateGuideInput } from "@/types/guide";

export const GUIDE_KEYS = {
  all: ["guides"] as const,
  public: () => [...GUIDE_KEYS.all, "public"] as const,
  admin: () => [...GUIDE_KEYS.all, "admin"] as const,
  list: (category?: string) => [...GUIDE_KEYS.public(), { category }] as const,
  slug: (slug: string) => [...GUIDE_KEYS.public(), "detail", slug] as const,
};

export const useGuides = (category?: "hardware" | "software") => {
  return useQuery({
    queryKey: GUIDE_KEYS.list(category),
    queryFn: () => getGuides(category),
  });
};

export const useGuide = (slug: string) => {
  return useQuery({
    queryKey: GUIDE_KEYS.slug(slug),
    queryFn: () => getGuideBySlug(slug),
    enabled: !!slug,
  });
};

export const useAdminGuides = () => {
  return useQuery({
    queryKey: GUIDE_KEYS.admin(),
    queryFn: getAdminGuides,
  });
};

export const useCreateGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGuide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUIDE_KEYS.all });
    },
  });
};

export const useUpdateGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGuideInput }) =>
      updateGuide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUIDE_KEYS.all });
    },
  });
};

export const useDeleteGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGuide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUIDE_KEYS.all });
    },
  });
};
