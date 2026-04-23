"use client";
import {
 Search,
 User,
 LogOut,
 ChevronDown,
 Globe,
 LayoutDashboard,
 Menu,
} from "lucide-react";
import React, { useEffect, memo, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { getAbsoluteUrl } from "@/utils/subdomain";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import NotificationCenter from "./NotificationCenter";
import { cn } from "@/lib/utils";
import AppImage from "@/components/common/AppImage";
import GlobalSearch from "./GlobalSearch";

interface HeaderProps {
 onMenuClick: () => void;
 isSidebarOpen: boolean;
}

// Detect UUID pattern (e.g., "1167aa25-662b-4041-90f1-929639b6847e")
const isUUID = (str: string) =>
 /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const AdminHeader = memo(({
 onMenuClick,
 isSidebarOpen,
}: Readonly<HeaderProps>) => {
 const { admin, logout } = useAdmin();
 const [isSearchOpen, setIsSearchOpen] = useState(false);
 const pathname = usePathname() ?? "";
 const { customLabels } = useBreadcrumb();
 const pathnames = pathname
  .split("/")
  .filter((x) => x && x !== "admin" && x !== "dashboard");

 // Get display label for a path segment
 const getDisplayLabel = (segment: string, fullPath: string) => {
  // Check for custom label first
  const customLabel = customLabels.get(fullPath);
  if (customLabel) return customLabel;

  // If it's a UUID without custom label, truncate it
  if (isUUID(segment)) return segment.slice(0, 8) + "...";

  // Otherwise, format the segment nicely
  return segment.replaceAll("-", " ");
 };

 useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
   // CMD+K or CTRL+K
   if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    setIsSearchOpen(true);
   }
   // / shortcut
   if (
    e.key === "/" &&
    document.activeElement?.tagName !== "INPUT" &&
    document.activeElement?.tagName !== "TEXTAREA"
   ) {
    e.preventDefault();
    setIsSearchOpen(true);
   }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
 }, []);

 return (
  <>
   <header
    className={cn(
     "fixed top-0 right-0 z-30 flex h-20 items-center justify-between glass-surface px-4 md:px-6 lg:px-8 transition-all duration-200 ease-in-out border-x-0 border-t-0",
     isSidebarOpen ? "lg:left-64" : "lg:left-20",
     "left-0",
    )}
   >
    {/* Left side: Breadcrumbs & Menu Toggle */}
    <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
     {/* Universal Sidebar Toggle */}
     <button
      onClick={onMenuClick}
      className="p-2 rounded text-slate-400 hover:text-brand-secondary-400 hover:bg-white/5 transition-all shrink-0 group ring-1 ring-white/5"
      aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
     >
      {isSidebarOpen ? (
       <Menu className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
      ) : (
       <Menu className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
      )}
     </button>

     <nav aria-label="Breadcrumb" className="hidden sm:flex overflow-hidden">
      <ol className="flex items-center space-x-2 text-sm">
       <li>
        <Link
         href="/admin/dashboard"
         className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
        >
         <LayoutDashboard className="w-3.5 h-3.5" />
         <span>Dashboard</span>
        </Link>
       </li>
       {pathnames.map((value, index) => {
        const to = `/admin/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const displayLabel = getDisplayLabel(value, to);

        return (
         <li key={to} className="flex items-center space-x-2">
          <span className="text-slate-600">/</span>
          {isLast ? (
           <span className="text-brand-secondary-400 font-medium capitalize">
            {displayLabel}
           </span>
          ) : (
           <Link
            href={to}
            className="text-slate-400 hover:text-white transition-colors capitalize"
           >
            {displayLabel}
           </Link>
          )}
         </li>
        );
       })}
      </ol>
     </nav>
    </div>

    {/* Right side: Search, Notifications, Profile */}
    <div className="flex items-center gap-2">
     {/* Search Bar - Trigger */}
     <button
      onClick={() => setIsSearchOpen(true)}
      className="hidden lg:flex items-center gap-3 w-64 px-4 py-2 glass-surface-md text-sm text-slate-500 hover:bg-slate-800/80 hover:border-white/20 transition group text-left rounded"
     >
      <Search className="w-4 h-4 group-hover:text-brand-secondary-400 transition-colors" />
      <span className="flex-1">Search everything...</span>
      <div className="flex items-center gap-1">
       <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-[10px] font-medium text-slate-400">
        ⌘K
       </kbd>
      </div>
     </button>

     {/* Mobile Search Icon */}
     <button
      onClick={() => setIsSearchOpen(true)}
      className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
      aria-label="Search"
     >
      <Search className="w-5 h-5" />
     </button>

     {/* View Site */}
     <a
      href={getAbsoluteUrl("/")}
      className="hidden md:flex items-center px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-brand-secondary-500/5 rounded transition-colors"
      title="View Site"
     >
      <Globe className="w-4 h-4 mr-1" />
      <span>View Site</span>
     </a>

     {/* Notifications */}
     <NotificationCenter />

     {/* User Dropdown */}
     <DropdownMenu>
      <DropdownMenuTrigger asChild>
       <Button
        variant="ghost"
        className="flex items-center hover:bg-transparent p-0"
       >
        <div className="relative flex items-center justify-center p-1 w-10 h-10 shrink-0 overflow-hidden hover:bg-white/5 rounded  border border-white/10 hover:border-white/5 transition outline-none">
         {admin?.avatar ? (
          <AppImage
           src={admin.avatar}
           alt=""
           fill
           sizes="40px"
           className="object-cover"
          />
         ) : (
          <User className="w-4 h-4 text-brand-secondary-400" />
         )}
        </div>
        <div className="hidden sm:flex flex-col items-start ml-3">
         <span className="text-sm font-semibold text-white capitalize leading-none mb-1">
          {admin?.username || "Admin"}
         </span>
         <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
          {admin?.role || "Super Admin"}
         </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-500 ml-2 hidden sm:block" />
       </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
       align="end"
       className="w-56 bg-slate-900 border-white/10 text-white"
      >
       <DropdownMenuLabel className="">
        My Account
       </DropdownMenuLabel>
       <DropdownMenuSeparator className="bg-white/5" />
       <DropdownMenuItem asChild>
        <Link
         href="/admin/profile"
         className="flex items-center cursor-pointer hover:bg-white/5"
        >
         <User className="mr-2 h-4 w-4" />
         <span>Profile</span>
        </Link>
       </DropdownMenuItem>
       <DropdownMenuSeparator className="bg-white/5" />
       <DropdownMenuItem
        onClick={() => logout()}
        className="flex items-center text-rose-400 focus:text-rose-400 cursor-pointer focus:bg-rose-500/10"
       >
        <LogOut className="mr-2 h-4 w-4" />
        <span>Log out</span>
       </DropdownMenuItem>
      </DropdownMenuContent>
     </DropdownMenu>
    </div>
   </header>

   <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
  </>
 );
});

export default AdminHeader;
