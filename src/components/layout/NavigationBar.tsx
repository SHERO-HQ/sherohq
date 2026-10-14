"use client";

import { Heart, ShoppingCart } from "lucide-react";
import NavLink from "@/components/common/NavLink";
import { m } from "motion/react";
import { navLinkClass } from "@/lib/utils";
import SearchBar from "./SearchBar";
import { Badge } from "@/components/ui/badge";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { DesktopUserMenu } from "./DesktopUserMenu";
import { useNavigationState } from "./useNavigationState";
import { SHOP_ENABLED, SEARCH_ENABLED, AUTH_ENABLED } from "@/constants/features";

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
        className={`sticky top-0 w-full transition-[background-color,backdrop-filter,border-color,box-shadow] ease-in-out z-50 border-t-0 ${
          isOpen || scrolled
            ? "glass-surface-md shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
        aria-label="main navigation"
        id="nav-menu"
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-0">
          <div className="flex justify-between items-center h-12 lg:h-14">
            {/* Logo */}
            <NavLink
              href={homeHref}
              aria-label="SHERO home"
              className="flex items-center z-50"
              onClick={() => setIsOpen(false)}
            >
              <div className="md:hidden">
                <img
                  src="/assets/logo/shero.svg"
                  alt="SHERO"
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
                  alt=""
                  aria-hidden="true"
                  width={163}
                  height={57}
                  fetchPriority="high"
                  decoding="async"
                  className="h-10 w-auto dark:block hidden"
                  suppressHydrationWarning
                />
                <img
                  src="/assets/logo/shero-dark.svg"
                  alt=""
                  aria-hidden="true"
                  width={163}
                  height={57}
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
                {navLinks.map((item: any) => (
                  <li
                    key={item.name}
                    className="h-full flex items-center relative group/navitem"
                    suppressHydrationWarning
                  >
                    <NavLink
                      className={({ isActive }) => navLinkClass(isActive)}
                      href={getAbsoluteUrl(item.href)}
                    >
                      {item.name}
                    </NavLink>
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 opacity-0 pointer-events-none group-hover/navitem:opacity-100 group-hover/navitem:pointer-events-auto transition-all z-50">
                        <div className="bg-background border border-border rounded shadow-lg p-1.5 min-w-52">
                          {item.subItems.map((sub: any) => (
                            <NavLink
                              key={sub.name}
                              href={getAbsoluteUrl(sub.href)}
                              className="flex items-center justify-between px-3 py-2 rounded hover:bg-muted text-xs font-medium text-foreground transition-colors"
                            >
                              <span>{sub.name}</span>
                              {sub.badge && (
                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-secondary-500/10 text-brand-secondary-600 dark:text-brand-secondary-400">
                                  {sub.badge}
                                </span>
                              )}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}

                {activeNavIndex !== null && activeNavIndex >= 0 && (
                  <m.li
                    aria-hidden="true"
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
              {(SHOP_ENABLED || SEARCH_ENABLED || AUTH_ENABLED) && (
                <div className="flex items-center gap-0.5 sm:gap-1 bg-secondary rounded transition-colors">
                  {SEARCH_ENABLED && (
                    <SearchBar className="hidden lg:flex h-9 items-center justify-center text-muted-foreground" />
                  )}

                  {/* Wishlist Button - Hidden on mobile (< md) where BottomNav handles it */}
                  {SHOP_ENABLED && (
                    <button
                      onClick={() => setIsWishlistOpen(true)}
                      className="hidden md:flex cursor-pointer relative p-2 h-9 w-9 items-center justify-center text-muted-foreground hover:bg-muted hover:text-destructive transition-colors rounded border-none"
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
                  )}

                  {/* Cart Button - Hidden on mobile (< md) where BottomNav handles it */}
                  {SHOP_ENABLED && (
                    <button
                      onClick={() => setIsCartOpen(true)}
                      className="hidden md:flex cursor-pointer relative p-2 h-9 w-9 items-center justify-center text-muted-foreground hover:bg-muted hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors rounded border-none"
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
                  )}

                  {AUTH_ENABLED && (
                    <>
                      {SHOP_ENABLED && (
                        <div className="w-px h-5 bg-border mx-0.5 hidden lg:block" />
                      )}

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
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center lg:hidden">
                <button
                  ref={mobileMenuButtonRef}
                  className={`relative min-w-11 min-h-8 rounded flex items-center justify-center transition-all cursor-pointer shadow hover:scale-105 ${
                    isOpen
                      ? "bg-destructive/10 text-destructive border border-destructive/50"
                      : "bg-secondary text-foreground border border-border"
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
                    className={`transition-transform ${isOpen ? "rotate-90" : "rotate-0"}`}
                  >
                    <path
                      d={
                        isOpen
                          ? "M18 6L6 18M6 6L18 18"
                          : "M5 17H13M5 12H19M11 7H19"
                      }
                      className="transition "
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

    </>
  );
};

export default Nav;
