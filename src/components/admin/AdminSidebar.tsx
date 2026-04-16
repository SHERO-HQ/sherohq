"use client";
import NavLink from "@/components/common/NavLink";
import Link from "next/link";
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
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import AppImage from "@/components/common/AppImage";

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

export default function AdminSidebar({
  isOpen,
  setIsOpen,
}: Readonly<SidebarProps>) {
  const { admin, logout } = useAdmin();

  // Logic for width and visibility
  const sidebarWidth = isOpen ? "260px" : "80px";

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
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: sidebarWidth,
          x: 0,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed top-0 left-0 h-full bg-slate-900/40 backdrop-blur-sm border-r border-white/10 z-50 lg:translate-x-0 transition-transform duration-300",
          !isOpen ? "w-20" : "w-65",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full relative">
          {/* Logo Section */}
          <Link
            href="/admin/dashboard"
            className="h-20 flex items-center px-6 border-b border-white/5 shrink-0 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center shrink-0 shadow shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-white font-bold text-lg whitespace-nowrap"
                  >
                    SHERO Admin
                  </motion.span>
                )}
              </AnimatePresence>
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
                  onClick={() => {
                    if (globalThis.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-3 rounded transition duration-300 group relative",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
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
                            ? "text-emerald-400"
                            : "text-slate-400 group-hover:text-white",
                        )}
                      />
                      <AnimatePresence mode="wait">
                        {isOpen && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="font-medium text-sm whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}

            {/* Quick Actions Section */}
            <div className="mt-8 pt-8 border-t border-white/5 space-y-4 px-2">
              {isOpen && (
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
                  Quick Actions
                </p>
              )}
              <div className="space-y-1">
                <NavLink
                  href="/admin/products/new"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-3 py-2 rounded transition duration-200 group relative",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                      !isOpen && "justify-center px-0",
                    )
                  }
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  {isOpen && (
                    <span className="text-xs font-medium">New Product</span>
                  )}
                </NavLink>
                <NavLink
                  href="/admin/orders?status=pending"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-3 py-2 rounded transition duration-200 group relative",
                      isActive
                        ? "bg-amber-500/10 text-amber-400"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                      !isOpen && "justify-center px-0",
                    )
                  }
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  {isOpen && (
                    <span className="text-xs font-medium">Review Orders</span>
                  )}
                </NavLink>
                <NavLink
                  href="/admin/orders/new"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-3 py-2 rounded transition duration-200 group relative",
                      isActive
                        ? "bg-blue-500/10 text-blue-400"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                      !isOpen && "justify-center px-0",
                    )
                  }
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  {isOpen && (
                    <span className="text-xs font-medium">Create Invoice</span>
                  )}
                </NavLink>
                <NavLink
                  href="/admin/expenses?action=new"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-3 py-2 rounded transition duration-200 group relative",
                      isActive
                        ? "bg-rose-500/10 text-rose-400"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                      !isOpen && "justify-center px-0",
                    )
                  }
                >
                  <DollarSign className="w-4 h-4 shrink-0" />
                  {isOpen && (
                    <span className="text-xs font-medium">New Expense</span>
                  )}
                </NavLink>
              </div>
            </div>
          </nav>

          {/* User & Settings */}
          <div className="p-3 border-t border-white/5 space-y-2 shrink-0">
            <button
              onClick={() => logout()}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition duration-200 group",
                !isOpen && "justify-center px-0",
              )}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium text-sm"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Profile Summary */}
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 backdrop-blur-sm border border-white/10 mt-4 rounded",
                !isOpen && "justify-center px-0",
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
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {admin?.username.toUpperCase() || "Admin"}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate capitalize font-medium">
                    {admin?.role || "Administrator"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
