"use client";

import React, { createContext, useContext, useMemo } from "react";
import {
  useAdminUser,
  useAdminLogin,
  useAdminLogout,
  useAdminSidebar,
} from "@/hooks/queries/useAdminQuery";

export interface AdminContextType {
  admin: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustReset: boolean;
  requiresMFA: boolean;
  mfaToken: string | null;
  login: ReturnType<typeof useAdminLogin>["login"];
  verifyMFA: ReturnType<typeof useAdminLogin>["verifyMFA"];
  logout: ReturnType<typeof useAdminLogout>["mutateAsync"];
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { data: adminData, isLoading } = useAdminUser();
  const { login, verifyMFA, requiresMFA, mfaToken } = useAdminLogin();
  const { mutateAsync: logout } = useAdminLogout();
  const { isSidebarOpen, setIsSidebarOpen } = useAdminSidebar();

  const admin = adminData?.admin || null;
  const mustReset = !!(adminData as any)?.mustReset;
  const isAuthenticated = !!admin;

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated,
      isLoading,
      mustReset,
      requiresMFA,
      mfaToken,
      login,
      verifyMFA,
      logout,
      isSidebarOpen,
      setIsSidebarOpen,
    }),
    [
      admin,
      isAuthenticated,
      isLoading,
      mustReset,
      requiresMFA,
      mfaToken,
      login,
      verifyMFA,
      logout,
      isSidebarOpen,
      setIsSidebarOpen,
    ],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  const adminUserQuery = useAdminUser();
  const adminLoginHooks = useAdminLogin();
  const adminLogoutMutation = useAdminLogout();
  const sidebarState = useAdminSidebar();

  if (context) {
    return context;
  }

  // Fallback state if used outside of AdminProvider
  const admin = adminUserQuery.data?.admin || null;
  const mustReset = !!(adminUserQuery.data as any)?.mustReset;

  return {
    admin,
    isAuthenticated: !!admin,
    isLoading: adminUserQuery.isLoading,
    mustReset,
    requiresMFA: adminLoginHooks.requiresMFA,
    mfaToken: adminLoginHooks.mfaToken,
    login: adminLoginHooks.login,
    verifyMFA: adminLoginHooks.verifyMFA,
    logout: adminLogoutMutation.mutateAsync,
    isSidebarOpen: sidebarState.isSidebarOpen,
    setIsSidebarOpen: sidebarState.setIsSidebarOpen,
  };
}
