"use client";

import { Suspense } from "react";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";
import { usePathname } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdmin } from "@/context/AdminContext";

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
  const pathname = usePathname();
  const { isAuthenticated } = useAdmin();

  // Cover both path structures:
  //   - sherohq.com/admin/login  (main domain)
  //   - admin.sherohq.com/login  (admin subdomain)
  const isLoginPage =
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/login" ||
    pathname.startsWith("/login/");

  return (
    <Suspense fallback={<AdminLoading />}>
      <BreadcrumbProvider>
        {isLoginPage || !isAuthenticated ? (
          children
        ) : (
          <AdminLayout>
            {children}
          </AdminLayout>
        )}
      </BreadcrumbProvider>
    </Suspense>
  );
}
