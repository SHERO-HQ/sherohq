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
  type User,
  type ShippingAddress,
} from "@/services/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const initialToken = localStorage.getItem("userToken");
    try {
      if (!initialToken) {
        setIsLoading(false);
        return;
      }

      const { user } = await getUserMe();
      setUser(user);
    } catch (error) {
      console.warn("Check auth failed:", error);
      // Only clear if the token hasn't changed since we started (prevents clearing if we just logged in)
      if (localStorage.getItem("userToken") === initialToken) {
        localStorage.removeItem("userToken");
        setUser(null);
      }
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
      setUser(response.user);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
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
      setUser(response.user);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }

  async function logout() {
    try {
      await userLogout();
    } finally {
      setUser(null);
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

  async function refreshUser() {
    try {
      const { user } = await getUserMe();
      setUser(user);
    } catch {
      // Silent fail for refresh
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
    }),
    [user, isLoading],
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
