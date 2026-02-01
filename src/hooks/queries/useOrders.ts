import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchGuestOrders,
  getUserOrders,
  fetchAllOrders,
  updateOrderStatus,
} from "@/services/api";

export const ORDER_KEYS = {
  all: ["orders"] as const,
  guest: (guestId: string) => [...ORDER_KEYS.all, "guest", guestId] as const,
  user: (userId: string) => [...ORDER_KEYS.all, "user", userId] as const,
  admin: (filters: { status?: string; start?: string; end?: string }) =>
    [...ORDER_KEYS.all, "admin", filters] as const,
};

export const useGuestOrders = (guestId: string) => {
  return useQuery({
    queryKey: ORDER_KEYS.guest(guestId),
    queryFn: () => fetchGuestOrders(guestId),
    enabled: !!guestId,
  });
};

export const useUserOrders = (userId: string) => {
  return useQuery({
    queryKey: ORDER_KEYS.user(userId),
    queryFn: () => getUserOrders(userId),
    enabled: !!userId,
  });
};

export const useAdminOrdersQuery = (filters: {
  status?: string;
  start?: string;
  end?: string;
}) => {
  return useQuery({
    queryKey: ORDER_KEYS.admin(filters),
    queryFn: () => fetchAllOrders(filters.status, filters.start, filters.end),
    placeholderData: (previousData) => previousData,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      // Invalidate all admin order lists to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
    },
  });
};
