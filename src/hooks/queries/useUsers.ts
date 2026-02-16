import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCustomers,
  fetchCustomerDetails,
  deleteCustomer,
} from "@/services/api";

export const USER_KEYS = {
  all: ["customers"] as const,
  list: (params: { page: number; limit: number; search: string }) =>
    [...USER_KEYS.all, "list", params] as const,
  detail: (userId: string) => [...USER_KEYS.all, "detail", userId] as const,
};

export const useCustomers = (params: {
  page: number;
  limit: number;
  search: string;
}) => {
  return useQuery({
    queryKey: USER_KEYS.list(params),
    queryFn: () => fetchCustomers(params.page, params.limit, params.search),
    placeholderData: (previousData) => previousData,
  });
};

export const useCustomerDetails = (userId: string) => {
  return useQuery({
    queryKey: USER_KEYS.detail(userId),
    queryFn: () => fetchCustomerDetails(userId),
    enabled: !!userId,
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
};
