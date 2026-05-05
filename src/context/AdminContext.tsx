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
    } catch (err: unknown) {
      // ONLY logout if it's explicitly an authentication error (401)
      // We treat 403 as a potential CSRF or permission error that might be transient
      // Other errors (500, network fail) are ignored to allow the session to persist
      const status =
        typeof err === "object" && err !== null && "status" in err
          ? (err as { status?: number }).status
          : undefined;

      if (status === 401) {
        console.warn("🔐 Admin session expired, logging out.");
        setAdmin(null);
      } else {
        const statusLabel = status || "Network/Server Error";
        console.error(
          `📡 Admin auth check failed (${statusLabel}), keeping session for retry.`,
          err,
        );
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
      setAdmin,
      setMustReset,
      isSidebarOpen,
      setIsSidebarOpen,
    }),
    [
      admin,
      isLoading,
      mustReset,
      requiresMFA,
      mfaToken,
      isSidebarOpen,
      verifyMFA,
    ],
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
