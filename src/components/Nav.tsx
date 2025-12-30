import SheroLogo from "../assets/logo/shero.svg";
import SheroLogoFull from "../assets/logo/shero-full.svg";
import { useEffect, useState } from "react";
import { ToggleTheme } from "./toggle-theme";
import { NavLink } from "react-router-dom";
import { navLinkClass } from "@/lib/utils";
import { AnimatePresence, easeIn, easeOut, motion } from "motion/react";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = isOpen ? "0.5rem" : "";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Scroll effect for nav background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20); // change threshold as needed
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50
         ${isOpen ? "bg-slate-200 dark:bg-[#020617]" : scrolled ? "backdrop-blur-md bg-slate-200/10 dark:bg-[#20617]" : "bg-transparent"}
  transition-all duration-300 ease-in-out`}
      aria-label="main"
      id="nav-menu"
    >
      <div
        className={`container mx-auto w-full flex justify-between p-5 relative z-50  transition-all duration-300`}
      >
        {/* logo */}
        {/* <div className="max-w-11/12"> */}
        <NavLink to={`/`} className="logo">
          <img src={SheroLogo} alt="SHERO" className="w-10 md:hidden block" />
          <img
            src={SheroLogoFull}
            alt="SHERO"
            className="w-32 hidden md:block"
          />
        </NavLink>

        {/* Mobile Actions (Theme + Burger) */}
        <div className="flex items-center lg:hidden">
          <div className=" me-2">
            <ToggleTheme />
          </div>

          <button
            className={` ${
              isOpen
                ? "text-red-500 border-red-300"
                : "dark:text-slate-200 text-slate-800 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
            } border rounded-md p-[0.2rem] cursor-pointer transition-colors duration-300`}
            type="button"
            title="menu"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-menu"
          >
            <div className="relative size-7 flex justify-center items-center">
              {/* Animated Icon Switching */}
              {/* <motion.div
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
              </motion.div> */}

              <motion.svg
                width={28}
                height={28}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ rotate: isOpen ? 90 : 0 }}
              >
                <motion.path

                  d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18"
                  animate={
                    isOpen
                      ? { d: "M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" }
                      : { d: "M5 17H13M5 12H19M11 7H19" }
                  }
                />
              </motion.svg>
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
        <div className="me-2 hidden lg:flex items-center gap-5">
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
              className="fixed inset-0 top-22 bg-white/40 dark:bg-black/30 backdrop-blur-md lg:hidden z-30"
            />
            <motion.div
              variants={menuVars}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed top-22 left-0 w-full bg-slate-200 dark:bg-[#020617] border-b-2 border-blue-950/10 dark:border-slate-800 shadow-xl overflow-hidden origin-top lg:hidden z-50"
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
                    className="flex w-full items-center justify-center gap-2 text-gray-100 bg-secondary px-6 py-2 rounded hover:bg-secondary/90 transition-all"
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
