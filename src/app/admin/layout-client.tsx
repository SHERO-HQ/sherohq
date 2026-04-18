"use client";

import React, { Suspense } from "react";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";
import { usePathname } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdmin } from "@/context/AdminContext";

function AdminLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-brand-secondary-500/10 blur-[120px] rounded-full animate-pulse" />

      <div className="relative">
        <div className="w-16 h-16 border-2 border-brand-secondary-500/20 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-brand-secondary-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-brand-secondary-500/10 rounded flex items-center justify-center animate-pulse">
            <span className="text-brand-secondary-500 font-bold text-xl">S</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <h2 className="text-white font-bold tracking-widest text-xs uppercase opacity-50 animate-pulse">
          SHERO Secure Admin
        </h2>
        <div className="h-px w-24 bg-linear-to-r from-transparent via-brand-secondary-500/50 to-transparent" />
      </div>
    </div>
  );
}

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAdmin();

  // Cover both path structures:
  //   - sherohq.com/admin/login  (main domain)
  //   - admin.sherohq.com/login  (admin subdomain)
  const isLoginPage =
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/login" ||
    pathname.startsWith("/login/");

  if (isLoading && !isLoginPage) {
    return <AdminLoading />;
  }

  return (
    <Suspense fallback={<AdminLoading />}>
      <BreadcrumbProvider>
        <main id="main-content" className="min-h-screen">
          {isLoginPage || !isAuthenticated ? (
            children
          ) : (
            <AdminLayout>{children}</AdminLayout>
          )}
        </main>
      </BreadcrumbProvider>
    </Suspense>
  );
}
