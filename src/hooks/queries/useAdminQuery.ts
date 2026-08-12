import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminLogin as apiLogin,
  adminLogout as apiLogout,
  getAdminMe,
} from "@/services/api";
import { useState, useEffect } from "react";
import { formatAuthError } from "@/utils/authErrors";
export { useAdmin } from "@/context/AdminContext";


export function useAdminSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_sidebar_open");
      return saved === null ? true : saved === "true";
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("admin_sidebar_open", isSidebarOpen.toString());
  }, [isSidebarOpen]);

  return { isSidebarOpen, setIsSidebarOpen };
}

export function useAdminUser() {
  return useQuery({
    queryKey: ["admin"],
    queryFn: async () => {
      try {
        const result = await getAdminMe();
        return result; // returns { admin }
      } catch (err: unknown) {
        const status =
          typeof err === "object" && err !== null && "status" in err
            ? (err as { status?: number }).status
            : undefined;

        if (status === 401) {
          return null;
        } else {
          throw err;
        }
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: true,
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: any) => {
      setRequiresMFA(false);
      setMfaToken(null);
      return apiLogin(username, password);
    },
    onSuccess: (response) => {
      if (response.requiresMFA) {
        setRequiresMFA(true);
        setMfaToken(response.mfaToken || null);
      } else {
        queryClient.setQueryData(["admin"], {
          admin: response.admin,
          mustReset: response.mustReset,
        });
      }
    },
    onError: (error) => {
      throw new Error(formatAuthError(error));
    },
  });

  const verifyMFAMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!mfaToken) throw new Error("MFA session expired. Please login again.");
      const { loginWithMFA } = await import("@/services/admin");
      return loginWithMFA(mfaToken, code);
    },
    onSuccess: (response) => {
      queryClient.setQueryData(["admin"], {
        admin: response.admin,
        mustReset: response.mustReset,
      });
      setRequiresMFA(false);
      setMfaToken(null);
    },
    onError: (error) => {
      throw new Error(formatAuthError(error));
    },
  });

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    verifyMFA: verifyMFAMutation.mutateAsync,
    isVerifyingMFA: verifyMFAMutation.isPending,
    requiresMFA,
    mfaToken,
  };
}

export function useAdminLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiLogout,
    onSettled: () => {
      queryClient.setQueryData(["admin"], null);
    },
  });
}
