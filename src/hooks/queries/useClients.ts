"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
  type ClientPartner,
} from "@/services/api";

export const CLIENT_KEYS = {
  all: ["clients"] as const,
  lists: () => [...CLIENT_KEYS.all, "list"] as const,
  list: (includeAll: boolean = false) =>
    [...CLIENT_KEYS.lists(), { includeAll }] as const,
};

export const useClients = (includeAll: boolean = false) => {
  return useQuery({
    queryKey: CLIENT_KEYS.list(includeAll),
    queryFn: () => fetchClients(includeAll),
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all, refetchType: "all" });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ClientPartner>;
    }) => updateClient(id, data),
    onSuccess: (updatedClient, variables) => {
      queryClient.setQueriesData<ClientPartner[]>(
        { queryKey: CLIENT_KEYS.all },
        (old) =>
          Array.isArray(old)
            ? old.map((item) =>
                item.id === variables.id ? { ...item, ...variables.data, ...updatedClient } : item
              )
            : old
      );
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all, refetchType: "all" });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: (_data, deletedId) => {
      // Immediately remove from query cache
      queryClient.setQueriesData<ClientPartner[]>(
        { queryKey: CLIENT_KEYS.all },
        (old) => (Array.isArray(old) ? old.filter((item) => item.id !== deletedId) : old)
      );
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all, refetchType: "all" });
    },
  });
};
