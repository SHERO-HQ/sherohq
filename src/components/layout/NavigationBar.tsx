"use client";
import { useEffect, useRef, useState } from "react";
import { ToggleTheme } from "./toggle-theme";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useReducedMotion} from "@/hooks/useReducedMotion";
import { usePathname } from "next/navigation";
import { LogOut, ShoppingCart, User, Heart } from "lucide-react";
import NavLink from "@/components/common/NavLink";

import { AnimatePresence, easeOut, motion } from "motion/react";
import { navLinkClass, navLinkClassVariant } from "@/lib/utils";
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
 initial: { scaleY: 0, opacity: 0 },
 animate: {
 scaleY: 1,
 opacity: 1,
 transition: {
 duration: 0.4,
 ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
 }, // Custom ease for smoother reveal
 },
 exit: {
 scaleY: 0,
 opacity: 0,
 transition: {
 duration: 0.3,
 ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
 },
 },
 };

 const navLinks = ["Shop", "Solutions", "Consultation", "About Us"];
 const linkVars = {
 initial: { y: 20, opacity: 0 },
 animate: (i: number) => ({
 y: 0,
 opacity: 1,
 transition: { delay: 0.1 + i * 0.05, duration: 0.4, ease: easeOut },
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
 focusables?.[0]?.focus();
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
			const navLinks = ["Shop", "Solutions", "Consultation", "About Us"];
			let found = -1;

			navLinks.forEach((item, index) => {
				const linkPath = `/${item.toLowerCase().replace(" ", "-")}`;
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

			setActiveNavIndex(found);
		}
	}, [pathname, mounted]);

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
 <div className="flex justify-between items-center h-16 lg:h-20">
 {/* Logo */}
 <NavLink
 href={homeHref}
 className="flex items-center z-50"
 onClick={() => setIsOpen(false)}
 >
 {/* Mobile & Desktop Logos */}
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

 {/* Center Navigation Links - Centered Absolutely on Desktop */}
 <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-10 pointer-events-none">
 <ul
 ref={navMenuRef}
 className="flex items-center gap-6 relative pointer-events-auto"
 suppressHydrationWarning
 >
 {navLinks.map((item) => (
 <li key={item} suppressHydrationWarning>
 <NavLink
 className={({ isActive }) => navLinkClass(isActive)}
 href={getAbsoluteUrl(
 `/${item.toLowerCase().replace(" ", "-")}`,
 )}
 >
 {item}
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

 {/* Right Groups Wrapper - Action Buttons */}
 <div className="flex items-center gap-2 lg:gap-4 ml-auto z-20">
 {/* Shopping & Account Actions Pill */}
 <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-50 border border-slate-200 dark:bg-slate-800/80 dark:border-slate-700/80 rounded transition-colors">
 {/* Search */}
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

 {/* Vertical Divider */}
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

 {/* Dropdown Menu (Only when authenticated) */}
 {mounted && isAuthenticated && isUserMenuOpen && (
 <div
 id="desktop-user-menu"
 role="menu"
 aria-label="User menu"
 onKeyDown={(event) => {
 const menu = userMenuRef.current;
 if (!menu) return;

 const items = Array.from(
 menu.querySelectorAll<HTMLElement>(
 '[role="menuitem"], a[href], button:not([disabled])',
 ),
 );

 if (!items.length) return;

 const currentIndex = items.indexOf(
 document.activeElement as HTMLElement,
 );

 if (event.key === "Escape") {
 event.preventDefault();
 setIsUserMenuOpen(false);
 userMenuButtonRef.current?.focus();
 return;
 }

 if (event.key === "ArrowDown") {
 event.preventDefault();
 const nextIndex =
 currentIndex < items.length - 1
 ? currentIndex + 1
 : 0;
 items[nextIndex]?.focus();
 return;
 }

 if (event.key === "ArrowUp") {
 event.preventDefault();
 const prevIndex =
 currentIndex > 0
 ? currentIndex - 1
 : items.length - 1;
 items[prevIndex]?.focus();
 return;
 }

 if (event.key === "Home") {
 event.preventDefault();
 items[0]?.focus();
 return;
 }

 if (event.key === "End") {
 event.preventDefault();
 items[items.length - 1]?.focus();
 }
 }}
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

 {/* Theme Settings Pill */}
 <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-50 border border-slate-200 dark:bg-slate-800/80 dark:border-slate-700/80 rounded transition-colors">
 <ToggleTheme />
 </div>

 {/* Mobile Actions Overlay Trigger */}
 <div className="flex items-center lg:hidden">
 {/* Hamburger Button */}
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

 {/* Mobile Menu Overlay */}
 <AnimatePresence>
 {isOpen && (
 <>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setIsOpen(false)}
 className="cursor-pointer fixed inset-0 top-16 bg-black/20 dark:bg-black/40 backdrop-blur-sm lg:hidden z-40"
 />

 {/* Menu Panel */}
 <motion.div
 ref={mobileMenuRef}
 variants={menuVars}
 initial="initial"
 animate="animate"
 exit="exit"
 className="fixed top-16 left-0 w-full h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-b border-t border-slate-200 dark:border-slate-800 shadow-lg overflow-y-auto origin-top lg:hidden z-50 p-4"
 id="mobile-nav-menu"
 >
 {/* Nav Links */}
 <div className="mb-6">
 <SearchBar className="mb-4" alwaysOpen={true} />
 </div>
 <ul className="space-y-1 mb-8">
 {navLinks.map((item, i) => (
 <motion.li
 key={item}
 custom={i}
 variants={linkVars}
 initial="initial"
 animate="animate"
 >
 <NavLink
 className={({ isActive }) =>
 navLinkClassVariant(isActive, "mobile")
 }
 href={getAbsoluteUrl(
 `/${item.toLowerCase().replace(" ", "-")}`,
 )}
 onClick={() => setIsOpen(false)}
 >
 {item}
 </NavLink>
 </motion.li>
 ))}
 </ul>

 {/* Mobile Profile Section */}
 <div className="pt-6 mb-8 border-t border-slate-200 dark:border-slate-800">
 {mounted && isAuthenticated ? (
 <div className="space-y-4">
 <div className="flex items-center gap-3 px-2">
 <div className="w-10 h-10 rounded font-bold bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xl text-white shrink-0 ">
 {user?.name?.charAt(0)}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-base font-bold text-slate-900 dark:text-white truncate">
 {user?.name}
 </p>
 <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
 {user?.email}
 </p>
 </div>
 </div>
 <div className="grid grid-cols-1 gap-2">
 <NavLink
 href={getAbsoluteUrl("/profile")}
 onClick={() => setIsOpen(false)}
 className="flex items-center gap-3 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded transition duration-200 group/item"
 >
 <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 group-hover/item:bg-emerald-100 dark:group-hover/item:bg-emerald-900/30 transition-colors">
 <User className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400" />
 </div>
 <span className="font-semibold">
 Profile & Orders
 </span>
 </NavLink>
 <button
 onClick={() => {
 logout();
 setIsOpen(false);
 }}
 className="flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition duration-200 group/logout"
 >
 <div className="p-2 rounded bg-red-50 dark:bg-red-900/10 group-hover/logout:bg-red-100 dark:group-hover/logout:bg-red-900/30 transition-colors">
 <LogOut className="w-5 h-5" />
 </div>
 <span className="font-semibold">Logout</span>
 </button>
 </div>
 </div>
 ) : (
 <NavLink
 href={getAbsoluteUrl("/login")}
 onClick={() => setIsOpen(false)}
 className="flex items-center gap-4 px-5 py-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded transition duration-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 group"
 >
 <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
 <User className="w-6 h-6" />
 </div>
 <div className="flex-1">
 <span className="block font-bold text-base">
 Login / Register
 </span>
 <span className="block text-xs text-emerald-600/70 dark:text-emerald-400/70">
 Access your account & orders
 </span>
 </div>
 </NavLink>
 )}
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </nav>

 {/* Bottom Nav */}
 <BottomNav />
 </>
 );
};

export default Nav;
