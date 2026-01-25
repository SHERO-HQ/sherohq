import {
  createContext,
  useContext,
  useState,
  useEffect,
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
    shippingAddress?: ShippingAddress;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const { user } = await getUserMe();
      setUser(user);
    } catch {
      localStorage.removeItem("userToken");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(data: { email: string; password: string }) {
    const response = await userLogin(data);
    setUser(response.user);
  }

  async function register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) {
    const response = await userRegister(data);
    setUser(response.user);
  }

  async function logout() {
    await userLogout();
    setUser(null);
  }

  async function updateProfile(data: {
    name?: string;
    phone?: string;
    shippingAddress?: ShippingAddress;
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
