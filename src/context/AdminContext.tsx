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
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAdmin: (admin: AdminUser | null) => void;
  setMustReset: (mustReset: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { readonly children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [mustReset, setMustReset] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const { admin } = await getAdminMe();
      setAdmin(admin);
    } catch {
      // Token invalid or expired
      localStorage.removeItem("adminToken");
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  async function login(username: string, password: string) {
    setIsLoading(true);
    try {
      const response = await apiLogin(username, password);
      setAdmin(response.admin);
      setMustReset(!!response.mustReset);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
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
      login,
      logout,
      setAdmin, // Expose setAdmin to allow direct state updates
      setMustReset,
    }),
    [admin, isLoading, mustReset],
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
