"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/context/Theme";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationProvider";
import { WishlistProvider } from "@/context/WishlistContext";
import Toaster from "@/components/admin/Toaster";
import ScrollToTop from "@/components/common/ScrollToTop";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CartProvider>
          <AuthProvider>
            <NotificationProvider>
              <WishlistProvider>
                <Toaster />
                <ScrollToTop />
                <ErrorBoundary>{children}</ErrorBoundary>
              </WishlistProvider>
            </NotificationProvider>
          </AuthProvider>
        </CartProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
