"use client";
import NavLink from "@/components/common/NavLink";
import Link from "next/link";
import React, { useState, useEffect, memo } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  User,
  Users,
  LogOut,
  Plus,
  Headset,
  BookOpen,
  ShieldCheck,
  Briefcase,
  Tag,
  Star,
  MessageSquareQuote,
  BarChart,
  FileText,
  DollarSign,
  Brain,
  Mail,
  Download,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ADMIN_KEYS } from "@/hooks/queries/useAdmin";
import {
  getAdminStats,
  fetchActivityLogs,
  fetchRecentOrders,
  fetchAnalytics,
} from "@/services/api";
import { motion, AnimatePresence } from "motion/react";
import AppImage from "@/components/common/AppImage";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

type WindowWithPwaPrompt = Window & {
  __pwaPromptEvent?: BeforeInstallPromptEvent | null;
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports" },
  { icon: Brain, label: "Intelligence", href: "/admin/ai-analytics" },
  { icon: DollarSign, label: "Expenses", href: "/admin/expenses" },
  { icon: Headset, label: "Support", href: "/admin/support" },
  { icon: BookOpen, label: "Guides", href: "/admin/guides" },
  { icon: Tag, label: "Categories", href: "/admin/categories" },
  { icon: Mail, label: "Newsletter", href: "/admin/newsletter" },
  { icon: Star, label: "Reviews", href: "/admin/reviews" },
  { icon: Users, label: "Team", href: "/admin/team" },
  { icon: ShieldCheck, label: "Staff", href: "/admin/staff" },
  { icon: Briefcase, label: "Projects", href: "/admin/projects" },
  {
    icon: MessageSquareQuote,
    label: "Testimonials",
    href: "/admin/testimonials",
  },
  { icon: BarChart, label: "Site Stats", href: "/admin/stats" },
  { icon: Users, label: "Customers", href: "/admin/users" },
  { icon: User, label: "Profile", href: "/admin/profile" },
];

