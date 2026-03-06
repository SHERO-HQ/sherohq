"use client";
import {
  Search,
  Menu,
  User,
  LogOut,
  // ChevronDown,
  Globe,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { usePathname } from "next/navigation";
import UniversalLink from "@/components/common/UniversalLink";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
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
import ProductImage from "@/components/common/ProductImage";

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

// Detect UUID pattern (e.g., "1167aa25-662b-4041-90f1-929639b6847e")
const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export default function AdminHeader({
  onMenuClick,
  isSidebarOpen,
}: Readonly<HeaderProps>) {
  const { admin, logout } = useAdmin();
  const pathname = usePathname() ?? "";
  const { customLabels } = useBreadcrumb();
  const pathnames = pathname.split("/").filter((x) => x && x !== "admin");

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

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-20 items-center justify-between border-b border-white/5 bg-slate-900/80 backdrop-blur-xl px-4 md:px-6 lg:px-8 transition-all duration-300",
        isSidebarOpen ? "lg:left-65" : "lg:left-20",
        "left-0",
      )}
    >
      {/* Left side: Breadcrumbs & Menu Toggle */}
      <div className="flex items-center font-sora gap-2 md:gap-4 overflow-hidden">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
        >
          <Menu className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex overflow-hidden">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <UniversalLink
                to="/admin"
                className="text-slate-400 font-sora hover:text-white transition-colors"
              >
                Admin
              </UniversalLink>
            </li>
            {pathnames.map((value, index) => {
              const to = `/admin/${pathnames.slice(0, index + 1).join("/")}`;
              const isLast = index === pathnames.length - 1;
              const displayLabel = getDisplayLabel(value, to);

              return (
                <li key={to} className="flex items-center space-x-2">
                  <span className="text-slate-600">/</span>
                  {isLast ? (
                    <span className="text-emerald-400 font-medium capitalize">
                      {displayLabel}
                    </span>
                  ) : (
                    <UniversalLink
                      to={to}
                      className="text-slate-400 font-sora hover:text-white transition-colors capitalize"
                    >
                      {displayLabel}
                    </UniversalLink>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Right side: Search, Notifications, Profile */}
      <div className="flex items-center gap-2">
        {/* Search Bar */}
        <div className="hidden lg:flex relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search everything..."
            className="w-64 bg-slate-800/50 border border-white/5 rounded py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
          />
        </div>

        {/* View Site */}
        <UniversalLink
          to="/"
          className="hidden md:flex items-center px-3 py-2 text-sm text-slate-400 font-sora hover:text-white hover:bg-emerald-500/5 rounded transition-colors"
          title="View Site"
        >
          <Globe className="w-4 h-4" />
          <span>View Site</span>
        </UniversalLink>

        {/* Notifications */}
        <NotificationCenter />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center hover:bg-transparent p-0"
            >
              <div className="relative flex items-center justify-center p-1 w-10 h-10 overflow-hidden hover:bg-white/5 rounded backdrop-blur-md border border-white/10 hover:border-white/5 transition-all outline-none">
                {admin?.avatar ? (
                  <ProductImage
                    src={admin.avatar}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              {/* <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-semibold text-white capitalize font-sora leading-none mb-1">
                  {admin?.username || "Admin"}
                </span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  {admin?.role || "Super Admin"}
                </span>
              </div> */}
              {/* <ChevronDown className="w-4 h-4 text-slate-500 ml-1 hidden sm:block" /> */}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-slate-900 border-white/10 text-white"
          >
            <DropdownMenuLabel className="font-sora">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem asChild>
              <UniversalLink
                to="/admin/profile"
                className="flex items-center cursor-pointer hover:bg-white/5"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </UniversalLink>
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
  );
}
