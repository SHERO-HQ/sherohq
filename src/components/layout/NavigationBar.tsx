"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ToggleTheme } from "./toggle-theme";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePathname } from "next/navigation";
import {
  LogOut,
  ShoppingCart,
  User,
  Heart,
  ShoppingBag,
  Cpu,
  MessageSquare,
  Info,
  X,
} from "lucide-react";
import NavLink from "@/components/common/NavLink";

import { AnimatePresence, motion } from "motion/react";
import { SOCIAL_LINKS } from "@/constants/socials";
import { navLinkClass, navLinkClassVariant } from "@/lib/utils";
import {
  WhatsAppIcon,
  TikTokIcon,
  InstagramIcon,
  FacebookIcon,
} from "@/assets/icons/icons";
import BottomNav from "./BottomNav";
import SearchBar from "./SearchBar";
import { Badge } from "@/components/ui/badge";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { COMPANY_CONTACTS } from "@/constants/contacts";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeNavIndex, setActiveNavIndex] = useState<number | null>(null);
  const [indicatorDims, setIndicatorDims] = useState({ width: 0, x: 0 });
  const { totalQuantity, setIsCartOpen } = useCart();
  const { wishlist, setIsWishlistOpen } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const mounted = useIsMounted();
  const prefersReducedMotion = useReducedMotion();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const previousIsOpenRef = useRef(false);
  const navMenuRef = useRef<HTMLUListElement>(null);
  const homeHref = getAbsoluteUrl("/");

  // Animation variants — slide only, no opacity (avoids iOS compositor flicker)
  const menuVars = useMemo(
    () => ({
      initial: { x: prefersReducedMotion ? 0 : "-100%" },
      animate: {
        x: 0,
        transition: {
          duration: prefersReducedMotion ? 0.01 : 0.28,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        },
      },
      exit: {
        x: prefersReducedMotion ? 0 : "-100%",
        transition: {
          duration: prefersReducedMotion ? 0.01 : 0.22,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        },
      },
    }),
    [prefersReducedMotion],
  );

  const navLinks = useMemo(
    () => [
      {
        name: "Shop",
        icon: ShoppingBag,
        desc: "Explore catalog",
        href: "/shop",
      },
      {
        name: "Solutions",
        icon: Cpu,
        desc: "Business innovations",
        href: "/solutions",
      },
      {
        name: "Consultation",
        icon: MessageSquare,
        desc: "Expert tech advice",
        href: "/consultation",
      },
      {
        name: "About Us",
        icon: Info,
        desc: "Our mission",
        href: "/about-us",
      },
    ],
    [],
  );

  // Lock body scroll when mobile menu is open (with scrollbar compensation, desktop viewports only)
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isOpen && !isMobile) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight =
        scrollBarWidth > 0 ? `${scrollBarWidth}px` : "";
    } else if (isOpen && isMobile) {
      // On mobile viewports, we use overscroll-behavior: contain to prevent background scroll chaining
      // without setting overflow: hidden on the body which triggers Safari visual viewport jumps.
      document.body.style.overscrollBehavior = "contain";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "";
      document.body.style.overscrollBehavior = "";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "";
      document.body.style.overscrollBehavior = "";
    };
  }, [isOpen]);

  // Keep keyboard focus within navigation flow on mobile menu open/close.
  useEffect(() => {
    if (isOpen) {
      const focusDelay = prefersReducedMotion ? 0 : 300;
      const timer = setTimeout(() => {
        const focusables = mobileMenuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );

        const firstLink =
          mobileMenuRef.current?.querySelector<HTMLElement>("a[href]");
        if (firstLink) {
          firstLink.focus();
        } else {
          focusables?.[0]?.focus();
        }
      }, focusDelay);

      return () => clearTimeout(timer);
    }

    if (previousIsOpenRef.current) {
      mobileMenuButtonRef.current?.focus();
    }

    previousIsOpenRef.current = isOpen;
  }, [isOpen, prefersReducedMotion]);

  // Global keyboard support for dismissing open nav layers
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsUserMenuOpen(false);
      }

      if (isOpen && event.key === "Tab" && mobileMenuRef.current) {
        const focusables = Array.from(
          mobileMenuRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute("disabled"));

        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Close desktop user menu when clicking outside
  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!isUserMenuOpen) return;
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isUserMenuOpen]);

  // Move focus into desktop user menu when it opens.
  useEffect(() => {
    if (!isUserMenuOpen || !userMenuRef.current) return;
    const focusables = userMenuRef.current.querySelectorAll<HTMLElement>(
      '[role="menuitem"], a[href], button:not([disabled])',
    );
    focusables[0]?.focus();
  }, [isUserMenuOpen]);

  // Scroll effect for nav background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active nav link index for indicator animation
  useEffect(() => {
    if (mounted) {
      let found = -1;

      navLinks.forEach((item, index) => {
        const linkPath = item.href;
        const absoluteUrl = getAbsoluteUrl(linkPath);
        try {
          const url = new URL(absoluteUrl);
          const targetPath = url.pathname;

          // Use robust "starts with" logic to keep parent menu items active on sub-pages
          // Avoid partial matches like "/shop" matching "/shopping"
          const isActive =
            targetPath === "/"
              ? pathname === "/"
              : pathname === targetPath ||
                pathname.startsWith(targetPath + "/");

          if (isActive) {
            found = index;
          }
        } catch {
          const isActive =
            linkPath === "/"
              ? pathname === "/"
              : pathname === linkPath || pathname.startsWith(linkPath + "/");

          if (isActive) {
            found = index;
          }
        }
      });

      if (activeNavIndex !== found) {
        queueMicrotask(() => setActiveNavIndex(found));
      }
    }
  }, [pathname, mounted, activeNavIndex, navLinks]);

  const measureIndicator = useCallback(() => {
    if (activeNavIndex !== null && activeNavIndex >= 0 && navMenuRef.current) {
      const children = Array.from(navMenuRef.current.children) as HTMLElement[];
      const activeElement = children[activeNavIndex];

      if (activeElement) {
        const width = activeElement.clientWidth;
        const x = activeElement.offsetLeft;
        setIndicatorDims({ width, x });
      }
    } else {
      setIndicatorDims({ width: 0, x: 0 });
    }
  }, [activeNavIndex]);

  // Measure indicator dimensions for active link
  useEffect(() => {
    measureIndicator();

    // Handle window resize events
    window.addEventListener("resize", measureIndicator);

    // Handle custom font loading (ensures perfect dimension rendering)
    if (typeof window !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measureIndicator);
    }

    return () => {
      window.removeEventListener("resize", measureIndicator);
    };
  }, [activeNavIndex, scrolled, measureIndicator]);

  return (
    <>
      <nav
        className={`w-full transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ease-in-out z-50 border-t-0 ${isOpen || scrolled ? "glass-surface-md shadow-sm" : "bg-transparent border-b border-transparent"}`}
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

                {/* Active Link Indicator - Glides on the bottom border */}
                {activeNavIndex !== null && activeNavIndex >= 0 && (
                  <motion.div
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

                {/* Wishlist Button */}
                <button
                  onClick={() => setIsWishlistOpen(true)}
                  className="cursor-pointer relative p-2 h-9 w-9 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded border-none"
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

                {/* Cart Button */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="cursor-pointer relative p-2 h-9 w-9 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors rounded border-none"
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

                {/* User Dropdown */}
                <div className="hidden lg:block relative" ref={userMenuRef}>
                  {mounted && isAuthenticated ? (
                    <button
                      ref={userMenuButtonRef}
                      type="button"
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          setIsUserMenuOpen(true);
                        }
                      }}
                      onClick={() => setIsUserMenuOpen((prev) => !prev)}
                      className="cursor-pointer flex items-center justify-center h-9 w-9 rounded hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors"
                      aria-haspopup="menu"
                      aria-expanded={isUserMenuOpen}
                      aria-controls="desktop-user-menu"
                    >
                      <span className="sr-only">User Menu</span>
                      <div className="w-7 h-7 rounded font-semibold bg-linear-to-br from-brand-secondary-500 to-brand-secondary-600 flex items-center justify-center text-xs text-white shrink-0 shadow-sm">
                        {user?.name?.charAt(0)}
                      </div>
                    </button>
                  ) : (
                    <NavLink
                      href={getAbsoluteUrl("/login")}
                      className="cursor-pointer flex items-center justify-center h-9 w-9 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors rounded"
                      aria-label="Login"
                    >
                      <User className="w-5 h-5" />
                    </NavLink>
                  )}

                  {mounted && isAuthenticated && isUserMenuOpen && (
                    <div
                      id="desktop-user-menu"
                      role="menu"
                      aria-label="User menu"
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded shadow border border-slate-200 dark:border-slate-800 py-1 transition duration-200 z-50"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {user?.email}
                        </p>
                      </div>
                      <NavLink
                        href={getAbsoluteUrl("/profile")}
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <User className="w-4 h-4" /> Profile & Orders
                      </NavLink>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-100 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/75"
            />

            {/* Menu Panel (Drawer) */}
            <motion.div
              ref={mobileMenuRef}
              variants={menuVars}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute top-0 left-0 w-[65%] sm:w-100 h-full bg-white dark:bg-slate-950 shadow flex flex-col overflow-hidden"
              id="mobile-nav-menu"
            >
              {/* Top Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2">
                  <img
                    src="/assets/logo/shero.svg"
                    alt=""
                    className="h-8 w-auto"
                  />
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-2 p-1">
                  <SearchBar alwaysOpen={true} />
                </div>

                <div className="space-y-3 mt-4">
                  <ul className="space-y-5">
                    {navLinks.map((item, index) => (
                      <li key={item.name}>
                        <NavLink
                          href={getAbsoluteUrl(item.href)}
                          onClick={() => setIsOpen(false)}
                          isActive={activeNavIndex === index}
                          className={({ isActive }) =>
                            navLinkClassVariant(isActive, "mobile")
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {item.name}
                              {isActive && (
                                <motion.div
                                  layoutId="mobile-nav-indicator"
                                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-secondary-500 rounded-r-full"
                                />
                              )}
                            </>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Profile Section */}
                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800/50">
                  {mounted && isAuthenticated ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                        <div className="w-12 h-12 rounded font-medium bg-linear-to-br from-brand-secondary-500 to-brand-secondary-600 flex items-center justify-center text-xl text-white shadow shadow-brand-secondary-500/20">
                          {user?.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-medium text-slate-900 dark:text-white truncate">
                            {user?.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <NavLink
                          href={getAbsoluteUrl("/profile")}
                          onClick={() => setIsOpen(false)}
                          className="flex flex-col items-center justify-center gap-2 p-4 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 rounded transition-all group/item shadow-sm"
                        >
                          <User className="w-5 h-5 text-slate-400 group-hover/item:text-brand-secondary-500" />
                          <span className="font-medium text-[11px]">Profile</span>
                        </NavLink>
                        <button
                          onClick={() => {
                            logout();
                            setIsOpen(false);
                          }}
                          className="flex flex-col items-center justify-center gap-2 p-3 text-red-600 dark:text-red-400 bg-red-50/30 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 rounded transition-all group/logout shadow-sm"
                        >
                          <LogOut className="w-5 h-5 opacity-70 group-hover/logout:opacity-100" />
                          <span className="font-medium text-[11px]">Logout</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <NavLink
                      href={getAbsoluteUrl("/login")}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 p-2 text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-50/50 dark:bg-brand-secondary-200/20 rounded transition-all duration-300 hover:bg-brand-secondary-100 dark:hover:bg-brand-secondary-900/40 border border-brand-secondary-100 dark:border-brand-secondary-800/50 group shadow-sm shadow-brand-secondary-500/5"
                    >
                      <div className="w-8 h-8 rounded bg-brand-secondary-600 text-white flex items-center justify-center shadow shadow-brand-secondary-600/20 group-hover:scale-105 transition-transform">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span className="block font-medium text-[15px] tracking-tight">
                          Login
                        </span>
                        <span className="block text-[11px] text-brand-secondary-600/70 dark:text-brand-secondary-400/70 mt-0.5">
                          Sign in to manage orders
                        </span>
                      </div>
                    </NavLink>
                  )}
                </div>
              </div>

              {/* Social Footer */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center justify-center gap-6 mb-3">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${COMPANY_CONTACTS.WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-brand-secondary-500 transition-all hover:scale-110 active:scale-95"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                  </a>
                  {/* TikTok */}
                  <a
                    href={SOCIAL_LINKS.TIKTOK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-brand-secondary-500 transition-all hover:scale-110 active:scale-95"
                  >
                    <TikTokIcon className="w-5 h-5" />
                  </a>
                  {/* Instagram */}
                  <a
                    href={SOCIAL_LINKS.INSTAGRAM}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-brand-secondary-500 transition-all hover:scale-110 active:scale-95"
                  >
                    <InstagramIcon className="w-5 h-5" />
                  </a>
                  {/* Facebook */}
                  <a
                    href={SOCIAL_LINKS.FACEBOOK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-brand-secondary-500 transition-all hover:scale-110 active:scale-95"
                  >
                    <FacebookIcon className="w-5 h-5" />
                  </a>
                </div>
                <div className="space-y-1">
                  <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-logo uppercase tracking-widest">
                    SHERO
                  </p>
                  <p className="text-center text-[9px] text-slate-400 dark:text-slate-600 font-medium">
                    Premium Tech & Modern Solutions
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </>
  );
};

export default Nav;