const AdminSidebar = memo(({ isOpen, setIsOpen }: Readonly<SidebarProps>) => {
  const { admin, logout } = useAdmin();
  const [pwaPrompt, setPwaPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => {
      if (typeof window === "undefined") return null;

      const windowWithPwaPrompt = window as WindowWithPwaPrompt;
      const capturedPrompt = windowWithPwaPrompt.__pwaPromptEvent ?? null;
      if (capturedPrompt) {
        windowWithPwaPrompt.__pwaPromptEvent = null;
      }

      return capturedPrompt;
    },
  );

  useEffect(() => {
    // Check if app is already installed
    const navigatorWithStandalone = window.navigator as NavigatorWithStandalone;
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      navigatorWithStandalone.standalone === true;

    if (isInstalled) return;

    const handlePrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setPwaPrompt(promptEvent);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!pwaPrompt) return;
    try {
      await pwaPrompt.prompt();
      const { outcome } = await pwaPrompt.userChoice;
      if (outcome === "accepted") setPwaPrompt(null);
    } catch (err) {
      console.error("PWA Install failed", err);
    }
  };

  const queryClient = useQueryClient();

  const handlePrefetch = (href: string) => {
    if (href === "/admin/dashboard") {
      queryClient.prefetchQuery({
        queryKey: ADMIN_KEYS.stats(),
        queryFn: getAdminStats,
      });
      queryClient.prefetchQuery({
        queryKey: ADMIN_KEYS.analytics("today"),
        queryFn: () => fetchAnalytics("today"),
      });
      queryClient.prefetchQuery({
        queryKey: ADMIN_KEYS.recentOrders(),
        queryFn: () => fetchRecentOrders(),
      });
      queryClient.prefetchQuery({
        queryKey: ADMIN_KEYS.activity(),
        queryFn: fetchActivityLogs,
      });
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden "
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed top-0 left-0 h-full glass-surface backdrop-blur-md z-50 transition-all duration-200 ease-in-out shadow",
          isOpen
            ? "w-64 translate-x-0"
            : "w-20 -translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full relative">
          {/* Logo Section */}
          <Link
            href="/admin/dashboard"
            className={cn(
              "h-20 flex items-center shrink-0 hover:bg-white/5 transition-colors group border-b border-white/5",
              isOpen ? "px-6" : "px-0 justify-center",
            )}
          >
            <div
              className={cn(
                "flex items-center transition-all duration-200",
                isOpen ? "gap-3" : "gap-0",
              )}
            >
              <div className="flex items-center justify-center shrink-0 shadow shadow-brand-secondary-500/10 group-hover:scale-110 transition-transform">
                <img
                  src="/assets/logo/shero.svg"
                  alt="SHERO Logo"
                  width={30}
                  height={30}
                  fetchPriority="high"
                  decoding="async"
                  className="h-8 w-auto"
                  suppressHydrationWarning
                />
              </div>
              <span
                className={cn(
                  "text-white font-bold text-sm whitespace-nowrap transition-all duration-200",
                  isOpen
                    ? "opacity-100 translate-x-0 w-auto"
                    : "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden",
                )}
              >
                SHERO TECHNOLOGIES
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
            {navItems
              .filter((item) => {
                const isAdminOrSuper =
                  admin?.role === "superadmin" || admin?.role === "admin";
                const isManagerOrHigher =
                  isAdminOrSuper || admin?.role === "manager";

                if (item.label === "Staff" || item.label === "Team") {
                  return isAdminOrSuper;
                }
                if (item.label === "Reports" || item.label === "Customers") {
                  return isManagerOrHigher;
                }
                return true;
              })
              .map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => handlePrefetch(item.href)}
                  onClick={() => {
                    if (globalThis.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-3 rounded group relative transition-all duration-200",
                      isOpen ? "gap-3" : "gap-0",
                      isActive
                        ? "bg-brand-secondary-500/10 text-brand-secondary-400 border border-brand-secondary-500/20 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent",
                      !isOpen && "justify-center px-0",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={cn(
                          "w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                          isActive
                            ? "text-brand-secondary-400"
                            : "text-slate-400 group-hover:text-white",
                        )}
                      />
                      <span
                        className={cn(
                          "font-medium text-sm whitespace-nowrap transition-all duration-200",
                          isOpen
                            ? "opacity-100 translate-x-0 w-auto"
                            : "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden",
                        )}
                      >
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute left-0 w-1 h-6 bg-brand-secondary-500 rounded-r-full"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}

            {/* Quick Actions Section */}
            <div className="mt-8 pt-8 border-t border-white/5 space-y-4 px-2">
              <p
                className={cn(
                  "text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 transition-all duration-200",
                  isOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4 pointer-events-none",
                )}
              >
                Quick Actions
              </p>
              <div className="space-y-1">
                <NavLink
                  href="/admin/products/new"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded transition-all duration-200 group relative",
                      isOpen ? "gap-2" : "gap-0 justify-center px-0",
                      isActive
                        ? "bg-brand-secondary-500/10 text-brand-secondary-400"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                    )
                  }
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span
                    className={cn(
                      "text-xs font-medium transition-all duration-200",
                      isOpen
                        ? "opacity-100 translate-x-0 w-auto"
                        : "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden",
                    )}
                  >
                    New Product
                  </span>
                </NavLink>
                <NavLink
                  href="/admin/orders?status=pending"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded transition-all duration-200 group relative",
                      isOpen ? "gap-2" : "gap-0 justify-center px-0",
                      isActive
                        ? "bg-amber-500/10 text-amber-400"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                    )
                  }
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  <span
                    className={cn(
                      "text-xs font-medium transition-all duration-200",
                      isOpen
                        ? "opacity-100 translate-x-0 w-auto"
                        : "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden",
                    )}
                  >
                    Review Orders
                  </span>
                </NavLink>
                <NavLink
                  href="/admin/orders/new"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded transition-all duration-200 group relative",
                      isOpen ? "gap-2" : "gap-0 justify-center px-0",
                      isActive
                        ? "bg-blue-500/10 text-blue-400"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                    )
                  }
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span
                    className={cn(
                      "text-xs font-medium transition-all duration-200",
                      isOpen
                        ? "opacity-100 translate-x-0 w-auto"
                        : "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden",
                    )}
                  >
                    Create Invoice
                  </span>
                </NavLink>
                <NavLink
                  href="/admin/expenses?action=new"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded transition-all duration-200 group relative",
                      isOpen ? "gap-2" : "gap-0 justify-center px-0",
                      isActive
                        ? "bg-rose-500/10 text-rose-400"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                    )
                  }
                >
                  <DollarSign className="w-4 h-4 shrink-0" />
                  <span
                    className={cn(
                      "text-xs font-medium transition-all duration-200",
                      isOpen
                        ? "opacity-100 translate-x-0 w-auto"
                        : "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden",
                    )}
                  >
                    New Expense
                  </span>
                </NavLink>
              </div>
            </div>
          </nav>

          {/* User & Settings */}
          <div className="p-3 border-t border-white/5 space-y-2 shrink-0">
            {pwaPrompt && (
              <button
                onClick={() => void handleInstallClick()}
                className={cn(
                  "w-full flex items-center px-3 py-3 rounded text-brand-secondary-400 hover:bg-brand-secondary-500/10 transition-all duration-200 group border border-brand-secondary-500/20 mb-2",
                  isOpen ? "gap-3" : "gap-0 justify-center px-0",
                )}
                title="Install app for offline access"
              >
                <Download className="w-5 h-5 shrink-0" />
                <span
                  className={cn(
                    "font-bold text-sm whitespace-nowrap transition-all duration-200",
                    isOpen
                      ? "opacity-100 translate-x-0 w-auto"
                      : "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden",
                  )}
                >
                  Install Desktop App
                </span>
              </button>
            )}

            <button
              onClick={() => logout()}
              className={cn(
                "w-full flex items-center px-3 py-3 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 group",
                isOpen ? "gap-3" : "gap-0 justify-center px-0",
              )}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span
                className={cn(
                  "font-medium text-sm whitespace-nowrap transition-all duration-200",
                  isOpen
                    ? "opacity-100 translate-x-0 w-auto"
                    : "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden",
                )}
              >
                Logout
              </span>
            </button>

            {/* Profile Summary */}
            <div
              className={cn(
                "flex items-center px-3 py-2  border border-white/10 mt-4 rounded transition-all duration-200",
                isOpen ? "gap-3" : "gap-0 justify-center px-0",
              )}
            >
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden border-r border-white/10 p-1">
                {admin?.avatar ? (
                  <AppImage
                    src={admin.avatar}
                    alt={admin.username}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div
                className={cn(
                  "flex-1 min-w-0 transition-all duration-200",
                  isOpen
                    ? "opacity-100 translate-x-0 w-auto"
                    : "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden",
                )}
              >
                <p className="text-sm font-semibold text-white truncate">
                  {admin?.username.toUpperCase() || "Admin"}
                </p>
                <p className="text-[10px] text-slate-500 truncate capitalize font-medium">
                  {admin?.role || "Administrator"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
});

export default AdminSidebar;
