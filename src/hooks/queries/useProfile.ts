"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserMe, updateUserProfile } from "@/services/api";

export const PROFILE_KEYS = {
  all: ["profile"] as const,
  me: () => [...PROFILE_KEYS.all, "me"] as const,
};

export const useMe = (enabled: boolean = true) => {
  return useQuery({
    queryKey: PROFILE_KEYS.me(),
    queryFn: getUserMe,
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes for profile data
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.me() });
    },
  });
};
