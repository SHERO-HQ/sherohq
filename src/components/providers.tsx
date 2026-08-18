"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig, LazyMotion } from "motion/react";
import { ThemeProvider } from "@/context/Theme";
import { AdminProvider } from "@/context/AdminContext";

import { SheroToaster } from "@/components/ui/SheroToaster";

import { DialogProvider } from "@/components/ui/DialogProvider";

import ScrollToTop from "@/components/common/ScrollToTop";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useState } from "react";
import dynamic from "next/dynamic";

const AIChatAssistant = dynamic(() => import("@/components/ai/AIChatAssistant"), {
  ssr: false,
});

const loadFeatures = () => import("motion/react").then((res) => res.domMax);

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
   <MotionConfig reducedMotion="user">
    <LazyMotion features={loadFeatures} strict>
    <ThemeProvider>
      <AdminProvider>
        <DialogProvider>
         <SheroToaster />
         <ScrollToTop />
         <ErrorBoundary>{children}</ErrorBoundary>
         <AIChatAssistant />
        </DialogProvider>
      </AdminProvider>
    </ThemeProvider>
    </LazyMotion>
   </MotionConfig>
   {process.env.NODE_ENV === "development" && (
    <ReactQueryDevtools initialIsOpen={false} />
   )}
  </QueryClientProvider>
 );
}
