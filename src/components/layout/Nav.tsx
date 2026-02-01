import SheroLogo from "@/assets/logo/shero.svg";
import SheroLogoLight from "@/assets/logo/shero-light.svg";
import SheroLogoDark from "@/assets/logo/shero-dark.svg";
import { useEffect, useState } from "react";
import { ToggleTheme } from "./toggle-theme";
import { NavLink } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { LogOut, ShoppingCart, User } from "lucide-react";

import { AnimatePresence, easeOut, motion } from "motion/react";
import { navLinkClass, navLinkClassVariant } from "@/lib/utils";
import BottomNav from "./BottomNav";
import SearchBar from "./SearchBar";
import { Badge } from "@/components/ui/badge";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalQuantity, setIsCartOpen } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

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

  const navLinks = ["Products", "Solutions", "Consultation", "About Us"];
  const linkVars = {
    initial: { y: 20, opacity: 0 },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay: 0.1 + i * 0.05, duration: 0.4, ease: easeOut },
    }),
  };

  // Lock body scroll when menu open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0.5rem";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "";
    }
  }, [isOpen]);

  // Scroll effect for nav background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300
          ${
            isOpen || scrolled
              ? "bg-background/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800"
              : "bg-transparent"
          }`}
        aria-label="main navigation"
        id="nav-menu"
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <NavLink to="/" className="flex items-center z-50">
              {/* Mobile Logos */}
              <div className="md:hidden">
                <img
                  src={SheroLogo}
                  alt="SHERO Logo"
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-auto dark:block hidden"
                />
                <img
                  src={SheroLogo}
                  alt="SHERO Logo"
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-auto dark:hidden block"
                />
              </div>

              {/* Desktop Logos */}
              <div className="hidden md:block">
                <img
                  src={SheroLogoLight}
                  alt="SHERO Logo"
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-auto dark:block hidden"
                />
                <img
                  src={SheroLogoDark}
                  alt="SHERO Logo"
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-auto dark:hidden block"
                />
              </div>
            </NavLink>

            {/* Right Groups Wrapper */}
            <div className="flex items-center gap-2 lg:space-x-4 ml-auto">
              {/* Desktop Menu */}
              <ul className="hidden lg:flex items-center gap-3">
                {navLinks.map((item) => (
                  <li key={item}>
                    <NavLink
                      className={({ isActive }) => navLinkClass(isActive)}
                      to={`/${item.toLowerCase().replace(" ", "-")}`}
                    >
                      {item}
                    </NavLink>
                  </li>
                ))}
              </ul>

              {/* Global Actions */}
              <div className="flex items-center gap-2 mr-2">
                {/* Search */}
                <SearchBar className="hidden lg:block" />

                {/* Contact Us - Desktop Only */}
                <NavLink
                  to="/contact-us"
                  className="hidden lg:inline-flex group items-center gap-1 
                           text-white dark:text-slate-900 bg-emerald-600 dark:bg-emerald-500
                           px-6 py-2 rounded font-semibold text-sm
                           hover:bg-emerald-700 dark:hover:bg-emerald-600 
                           hover:shadow-lg hover:shadow-emerald-500/25
                           hover:gap-0.5
                           transition-all duration-300"
                >
                  <span>Contact Us</span>
                  <svg
                    className="w-4 h-4 transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" />
                  </svg>
                </NavLink>

                {/* Cart Button */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="cursor-pointer relative p-1 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded border-none"
                  aria-label="Open Cart"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {totalQuantity > 0 && (
                    <Badge
                      variant="emerald"
                      className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full text-[10px] ring-2 ring-background animate-in zoom-in"
                    >
                      {totalQuantity}
                    </Badge>
                  )}
                </button>

                {/* User Dropdown */}
                <div className="hidden lg:block relative group">
                  {isAuthenticated ? (
                    <button className="cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <span className="sr-only">User Menu</span>
                      <div className="w-8 h-8 rounded  font-sora font-bold bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-sm text-white shrink-0 shadow">
                        {user?.name?.charAt(0)}
                      </div>
                    </button>
                  ) : (
                    <NavLink
                      to="/login"
                      className="cursor-pointer p-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors block"
                      aria-label="Login"
                    >
                      <User className="w-6 h-6" />
                    </NavLink>
                  )}

                  {/* Dropdown Menu (Only when authenticated) */}
                  {isAuthenticated && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded shadow-lg border border-slate-200 dark:border-slate-800 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-bold font-sora text-slate-900 dark:text-white line-clamp-1">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {user?.email}
                        </p>
                      </div>
                      <NavLink
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <User className="w-4 h-4" /> Profile & Orders
                      </NavLink>
                      <button
                        onClick={() => logout()}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                <ToggleTheme />
              </div>

              {/* Mobile Actions Overlay Trigger */}
              <div className="flex items-center lg:hidden">
                {/* Hamburger Button */}
                <button
                  className={`relative w-9 h-9 rounded flex items-center justify-center
                           transition-colors duration-200 cursor-pointer shadow
                           ${
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
                  <motion.svg
                    width={25}
                    height={25}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.path
                      animate={
                        isOpen
                          ? { d: "M18 6L6 18M6 6L18 18" }
                          : { d: "M5 17H13M5 12H19M11 7H19" }
                      }
                      transition={{ duration: 0.3 }}
                    />
                  </motion.svg>
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
                variants={menuVars}
                initial="initial"
                animate="animate"
                exit="exit"
                className="fixed top-16 left-0 w-full h-[calc(100vh-4rem)]
                         bg-white dark:bg-slate-900 
                         border-b border-t border-slate-200 dark:border-slate-800
                         shadow-2xl overflow-y-auto origin-top lg:hidden z-50 p-4"
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
                        to={`/${item.toLowerCase().replace(" ", "-")}`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item}
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>

                {/* Mobile Profile Section */}
                <div className="pt-6 mb-8 border-t border-slate-200 dark:border-slate-800">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded  font-sora font-bold bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xl text-white shrink-0 ">
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
                          to="/profile"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded transition-all duration-200 group/item"
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
                          className="flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all duration-200 group/logout"
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
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 px-5 py-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded transition-all duration-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <span className="block font-bold text-lg">
                          Login / Register
                        </span>
                        <span className="block text-xs text-emerald-600/70 dark:text-emerald-400/70">
                          Access your account & orders
                        </span>
                      </div>
                    </NavLink>
                  )}
                </div>

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                >
                  <NavLink
                    to="/contact-us"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center gap-2 
                               text-white bg-emerald-600 dark:bg-emerald-500
                               px-6 py-2 rounded font-semibold
                               hover:bg-emerald-700 dark:hover:bg-emerald-600
                               transition-all duration-300 shadow-lg shadow-emerald-500/25"
                  >
                    <span>Contact Us</span>
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12H19M19 12L13 6M19 12L13 18" />
                    </svg>
                  </NavLink>
                </motion.div>
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
