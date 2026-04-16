"use client";
import { useEffect, useRef, useState } from "react";
import { ToggleTheme } from "./toggle-theme";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useReducedMotion} from "@/hooks/useReducedMotion";
import { usePathname } from "next/navigation";
import { LogOut, ShoppingCart, User, Heart, ShoppingBag, Cpu, MessageSquare, Info, Facebook, Instagram, X } from "lucide-react";
import NavLink from "@/components/common/NavLink";

import { AnimatePresence, easeOut, motion } from "motion/react";
import { navLinkClass, navLinkClassVariant } from "@/lib/utils";
import { WhatsAppIcon, TikTokIcon, InstagramIcon, FacebookIcon } from "@/assets/icons/icons";
import BottomNav from "./BottomNav";
import SearchBar from "./SearchBar";
import { Badge } from "@/components/ui/badge";
import { getAbsoluteUrl } from "@/utils/subdomain";

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

  // Animation variants
  const menuVars = {
    initial: { x: "-100%", opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
    exit: {
      x: "-100%",
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  const navLinks = [
    { name: "Shop", icon: ShoppingBag, desc: "Explore catalog", href: "/shop" },
    { name: "Solutions", icon: Cpu, desc: "Business innovations", href: "/solutions" },
    { name: "Consultation", icon: MessageSquare, desc: "Expert tech advice", href: "/consultations" },
    { name: "About Us", icon: Info, desc: "Our mission", href: "/about" },
  ];

  const linkVars = {
    initial: { x: -20, opacity: 0 },
    animate: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: { delay: 0.15 + i * 0.05, duration: 0.4, ease: easeOut },
    }),
  };

  // Lock body scroll when mobile menu is open (with scrollbar compensation)
  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight =
        scrollBarWidth > 0 ? `${scrollBarWidth}px` : "";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Keep keyboard focus within navigation flow on mobile menu open/close.
  useEffect(() => {
    if (isOpen) {
      const focusables = mobileMenuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      
      // Try to find the first navigation link to avoid auto-focusing the search bar input on mobile
      const firstLink = mobileMenuRef.current?.querySelector<HTMLElement>('a[href]');
      if (firstLink) {
        firstLink.focus();
      } else {
        focusables?.[0]?.focus();
      }
    } else if (previousIsOpenRef.current) {
      mobileMenuButtonRef.current?.focus();
    }

    previousIsOpenRef.current = isOpen;
  }, [isOpen]);

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
          if (pathname === url.pathname) {
            found = index;
          }
        } catch {
          if (pathname === linkPath) {
            found = index;
          }
        }
      });

      // Avoid calling setState synchronously in effect body
      if (activeNavIndex !== found) {
        queueMicrotask(() => setActiveNavIndex(found));
      }
    }
  }, [pathname, mounted, activeNavIndex]);

  // Measure indicator dimensions for active link
  useEffect(() => {
    if (activeNavIndex !== null && activeNavIndex >= 0 && navMenuRef.current) {
      const children = Array.from(navMenuRef.current.children) as HTMLElement[];
      const activeElement = children[activeNavIndex];

      if (activeElement) {
        const width = activeElement.clientWidth;
        const x = children
          .slice(0, activeNavIndex)
          .reduce((sum, el) => sum + el.clientWidth + 24, 0); // 24px because of gap-6
        setIndicatorDims({ width, x });
      }
    } else {
      setIndicatorDims({ width: 0, x: 0 });
    }
  }, [activeNavIndex]);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition duration-300 ${isOpen || scrolled ? "bg-background/80 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-800" : "bg-transparent"}`}
        aria-label="main navigation"
        id="nav-menu"
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 lg:h-20">
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
            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-10 pointer-events-none">
              <ul
                ref={navMenuRef}
                className="flex items-center gap-6 relative pointer-events-auto"
                suppressHydrationWarning
              >
                {navLinks.map((item) => (
                  <li key={item.name} suppressHydrationWarning>
                    <NavLink
                      className={({ isActive }) => navLinkClass(isActive)}
                      href={getAbsoluteUrl(item.href)}
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}

                {/* Active Link Indicator */}
                {activeNavIndex !== null && activeNavIndex >= 0 && (
                  <motion.div
                    className="absolute -bottom-1 h-0.5 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-full"
                    initial={false}
                    animate={{
                      width: indicatorDims.width,
                      x: indicatorDims.x,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
              </ul>
            </div>

            {/* Right Groups Wrapper */}
            <div className="flex items-center gap-2 lg:gap-4 ml-auto z-20">
              <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-50 border border-slate-200 dark:bg-slate-800/80 dark:border-slate-700/80 rounded transition-colors">
                <SearchBar className="hidden lg:flex h-9 items-center justify-center text-slate-600 dark:text-slate-400" />

                {/* Wishlist Button */}
                <button
                  onClick={() => setIsWishlistOpen(true)}
                  className="cursor-pointer relative p-2 h-9 w-9 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded border-none"
                  aria-label="Open Wishlist"
                >
                  <Heart className={`w-5 h-5 ${mounted && wishlist.length > 0 ? "fill-red-500 text-red-500" : ""}`} />
                  {mounted && wishlist.length > 0 && (
                    <Badge
                      variant="destructive"
                      className={`absolute -top-1.5 -right-1.5 h-[18px] min-w-[18px] px-1 flex items-center justify-center rounded-full text-[9px] ring-2 ring-background ${!prefersReducedMotion ? "animate-in zoom-in" : ""}`}
                    >
                      {wishlist.length}
                    </Badge>
                  )}
                </button>

                {/* Cart Button */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="cursor-pointer relative p-2 h-9 w-9 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded border-none"
                  aria-label="Open Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {mounted && totalQuantity > 0 && (
                    <Badge
                      variant="emerald"
                      className={`absolute -top-1.5 -right-1.5 h-[18px] min-w-[18px] px-1 flex items-center justify-center rounded-full text-[9px] ring-2 ring-background ${!prefersReducedMotion ? "animate-in zoom-in" : ""}`}
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
                      <div className="w-7 h-7 rounded font-bold bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xs text-white shrink-0 shadow-sm">
                        {user?.name?.charAt(0)}
                      </div>
                    </button>
                  ) : (
                    <NavLink
                      href={getAbsoluteUrl("/login")}
                      className="cursor-pointer flex items-center justify-center h-9 w-9 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded"
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
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded shadow-lg border border-slate-200 dark:border-slate-800 py-1 transition duration-200 z-50"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
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

              <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-50 border border-slate-200 dark:bg-slate-800/80 dark:border-slate-700/80 rounded transition-colors">
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
                      d={isOpen ? "M18 6L6 18M6 6L18 18" : "M5 17H13M5 12H19M11 7H19"}
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
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Menu Panel (Drawer) */}
            <motion.div
              ref={mobileMenuRef}
              variants={menuVars}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute top-0 left-0 w-[65%] sm:w-[400px] h-full bg-white dark:bg-slate-950 shadow-2xl flex flex-col overflow-hidden"
              id="mobile-nav-menu"
            >
              {/* Top Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2">
                  <img src="/assets/logo/shero.svg" alt="" className="h-8 w-auto" />
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

                <div className="space-y-4">
                  <ul className="space-y-3">
                    {navLinks.map((item, i) => (
                      <motion.li
                        key={item.name}
                        custom={i}
                        variants={linkVars}
                        initial="initial"
                        animate="animate"
                      >
                        <NavLink
                          href={getAbsoluteUrl(item.href)}
                          onClick={() => setIsOpen(false)}
                          className={({ isActive }) =>
                            `group flex items-center gap-4 p-3 rounded transition-all duration-300 ${
                              isActive
                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                                : "hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300"
                            }`
                          }
                        >
                          <div className={`p-2.5 rounded shrink-0 transition-all duration-300 flex items-center justify-center ${
                            pathname === item.href
                              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                              : "bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                          }`}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block font-bold text-sm leading-tight tracking-tight">{item.name}</span>
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{item.desc}</span>
                          </div>
                        </NavLink>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Profile Section */}
                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800/50">
                  {mounted && isAuthenticated ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                        <div className="w-12 h-12 rounded font-bold bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xl text-white shadow-lg shadow-emerald-500/20">
                          {user?.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-bold text-slate-900 dark:text-white truncate">
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
                          <User className="w-5 h-5 text-slate-400 group-hover/item:text-emerald-500" />
                          <span className="font-bold text-[11px]">Profile</span>
                        </NavLink>
                        <button
                          onClick={() => {
                            logout();
                            setIsOpen(false);
                          }}
                          className="flex flex-col items-center justify-center gap-2 p-3 text-red-600 dark:text-red-400 bg-red-50/30 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 rounded transition-all group/logout shadow-sm"
                        >
                          <LogOut className="w-5 h-5 opacity-70 group-hover/logout:opacity-100" />
                          <span className="font-bold text-[11px]">Logout</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <NavLink
                      href={getAbsoluteUrl("/login")}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 p-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 rounded transition-all duration-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800/50 group shadow-sm shadow-emerald-500/5"
                    >
                      <div className="w-8 h-8 rounded bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span className="block font-extrabold text-[15px] tracking-tight">Login</span>
                        <span className="block text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
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
                  <a href="https://wa.me/233598925501" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-500 transition-all hover:scale-110 active:scale-95">
                    <WhatsAppIcon className="w-5 h-5" />
                  </a>
                  {/* TikTok */}
                  <a href="https://tiktok.com/@sherohq" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-500 transition-all hover:scale-110 active:scale-95">
                    <TikTokIcon className="w-5 h-5" />
                  </a>
                  {/* Instagram */}
                  <a href="https://instagram.com/sherohq" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-500 transition-all hover:scale-110 active:scale-95">
                    <InstagramIcon className="w-5 h-5" />
                  </a>
                  {/* Facebook */}
                  <a href="https://facebook.com/sherohq" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-500 transition-all hover:scale-110 active:scale-95">
                    <FacebookIcon className="w-5 h-5" />
                  </a>
                </div>
                <div className="space-y-1">
                  <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
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
