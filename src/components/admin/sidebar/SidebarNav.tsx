"use client";
import React, { useState, useEffect } from "react";
import NavLink from "@/components/common/NavLink";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  User,
  Users,
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
  Megaphone,
  BriefcaseBusiness,
  ShieldCheck,
  ChevronDown,
  MessageCircle,
  LayoutTemplate
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ADMIN_KEYS } from "@/hooks/queries/useAdmin";
import {
  getAdminStats,
  fetchActivityLogs,
  fetchRecentOrders,
  fetchAnalytics
} from "@/services/api";
import { m, AnimatePresence } from "motion/react";

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
      { icon: ShoppingCart, label: "Checkout CRM", href: "/admin/checkout-crm" },
    ],
  },
  {
    title: "CRM & Engagement",
    items: [
      { icon: Users, label: "Customers", href: "/admin/users" },
      { icon: Headset, label: "Support", href: "/admin/support" },
      { icon: MessageCircle, label: "WhatsApp", href: "/admin/whatsapp" },
      { icon: Megaphone, label: "Campaigns", href: "/admin/newsletter" },
      { icon: LayoutTemplate, label: "Templates", href: "/admin/templates" },
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

interface SidebarNavProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  admin: any;
  badges: Record<string, number | undefined>;
}

export function SidebarNav({ isOpen, setIsOpen, admin, badges }: SidebarNavProps) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Overview": true,
    "Commerce": true,
  });

  // Automatically expand the nav group that contains the active page link
  useEffect(() => {
    if (!pathname) return;

    navGroups.forEach((group) => {
      const hasActiveChild = group.items.some((item) => {
        const targetPath = item.href;
        const cleanPath = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
        const cleanTarget = targetPath.length > 1 && targetPath.endsWith("/") ? targetPath.slice(0, -1) : targetPath;

        return (
          cleanPath === cleanTarget ||
          cleanPath === `/admin${cleanTarget}` ||
          cleanPath.replace("/admin", "") === cleanTarget ||
          cleanPath.startsWith(cleanTarget + "/")
        );
      });

      if (hasActiveChild) {
        setExpandedGroups((prev) => ({ ...prev, [group.title]: true }));
      }
    });
  }, [pathname]);

  const toggleGroup = (title: string) => {
    if (!isOpen) {
      setIsOpen(true);
      setExpandedGroups((prev) => ({ ...prev, [title]: true }));
      return;
    }
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handlePrefetch = (href: string) => {
    if (href === "/admin/dashboard") {
      queryClient.prefetchQuery({ queryKey: ADMIN_KEYS.stats(), queryFn: getAdminStats });
      queryClient.prefetchQuery({ queryKey: ADMIN_KEYS.analytics("today"), queryFn: () => fetchAnalytics("today") });
      queryClient.prefetchQuery({ queryKey: ADMIN_KEYS.recentOrders(), queryFn: () => fetchRecentOrders() });
      queryClient.prefetchQuery({ queryKey: ADMIN_KEYS.activity(), queryFn: fetchActivityLogs });
    }
  };

  return (
    <nav className="flex-1 py-6 space-y-4 overflow-y-auto custom-scrollbar">
      {navGroups.map((group) => {
        const isAdminOrSuper = admin?.role === "superadmin" || admin?.role === "admin";
        const isManagerOrHigher = isAdminOrSuper || admin?.role === "manager";

        const filteredItems = group.items.filter((item) => {
          if (item.label === "Staff" || item.label === "Team") return isAdminOrSuper;
          if (item.label === "Reports" || item.label === "Customers") return isManagerOrHigher;
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
                <div className="h-px w-8 bg-border" />
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
                              "font-medium text-sm whitespace-nowrap transition-all duration-200",
                              isOpen
                                ? "opacity-100 translate-x-0 w-auto flex-1"
                                : "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden flex-none",
                            )}
                          >
                            {item.label}
                          </span>
                          {badges[item.label] !== undefined && (
                            <span
                              className={cn(
                                "bg-brand-secondary-500 text-foreground text-[10px] font-bold rounded-full transition-all duration-200",
                                isOpen ? "opacity-100 scale-100 ml-2 px-1.5 py-0.5" : "opacity-0 scale-0 pointer-events-none w-0 overflow-hidden m-0 p-0"
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
  );
}
