import SheroLogo from "@/assets/logo/shero.svg";
import SheroLogoLight from "@/assets/logo/shero-light.svg";
import SheroLogoDark from "@/assets/logo/shero-dark.svg";
import { useEffect, useState } from "react";
import { ToggleTheme } from "./toggle-theme";
import { NavLink } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

import { AnimatePresence, easeIn, easeOut, motion } from "motion/react";
import { navLinkClass, navLinkClassVariant } from "@/lib/utils";
import BottomNav from "./BottomNav";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalQuantity, setIsCartOpen } = useCart();

  // Animation variants
  const menuVars = {
    initial: { scaleY: 0, opacity: 0 },
    animate: {
      scaleY: 1,
      opacity: 1,
      transition: { duration: 0.3, ease: easeOut },
    },
    exit: {
      scaleY: 0,
      opacity: 0,
      transition: { duration: 0.2, ease: easeIn },
    },
  };

  const navLinks = ["Products", "Solutions", "Consultation", "About Us"];
  const linkVars = {
    initial: { y: 20, opacity: 0 },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay: 0.1 * i, duration: 0.3 },
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
              ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-lg border-b border-slate-200 dark:border-slate-800"
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

            {/* Desktop Menu */}
            <ul className="hidden lg:flex items-center gap-8">
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

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <NavLink
                to="/contact-us"
                className="group inline-flex items-center gap-2 
                         text-white bg-emerald-600 dark:bg-emerald-500
                         px-6 py-2 rounded font-semibold text-sm
                         hover:bg-emerald-700 dark:hover:bg-emerald-600 
                         hover:shadow-lg hover:shadow-emerald-500/25
                         hover:gap-3
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
            </div>

            {/* Global Actions (Always Visible) */}
            <div className="flex items-center gap-2 lg:gap-4 ml-auto lg:ml-0 mr-4 lg:mr-0">
              <ToggleTheme />

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                aria-label="Open Cart"
              >
                <ShoppingCart className="w-6 h-6" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-in zoom-in">
                    {totalQuantity}
                  </span>
                )}
              </button>
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
                className="fixed inset-0 top-16 bg-black/20 dark:bg-black/40 backdrop-blur-sm lg:hidden z-40"
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
                               px-6 py-3 rounded-lg font-semibold
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
