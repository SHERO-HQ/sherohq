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
  Briefcase,
  Tag,
  Star,
  MessageSquareQuote,
  BarChart,
  FileText,
  DollarSign,
  Brain,
  Download,
  Megaphone,
  MessageSquare,
  BriefcaseBusiness,
  ShieldCheck,
  ChevronDown,
  MessageCircle
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ADMIN_KEYS } from "@/hooks/queries/useAdmin";
import {
  getAdminStats,
  fetchActivityLogs,
  fetchRecentOrders,
  fetchAnalytics} from "@/services/api";
import { m, AnimatePresence } from "motion/react";
import AppImage from "@/components/common/AppImage";
import { useSupportTickets } from "@/hooks/queries/useSupport";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";

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

type NavItem = {
  icon: React.ElementType;
  label: string;
  href: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
      { icon: User, label: "Profile", href: "/admin/profile" },
    ],
  },
  {
    title: "Commerce",
    items: [
      { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
      { icon: Package, label: "Products", href: "/admin/products" },
      { icon: Tag, label: "Categories", href: "/admin/categories" },
      { icon: DollarSign, label: "Expenses", href: "/admin/expenses" },
      { icon: Briefcase, label: "Projects", href: "/admin/projects" },
    ],
  },
  {
    title: "CRM & Engagement",
    items: [
      { icon: Users, label: "Customers", href: "/admin/users" },
      { icon: Headset, label: "Support", href: "/admin/support" },
      { icon: MessageCircle, label: "WhatsApp", href: "/admin/whatsapp" },
      { icon: Megaphone, label: "Campaigns", href: "/admin/newsletter" },
    ],
  },
  {
    title: "Feedback & Trust",
    items: [
      { icon: Star, label: "Reviews", href: "/admin/reviews" },
      { icon: MessageSquareQuote, label: "Testimonials & Feedback", href: "/admin/testimonials" },
    ],
  },
  {
    title: "Content & Resources",
    items: [
      { icon: BookOpen, label: "Guides", href: "/admin/guides" },
      { icon: BriefcaseBusiness, label: "Careers", href: "/admin/careers" },
    ],
  },
  {
    title: "Analytics & Intelligence",
    items: [
      { icon: BarChart3, label: "Reports", href: "/admin/reports" },
      { icon: Brain, label: "Intelligence", href: "/admin/ai-analytics" },
      { icon: BarChart, label: "Site Stats", href: "/admin/stats" },
    ],
  },
  {
    title: "Administration",
    items: [
      { icon: Users, label: "Team", href: "/admin/team" },
      { icon: ShieldCheck, label: "Staff", href: "/admin/staff" },
    ],
  },
];

