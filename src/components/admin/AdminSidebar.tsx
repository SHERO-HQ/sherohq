import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  User,
  LogOut,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports" },
  { icon: User, label: "Profile", href: "/admin/profile" },
];

export default function AdminSidebar({
  isOpen,
  setIsOpen,
}: Readonly<SidebarProps>) {
  const { admin, logout } = useAdmin();

  const isLargeScreen = globalThis.innerWidth >= 1024;

  let sidebarWidth = "0px";
  if (isOpen) {
    sidebarWidth = "260px";
  } else if (isLargeScreen) {
    sidebarWidth = "80px";
  }

  let sidebarX = -260;
  if (isOpen || isLargeScreen) {
    sidebarX = 0;
  }

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
          x: sidebarX,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed top-0 left-0 h-full bg-slate-900/40 backdrop-blur-2xl border-r border-white/10 z-50 overflow-hidden",
          !isOpen && "lg:w-20",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-20 flex items-center px-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center shrink-0">
                <span className="text-white font-sora font-bold text-xl">
                  S
                </span>
              </div>
              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-white font-sora font-bold text-lg whitespace-nowrap"
                  >
                    SHERO Admin
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-3 rounded transition-all duration-300 group relative",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent",
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
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">
                  Quick Actions
                </p>
              )}
              <div className="space-y-1">
                <NavLink
                  to="/admin/products/new"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 group relative",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                    )
                  }
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  {isOpen && (
                    <span className="text-xs font-medium">New Product</span>
                  )}
                </NavLink>
                <NavLink
                  to="/admin/orders?status=pending"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-3 py-2 rounded transition-all duration-200 group relative",
                      isActive
                        ? "bg-amber-500/10 text-amber-400"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                    )
                  }
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  {isOpen && (
                    <span className="text-xs font-medium">Review Orders</span>
                  )}
                </NavLink>
              </div>
            </div>
          </nav>

          {/* User & Settings */}
          <div className="p-3 border-t border-white/5 space-y-2">
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-3 py-3 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 group"
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
                "flex items-center gap-3 px-3 py-4 rounded bg-white/5 backdrop-blur-md border border-white/10 mt-4",
                !isOpen && "justify-center px-0",
              )}
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
                {admin?.avatar ? (
                  <img
                    src={admin.avatar}
                    alt={admin.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
              </div>
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate font-sora">
                    {admin?.username || "Admin"}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate capitalize font-medium">
                    {admin?.role || "Administrator"}
                  </p>
                </div>
              )}
            </div>

            {/* Version Footer */}
            {isOpen && (
              <div className="px-3 pb-2 opacity-30 mt-2">
                <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                  v1.2.4-stable • Build 822
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-0 top-16 w-8 h-8 p-2 hidden lg:flex items-center justify-center text-slate-500 hover:text-emerald-400 transition-all z-50 group shadow-lg"
        >
          <div>
            {isOpen ? (
              <PanelLeftClose className="w-6 h-6" />
            ) : (
              <PanelLeftOpen className="w-6 h-6" />
            )}
          </div>
        </button>
      </motion.aside>
    </>
  );
}
