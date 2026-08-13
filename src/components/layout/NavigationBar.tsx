"use client";

import { ToggleTheme } from "./toggle-theme";
import { Heart, ShoppingCart } from "lucide-react";
import NavLink from "@/components/common/NavLink";
import { m } from "motion/react";
import { navLinkClass } from "@/lib/utils";
import BottomNav from "./BottomNav";
import SearchBar from "./SearchBar";
import { Badge } from "@/components/ui/badge";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { DesktopUserMenu } from "./DesktopUserMenu";
import { useNavigationState } from "./useNavigationState";

const Nav = () => {
  const {
    isOpen,
    setIsOpen,
    scrolled,
    isUserMenuOpen,
    setIsUserMenuOpen,
    activeNavIndex,
    indicatorDims,
    totalQuantity,
    setIsCartOpen,
    wishlist,
    setIsWishlistOpen,
    user,
    isAuthenticated,
    mounted,
    prefersReducedMotion,
    userMenuRef,
    userMenuButtonRef,
    mobileMenuRef,
    mobileMenuButtonRef,
    navMenuRef,
    homeHref,
    menuVars,
    navLinks,
    logout,
  } = useNavigationState();

  return (
    <>
      <nav
        className={`sticky top-0 w-full transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ease-in-out z-50 border-t-0 ${
          isOpen || scrolled
            ? "glass-surface-md shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
        aria-label="main navigation"
        id="nav-menu"
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-0">
          <div className="flex justify-between items-center h-12 lg:h-16">
            {/* Logo */}
            <NavLink
              href={homeHref}
              className="flex items-center z-50"
              onClick={() => setIsOpen(false)}
            >
              <div className="md:hidden">
                <img
                  src="/assets/logo/shero.svg"
                  alt="SHERO Logo"
                  width={40}
                  height={40}
                  fetchPriority="high"
                  decoding="async"
                  className="h-10 w-auto"
                  suppressHydrationWarning
                />
              </div>

              <div className="hidden md:block">
                <img
                  src="/assets/logo/shero-light.svg"
                  alt="SHERO Logo"
                  width={40}
                  height={40}
                  fetchPriority="high"
                  decoding="async"
                  className="h-10 w-auto dark:block hidden"
                  suppressHydrationWarning
                />
                <img
                  src="/assets/logo/shero-dark.svg"
                  alt="SHERO Logo"
                  width={40}
                  height={40}
                  fetchPriority="high"
                  decoding="async"
                  className="h-10 w-auto dark:hidden block"
                  suppressHydrationWarning
                />
              </div>
            </NavLink>

            {/* Center Navigation Links - Desktop */}
            <div className="hidden lg:flex absolute left-1/2 top-0 h-full -translate-x-1/2 items-center justify-center z-10 pointer-events-none">
              <ul
                ref={navMenuRef}
                className="flex items-center gap-6 h-full relative pointer-events-auto"
                suppressHydrationWarning
              >
                {navLinks.map((item) => (
                  <li
                    key={item.name}
                    className="h-full flex items-center"
                    suppressHydrationWarning
                  >
                    <NavLink
                      className={({ isActive }) => navLinkClass(isActive)}
                      href={getAbsoluteUrl(item.href)}
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}

                {activeNavIndex !== null && activeNavIndex >= 0 && (
                  <m.div
                    className="absolute bottom-0 h-1 bg-brand-secondary-500 rounded-t-full shadow-[0_-1px_4px_rgba(16,185,129,0.2)]"
                    initial={false}
                    animate={{
                      width: indicatorDims.width,
                      x: indicatorDims.x,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 32,
                    }}
                  />
                )}
              </ul>
            </div>

            {/* Right Groups Wrapper */}
            <div className="flex items-center gap-2 lg:gap-4 ml-auto z-20">
              <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-50 dark:bg-slate-800/80 rounded transition-colors">
                <SearchBar className="hidden lg:flex h-9 items-center justify-center text-slate-600 dark:text-slate-400" />

                {/* Wishlist Button - Hidden on mobile (< md) where BottomNav handles it */}
                <button
                  onClick={() => setIsWishlistOpen(true)}
                  className="hidden md:flex cursor-pointer relative p-2 h-9 w-9 items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded border-none"
                  aria-label="Open Wishlist"
                >
                  <Heart
                    className={`w-5 h-5 ${mounted && wishlist.length > 0 ? "fill-red-500 text-red-500" : ""}`}
                  />
                  {mounted && wishlist.length > 0 && (
                    <Badge
                      variant="destructive"
                      className={`absolute -top-1.5 -right-1.5 h-4.5 min-w-4.5 px-1 flex items-center justify-center rounded-full text-[9px] ring-2 ring-background ${!prefersReducedMotion ? "animate-in zoom-in" : ""}`}
                    >
                      {wishlist.length}
                    </Badge>
                  )}
                </button>

                {/* Cart Button - Hidden on mobile (< md) where BottomNav handles it */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="hidden md:flex cursor-pointer relative p-2 h-9 w-9 items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors rounded border-none"
                  aria-label="Open Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {mounted && totalQuantity > 0 && (
                    <Badge
                      variant="brandSecondary"
                      className={`absolute -top-1.5 -right-1.5 h-4.5 min-w-4.5 px-1 flex items-center justify-center rounded-full text-[9px] ring-2 ring-background ${!prefersReducedMotion ? "animate-in zoom-in" : ""}`}
                    >
                      {totalQuantity}
                    </Badge>
                  )}
                </button>

                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5 hidden lg:block" />

                <DesktopUserMenu
                  userMenuRef={userMenuRef}
                  userMenuButtonRef={userMenuButtonRef}
                  mounted={mounted}
                  isAuthenticated={isAuthenticated}
                  isUserMenuOpen={isUserMenuOpen}
                  setIsUserMenuOpen={setIsUserMenuOpen}
                  user={user}
                  logout={logout}
                />
              </div>

              <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-50 dark:bg-slate-800/80 rounded transition-colors">
                <ToggleTheme />
              </div>

              <div className="flex items-center lg:hidden">
                <button
                  ref={mobileMenuButtonRef}
                  className={`relative w-9 h-9 rounded flex items-center justify-center transition-all duration-200 cursor-pointer shadow hover:scale-105 ${
                    isOpen
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-400"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                  }`}
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-expanded={isOpen}
                  aria-controls="mobile-nav-menu"
                  aria-label="Toggle menu"
                >
                  <svg
                    width={25}
                    height={25}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    className={`transition-transform duration-500 ${isOpen ? "rotate-90" : "rotate-0"}`}
                  >
                    <path
                      d={
                        isOpen
                          ? "M18 6L6 18M6 6L18 18"
                          : "M5 17H13M5 12H19M11 7H19"
                      }
                      className="transition duration-300"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <MobileNavDrawer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        mobileMenuRef={mobileMenuRef}
        menuVars={menuVars}
        prefersReducedMotion={prefersReducedMotion}
        navLinks={navLinks}
        activeNavIndex={activeNavIndex}
        mounted={mounted}
        isAuthenticated={isAuthenticated}
        user={user}
        logout={logout}
      />

      <BottomNav />
    </>
  );
};

export default Nav;