const AdminSidebar = memo(({ isOpen, setIsOpen }: Readonly<SidebarProps>) => {
  const { admin, logout } = useAdmin();
  
  const { data: tickets } = useSupportTickets(ADMIN_POLLING_INTERVAL);
  const unresolvedSupportCount = tickets?.filter((t: any) => t.status?.toLowerCase() === "open" || t.status?.toLowerCase() === "pending").length || 0;

  const badges: Record<string, number | undefined> = {
    "Support": unresolvedSupportCount > 0 ? unresolvedSupportCount : undefined,
  };

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

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Overview": true,
    "Commerce": true,
  });

  const toggleGroup = (title: string) => {
    if (!isOpen) {
      setIsOpen(true);
      setExpandedGroups((prev) => ({ ...prev, [title]: true }));
      return;
    }
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

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
        queryFn: getAdminStats});
      queryClient.prefetchQuery({
        queryKey: ADMIN_KEYS.analytics("today"),
        queryFn: () => fetchAnalytics("today")});
      queryClient.prefetchQuery({
        queryKey: ADMIN_KEYS.recentOrders(),
        queryFn: () => fetchRecentOrders()});
      queryClient.prefetchQuery({
        queryKey: ADMIN_KEYS.activity(),
        queryFn: fetchActivityLogs});
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <m.div
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
          "fixed top-0 left-0 h-full glass-surface z-50 transition-all duration-200 ease-in-out shadow",
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
              "h-20 flex items-center shrink-0 hover:bg-accent transition-colors group border-b border-border",
              isOpen ? "px-6" : "px-0 justify-center",
            )}
          >
            <div
              className={cn(
                "flex items-center transition-all duration-200",
                isOpen ? "gap-3" : "gap-0",
              )}
            >
              <div className="flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
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
                  "text-foreground font-bold text-sm whitespace-nowrap transition-all duration-200",
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
          <nav className="flex-1 py-6 space-y-4 overflow-y-auto custom-scrollbar">
            {navGroups.map((group) => {
              const isAdminOrSuper =
                admin?.role === "superadmin" || admin?.role === "admin";
              const isManagerOrHigher =
                isAdminOrSuper || admin?.role === "manager";

              // Filter items based on RBAC
              const filteredItems = group.items.filter((item) => {
                if (item.label === "Staff" || item.label === "Team") {
                  return isAdminOrSuper;
                }
                if (item.label === "Reports" || item.label === "Customers") {
                  return isManagerOrHigher;
                }
                return true;
              });

              if (filteredItems.length === 0) return null;

              const isExpanded = expandedGroups[group.title] || false;

              return (
                <div key={group.title} className="px-3">
                  {isOpen ? (
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className="w-full flex items-center justify-between px-3 py-2 text-[0.6rem] font-semibold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors group mb-1"
                    >
                      <span>{group.title}</span>
                      <ChevronDown
                        className={cn(
                          "w-3 h-3 transition-transform duration-200",
                          isExpanded ? "rotate-180" : ""
                        )}
                      />
                    </button>
                  ) : (
                    <div className="w-full flex justify-center py-2 mb-1">
                      <div className="h-[1px] w-8 bg-border" />
                    </div>
                  )}

                  <AnimatePresence initial={false}>
                    {(isExpanded || !isOpen) && (
                      <m.div
                        initial={isOpen ? { height: 0, opacity: 0 } : undefined}
                        animate={isOpen ? { height: "auto", opacity: 1 } : undefined}
                        exit={isOpen ? { height: 0, opacity: 0 } : undefined}
                        transition={{ duration: 0.2 }}
                        className="space-y-1 overflow-hidden"
                      >
                        {filteredItems.map((item) => (
                          <NavLink
                            key={item.href}
                            href={item.href}
                            onMouseEnter={() => handlePrefetch(item.href)}
                            onClick={() => {
                              if (globalThis.innerWidth < 1024) setIsOpen(false);
                            }}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center px-3 py-2.5 rounded group relative transition-all duration-200",
                                isOpen ? "gap-3" : "gap-0",
                                isActive
                                  ? "bg-brand-secondary-500/10 text-brand-secondary-400 border border-brand-secondary-500/20 shadow-sm"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent",
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
                                      : "text-muted-foreground group-hover:text-foreground",
                                  )}
                                />
                                <span
                                  className={cn(
                                    "font-medium text-sm whitespace-nowrap transition-all duration-200 flex-1",
                                    isOpen
                                      ? "opacity-100 translate-x-0 w-auto"
                                      : "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden",
                                  )}
                                >
                                  {item.label}
                                </span>
                                {badges[item.label] !== undefined && (
                                  <span
                                    className={cn(
                                      "ml-2 bg-brand-secondary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-all duration-200",
                                      isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none w-0 overflow-hidden"
                                    )}
                                  >
                                    {badges[item.label]}
                                  </span>
                                )}
                                {isActive && (
                                  <m.div
                                    layoutId="sidebar-active-indicator"
                                    className="absolute left-0 w-1 h-6 bg-brand-secondary-500 rounded-r-full"
                                  />
                                )}
                              </>
                            )}
                          </NavLink>
                        ))}
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Quick Actions Section */}
            <div className="mt-8 pt-8 border-t border-border space-y-4 px-2">
              <p
                className={cn(
                  "text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 transition-all duration-200",
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
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
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
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
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
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
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
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
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
          <div className="p-3 border-t border-border space-y-2 shrink-0">
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
                "w-full flex items-center px-3 py-3 rounded text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 group",
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
                "flex items-center px-3 py-2  border border-border mt-4 rounded transition-all duration-200",
                isOpen ? "gap-3" : "gap-0 justify-center px-0",
              )}
            >
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden border-r border-border p-1">
                {admin?.avatar ? (
                  <AppImage
                    src={admin.avatar}
                    alt={admin.username}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
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
                <p className="text-sm font-semibold text-foreground truncate">
                  {admin?.username.toUpperCase() || "Admin"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate capitalize font-medium">
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
