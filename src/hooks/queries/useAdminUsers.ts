import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminUsers,
  registerAdminUser,
  updateAdminUserRole,
  deleteAdminUser,
  updateAdminProfile,
} from "@/services/api";

export const ADMIN_USERS_KEYS = {
  all: ["adminUsers"] as const,
  details: (id: string) => ["adminUsers", id] as const,
  me: ["adminMe"] as const,
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ADMIN_USERS_KEYS.all,
    queryFn: fetchAdminUsers,
  });
};

export const useRegisterAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEYS.all });
    },
  });
};

export const useUpdateAdminUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      updateAdminUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEYS.all });
    },
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEYS.all });
    },
  });
};

export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEYS.me });
    },
  });
};
