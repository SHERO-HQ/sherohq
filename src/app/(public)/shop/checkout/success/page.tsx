import type { Metadata } from "next";
import CheckoutSuccessClient from "./client";

export const metadata: Metadata = {
 title: "Order Confirmed",
 description: "Your SHERO order has been successfully placed.",
 robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

import { Suspense } from "react";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-secondary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-widest uppercase animate-pulse">
            Verifying Order...
          </p>
        </div>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  );
}
