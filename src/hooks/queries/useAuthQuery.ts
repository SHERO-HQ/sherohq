import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  userLogin,
  userRegister,
  userLogout,
  getUserMe,
  updateUserProfile,
  userChangePassword,
} from "@/services/api";
import { formatAuthError } from "@/utils/authErrors";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const result = await getUserMe();
        return result; // returns { user, mustReset }
      } catch (_error) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: true,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userLogin,
    onSuccess: (response) => {
      if (!response.requiresMFA) {
        queryClient.setQueryData(["user"], {
          user: response.user,
          mustReset: response.mustReset,
        });
      }
    },
    onError: (error) => {
      throw new Error(formatAuthError(error));
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userRegister,
    onSuccess: (response) => {
      queryClient.setQueryData(["user"], {
        user: response.user,
        mustReset: false,
      });
    },
    onError: (error) => {
      throw new Error(formatAuthError(error));
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userLogout,
    onSettled: () => {
      queryClient.setQueryData(["user"], null);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (response) => {
      queryClient.setQueryData(["user"], (old: any) => {
        if (!old) return { user: response.user, mustReset: false };
        return { ...old, user: response.user };
      });
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ currentPassword, password }: any) => 
      userChangePassword(currentPassword, password),
    onSuccess: () => {
      queryClient.setQueryData(["user"], (old: any) => {
        if (!old) return old;
        return { ...old, mustReset: false };
      });
    },
  });
}
