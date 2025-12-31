import SheroLogo from "../assets/logo/shero.svg";
import SheroLogoFull from "../assets/logo/shero-full.svg";
import { useEffect, useState } from "react";
import { ToggleTheme } from "./toggle-theme";
import { NavLink } from "react-router-dom";
// import { navLinkClass } from "@/lib/utils";
import { AnimatePresence, easeIn, easeOut, motion } from "motion/react";
import { navLinkClass } from "@/lib/utils";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  const navLinks = ["About Us", "Solutions", "Resources", "Services"];

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
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300
        ${isOpen || scrolled 
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
            <img 
              src={SheroLogo} 
              alt="SHERO" 
              className="h-10 w-auto md:hidden" 
            />
            <img
              src={SheroLogoFull}
              alt="SHERO"
              className="h-10 w-auto hidden md:block"
            />
          </NavLink>

          {/* Desktop Menu */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((item) => (
              <li key={item}>
                <NavLink
                  className={({ isActive }) =>  navLinkClass(isActive)}
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
              to="/explore"
              className="group inline-flex items-center gap-2 
                       text-slate-200 dark:text-slate-800 bg-emerald-600 dark:bg-emerald-500
                       px-6 py-2 rounded font-semibold text-sm
                       hover:bg-emerald-700 dark:hover:bg-emerald-600 
                       hover:shadow-lg hover:shadow-emerald-500/25
                       hover:gap-3
                       transition-all duration-300"
            >
              <span>Explore</span>
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
            <ToggleTheme />
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-3 lg:hidden">
            <ToggleTheme />
            
            {/* Hamburger Button */}
            <button
              className={`relative w-10 h-10 rounded-lg flex items-center justify-center
                       transition-colors duration-200 cursor-pointer
                       ${isOpen
                         ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-400"
                         : "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-300 border"
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
              className="fixed top-16 left-0 w-full 
                       bg-white dark:bg-slate-900 
                       border-b border-slate-200 dark:border-slate-800
                       shadow-2xl overflow-hidden origin-top lg:hidden z-50"
              id="mobile-nav-menu"
            >
              <div className="container max-w-7xl mx-auto px-4 py-8">
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
                          `block py-3 px-4 rounded-lg text-base font-medium transition-colors
                          ${isActive
                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`
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
                    to="/explore"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center gap-2 
                             text-slate-800 bg-emerald-600 dark:bg-emerald-500
                             px-6 py-2 rounded font-semibold
                             hover:bg-emerald-700 dark:hover:bg-emerald-600 hover:text-slate-100
                             transition-all duration-300"
                  >
                    <span>Explore Services</span>
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Nav;