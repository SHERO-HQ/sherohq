"use client";

import React, { Suspense, useEffect } from "react";

import { usePathname } from "next/navigation";
import { useAdminUser } from "@/hooks/queries/useAdminQuery";
import { AdminProvider } from "@/context/AdminContext";
import AdminLayout from "@/components/admin/AdminLayout";

const routeTitleMap: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/admin": "Dashboard",
  "/admin/dashboard": "Dashboard",
  "/orders": "Orders",
  "/admin/orders": "Orders",
  "/products": "Products",
  "/admin/products": "Products",
  "/categories": "Product Categories",
  "/admin/categories": "Product Categories",
  "/expenses": "Expenses",
  "/admin/expenses": "Expenses",
  "/projects": "Projects",
  "/admin/projects": "Projects",
  "/checkout-crm": "Checkout CRM",
  "/admin/checkout-crm": "Checkout CRM",
  "/users": "Customers & Users",
  "/admin/users": "Customers & Users",
  "/support": "Support Tickets",
  "/admin/support": "Support Tickets",
  "/whatsapp": "WhatsApp CRM",
  "/admin/whatsapp": "WhatsApp CRM",
  "/newsletter": "Newsletter & Campaigns",
  "/admin/newsletter": "Newsletter & Campaigns",
  "/templates": "Templates",
  "/admin/templates": "Templates",
  "/reviews": "Reviews",
  "/admin/reviews": "Reviews",
  "/testimonials": "Testimonials & Feedback",
  "/admin/testimonials": "Testimonials & Feedback",
  "/clients": "Clients & Partners",
  "/admin/clients": "Clients & Partners",
  "/guides": "Guides",
  "/admin/guides": "Guides",
  "/careers": "Careers & Applications",
  "/admin/careers": "Careers & Applications",
  "/reports": "Analytics & Reports",
  "/admin/reports": "Analytics & Reports",
  "/ai-analytics": "AI Intelligence",
  "/admin/ai-analytics": "AI Intelligence",
  "/stats": "Site Stats",
  "/admin/stats": "Site Stats",
  "/team": "Team",
  "/admin/team": "Team",
  "/staff": "Staff & Roles",
  "/admin/staff": "Staff & Roles",
  "/profile": "Admin Profile",
  "/admin/profile": "Admin Profile",
  "/login": "Admin Login",
  "/admin/login": "Admin Login",
};

function AdminSplashLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-brand-secondary-500/10 blur-[120px] rounded-full animate-pulse" />

      <div className="relative">
        <div className="w-16 h-16 border-2 border-brand-secondary-500/20 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-brand-secondary-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-brand-secondary-500/10 rounded flex items-center justify-center animate-pulse">
            <img
              src="/assets/logo/shero.svg"
              alt="SHERO Logo"
              width={60}
              height={60}
              fetchPriority="high"
              decoding="async"
              className="h-8 w-auto"
              suppressHydrationWarning
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <h2 className="text-foreground font-bold tracking-widest text-xs uppercase opacity-50 animate-pulse">
          SHERO TECHNOLOGIES
        </h2>
        <div className="h-px w-24 bg-linear-to-r from-transparent via-brand-secondary-500/50 to-transparent" />
      </div>
    </div>
  );
}

function PageSectionLoading() {
  return (
    <div className="w-full h-96 flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-brand-secondary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: adminData, isLoading } = useAdminUser();
  const isAuthenticated = !!adminData?.admin;

  useEffect(() => {
    if (typeof document !== "undefined" && pathname) {
      const cleanPath = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
      const matchedTitle = routeTitleMap[cleanPath] || "Dashboard";
      document.title = `${matchedTitle} | SHERO Admin`;
    }
  }, [pathname]);

  const isLoginPage =
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/login" ||
    pathname.startsWith("/login/");

  // Full screen splash ONLY during initial boot before authentication status is known
  if (isLoading && !adminData && !isLoginPage) {
    return <AdminSplashLoading />;
  }

  return (
    <AdminProvider>
      <main id="main-content" className="min-h-screen">
        {isLoginPage || !isAuthenticated ? (
          children
        ) : (
          <AdminLayout>
            <Suspense fallback={<PageSectionLoading />}>
              {children}
            </Suspense>
          </AdminLayout>
        )}
      </main>
    </AdminProvider>
  );
}
