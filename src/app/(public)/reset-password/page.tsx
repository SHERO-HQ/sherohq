import { Metadata } from "next";
import ResetPassword from "@/views/auth/ResetPassword";

export const metadata: Metadata = {
  title: "Reset Password | SHERO",
  description: "Set a new password for your SHERO account.",
};

import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-secondary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-widest uppercase animate-pulse">
            Loading Reset Panel...
          </p>
        </div>
      }
    >
      <ResetPassword />
    </Suspense>
  );
}
