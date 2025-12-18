import { useEffect, useState } from "react";
import { ToggleTheme } from "./toggle-theme";
import { NavLink } from "react-router-dom";
import { navLinkClass } from "@/lib/utils";
import { AnimatePresence, easeIn, easeOut, motion } from "motion/react"; // Ensure correct import for your version

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Animation variants for the menu container
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

  // Animation for individual links to stagger in
  const linkVars = {
    initial: { y: 20, opacity: 0 },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay: 0.1 * i },
    }),
  };

  useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }
}, [isOpen]);

  return (
    <nav
      className="bg-slate-50 dark:bg-black fixed top-0 w-full border-b-2 border-blue-950/30 dark:border-slate-900 shadow z-50"
      aria-label="main"
      id="nav-menu"
    >
      <div className="container mx-auto w-full flex justify-between p-5 relative z-50 bg-slate-50 dark:bg-black">
        {/* logo */}
        {/* <div className="max-w-11/12"> */}
        <NavLink to={`/`} className="logo">
          <img
            src="../../public/shero.svg"
            alt="SHERO"
            className="w-10 md:hidden block"
          />
          <img
            src="../../public/shero-full.svg"
            alt="SHERO"
            className="w-32 hidden md:block"
          />
        </NavLink>

        {/* Mobile Actions (Theme + Burger) */}
        <div className="flex items-center lg:hidden">
          <div className="theme me-3">
            <ToggleTheme />
          </div>

          <button
            className={` ${
              isOpen
                ? "text-red-500 border-red-300"
                : "dark:text-slate-200 text-slate-800"
            } border rounded-md p-1 cursor-pointer transition-colors duration-300`}
            type="button"
            title="menu"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-menu"
          >
            <div className="relative size-7 flex justify-center items-center">
              {/* Animated Icon Switching */}
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 1 : 0 }}
                className="absolute inset-0"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-7">
                  <path
                    d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>

              <motion.div
                animate={{ rotate: isOpen ? -90 : 0, opacity: isOpen ? 0 : 1 }}
                className="absolute inset-0"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-7">
                  <path
                    d="M5 17H13M5 12H19M11 7H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            </div>
          </button>
        </div>

        {/* Desktop Menu */}
        <ul className="lg:flex items-center gap-5 hidden">
          {["About Us", "Solutions", "Resources", "Services"].map((item) => (
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
        <div className="theme me-3 hidden lg:flex items-center gap-5">
          <div className="explore flex items-center">
            <NavLink
              className="inline-flex items-center gap-2 text-gray-100 bg-secondary px-6 py-1 rounded hover:bg-secondary/90 hover:shadow-lg hover:gap-3 active:translate-y-0 transition-all duration-500 ease-in-out"
              to="explore"
            >
              Explore
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </NavLink>
          </div>
          <ToggleTheme />
        </div>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isOpen && (
          <>
          <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 top-25 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md lg:hidden z-30" 
      />
            <motion.div
              variants={menuVars}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed top-24 left-0 w-full bg-slate-50 dark:bg-black border-b-2 border-blue-950/10 dark:border-slate-800 shadow-xl overflow-hidden origin-top lg:hidden z-50"
              id="mobile-nav-menu"
            >
              <div className="container mx-auto p-6 flex flex-col gap-6">
                <ul className="flex flex-col gap-3  font-medium">
                  {["About Us", "Solutions", "Resources", "Services"].map(
                    (item, i) => (
                      <motion.li
                        key={item}
                        custom={i}
                        variants={linkVars}
                        initial="initial"
                        animate="animate"
                      >
                        <NavLink
                          className={({ isActive }) =>
                            `block py-2 px-3 rounded-md hover:bg-slate-200 dark:hover:bg-slate-900 transition-colors ${
                              isActive
                                ? "text-secondary font-bold"
                                : "text-slate-600 dark:text-slate-300"
                            }`
                          }
                          to={`/${item.toLowerCase().replace(" ", "-")}`}
                          onClick={() => setIsOpen(false)} // Close menu on click
                        >
                          {item}
                        </NavLink>
                      </motion.li>
                    )
                  )}
                </ul>

                {/* Mobile Explore Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                  className=" border-slate-200 dark:border-slate-800"
                >
                  <NavLink
                    to="/explore"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center gap-2 text-gray-100 bg-secondary px-6 py-2 rounded-lg hover:bg-secondary/90 transition-all"
                  >
                    Explore Services
                    <svg
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
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
