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
  userLogin,
  userRegister,
  userLogout,
  getUserMe,
  updateUserProfile,
  userChangePassword,
  type User,
  type ShippingAddress,
} from "@/services/api";
import { formatAuthError } from "@/utils/authErrors";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustReset: boolean;
  login: (data: { email: string; password: string }) => Promise<any>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    shippingAddress?: ShippingAddress | null;
  }) => Promise<void>;
  changePassword: (currentPassword: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  setMustReset: (mustReset: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [mustReset, setMustReset] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    // Check if running on client side
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    try {
      const { user, mustReset: resetRequired } = await getUserMe();
      setUser(user);
      setMustReset(!!resetRequired);
    } catch {
      // Token invalid or expired
      localStorage.removeItem("userToken");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  async function login(data: { email: string; password: string }) {
    setIsLoading(true);
    try {
      const response = await userLogin(data);
      
      // If MFA is required, don't set user yet, just return the challenge
      if (response.requiresMFA) {
        setIsLoading(false);
        return response;
      }

      if (response.token) {
        localStorage.setItem("userToken", response.token);
      }
      setUser(response.user);
      setMustReset(!!response.mustReset);
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      throw new Error(formatAuthError(error));
    }
  }

  async function register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) {
    setIsLoading(true);
    try {
      const response = await userRegister(data);
      if (response.token) {
        localStorage.setItem("userToken", response.token);
      }
      setUser(response.user);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw new Error(formatAuthError(error));
    }
  }

  async function logout() {
    try {
      await userLogout();
    } finally {
      setUser(null);
      setMustReset(false);
      setIsLoading(false);
    }
  }

  async function updateProfile(data: {
    name?: string;
    phone?: string;
    shippingAddress?: ShippingAddress | null;
  }) {
    const response = await updateUserProfile(data);
    setUser(response.user);
  }

  async function changePassword(currentPassword: string, password: string) {
    await userChangePassword(currentPassword, password);
    setMustReset(false);
  }

  async function refreshUser() {
    try {
      const { user, mustReset: resetRequired } = await getUserMe();
      setUser(user);
      setMustReset(!!resetRequired);
    } catch {
      // Silent fail for refresh
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      mustReset,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      refreshUser,
      setMustReset,
    }),
    [user, isLoading, mustReset],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
