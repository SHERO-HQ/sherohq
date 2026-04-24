"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  adminLogin as apiLogin,
  adminLogout as apiLogout,
  getAdminMe,
  type AdminUser,
} from "@/services/api";
import { formatAuthError } from "@/utils/authErrors";

interface AdminContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustReset: boolean;
  requiresMFA: boolean;
  mfaToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  verifyMFA: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  setAdmin: (admin: AdminUser | null) => void;
  setMustReset: (mustReset: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { readonly children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [mustReset, setMustReset] = useState(false);
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage if available
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_sidebar_open");
      return saved === null ? true : saved === "true";
    }
    return true;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("admin_sidebar_open", isSidebarOpen.toString());
  }, [isSidebarOpen]);

  // Check for existing session on mount

  const checkAuth = useCallback(async () => {
    try {
      const { admin } = await getAdminMe();
      setAdmin(admin);
    } catch (err: any) {
      // ONLY logout if it's explicitly an authentication error (401)
      // We treat 403 as a potential CSRF or permission error that might be transient
      // Other errors (500, network fail) are ignored to allow the session to persist
      if (err.status === 401) {
        console.warn("🔐 Admin session expired, logging out.");
        localStorage.removeItem("adminToken");
        setAdmin(null);
      } else {
        const status = err.status || "Network/Server Error";
        console.error(`📡 Admin auth check failed (${status}), keeping session for retry.`, err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  async function login(username: string, password: string) {
    setRequiresMFA(false);
    setMfaToken(null);
    try {
      const response = await apiLogin(username, password);
      
      if (response.requiresMFA) {
        setRequiresMFA(true);
        setMfaToken(response.mfaToken || null);
        return;
      }

      if (response.token) {
        localStorage.setItem("adminToken", response.token);
      }
      setAdmin(response.admin || null);
      setMustReset(!!response.mustReset);
      setRequiresMFA(false);
      setMfaToken(null);
    } catch (error) {
      throw new Error(formatAuthError(error));
    }
  }

  async function verifyMFA(code: string) {
    if (!mfaToken) throw new Error("MFA session expired. Please login again.");
    
    try {
      const { loginWithMFA } = await import("@/services/admin");
      const response = await loginWithMFA(mfaToken, code);
      
      if (response.token) {
        localStorage.setItem("adminToken", response.token);
      }
      setAdmin(response.admin || null);
      setMustReset(!!response.mustReset);
      setRequiresMFA(false);
      setMfaToken(null);
    } catch (error) {
      throw new Error(formatAuthError(error));
    }
  }

  async function logout() {
    await apiLogout();
    setAdmin(null);
    setMustReset(false);
  }

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: !!admin,
      isLoading,
      mustReset,
      requiresMFA,
      mfaToken,
      login,
      verifyMFA,
      logout,
      setAdmin, // Expose setAdmin to allow direct state updates
      setMustReset,
      isSidebarOpen,
      setIsSidebarOpen,
    }),
    [admin, isLoading, mustReset, requiresMFA, mfaToken, isSidebarOpen],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
