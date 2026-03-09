"use client";

import { Suspense } from "react";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";
import { AdminProvider } from "@/context/AdminContext";

function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 bg-slate-50">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <BreadcrumbProvider>
        <AdminProvider>{children}</AdminProvider>
      </BreadcrumbProvider>
    </Suspense>
  );
}
