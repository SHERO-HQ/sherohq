"use client";

import { Suspense } from "react";
import DynamicPaymentPortal from "./client";

export default function DirectPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-brand-secondary-500/20 border-t-brand-secondary-500 rounded-full animate-spin" />
          </div>
          <p className="text-slate-500 font-medium animate-pulse">
            Loading secure payment gateway...
          </p>
        </div>
      }
    >
      <DynamicPaymentPortal />
    </Suspense>
  );
}
