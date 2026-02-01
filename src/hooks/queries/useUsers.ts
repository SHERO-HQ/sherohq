import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminUsers,
  fetchAdminUserDetails,
  deleteAdminUser,
} from "@/services/api";

export const USER_KEYS = {
  all: ["admin-users"] as const,
  list: (params: { page: number; limit: number; search: string }) =>
    [...USER_KEYS.all, "list", params] as const,
  detail: (userId: string) => [...USER_KEYS.all, "detail", userId] as const,
};

export const useAdminUsers = (params: {
  page: number;
  limit: number;
  search: string;
}) => {
  return useQuery({
    queryKey: USER_KEYS.list(params),
    queryFn: () => fetchAdminUsers(params.page, params.limit, params.search),
    placeholderData: (previousData) => previousData,
  });
};

export const useAdminUserDetails = (userId: string) => {
  return useQuery({
    queryKey: USER_KEYS.detail(userId),
    queryFn: () => fetchAdminUserDetails(userId),
    enabled: !!userId,
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
};
