import { useLocation } from "react-router-dom";
import Nav from "./components/layout/Nav";
import { ThemeProvider } from "./context/Theme";
import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationProvider";
import { WishlistProvider } from "./context/WishlistContext";
import Toaster from "./components/admin/Toaster";
import CartDrawer from "./components/cart/CartDrawer";
import WishlistDrawer from "./components/products/WishlistDrawer";
import ScrollToTop from "./components/common/ScrollToTop";
import PWAInstallPrompt from "./components/common/PWAInstallPrompt";
import { UserChangePasswordModal } from "./components/auth/UserChangePasswordModal";
import { getSubdomain } from "@/utils/subdomain";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const location = useLocation();
  const subdomain = getSubdomain();

  // Hide Nav on admin subdomain OR admin routes (path-based fallback)
  const isAdmin =
    subdomain === "admin" || location.pathname.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
          focus:z-100 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground
          focus:rounded focus:shadow-lg"
      >
        Skip to main content
      </a>
      <ThemeProvider>
        <CartProvider>
          <AuthProvider>
            <NotificationProvider>
              <WishlistProvider>
                <Toaster />
                <ScrollToTop />
                {!isAdmin && <Nav />}
                {!isAdmin && <CartDrawer />}
                {!isAdmin && <WishlistDrawer />}
                {!isAdmin && <PWAInstallPrompt />}
                {!isAdmin && <UserChangePasswordModal />}
                <div id="main-content">
                  <AppRoutes />
                </div>
              </WishlistProvider>
            </NotificationProvider>
          </AuthProvider>
        </CartProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
