"use client";

import React from "react";
import { AnimatePresence, m } from "motion/react";
import { X, User, LogOut } from "lucide-react";
import NavLink from "@/components/common/NavLink";
import SearchBar from "./SearchBar";
import { navLinkClassVariant } from "@/lib/utils";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { SOCIAL_LINKS } from "@/constants/socials";
import {
  WhatsAppIcon,
  TikTokIcon,
  InstagramIcon,
  FacebookIcon,
} from "@/assets/icons/icons";

interface MobileNavDrawerProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  mobileMenuRef: React.RefObject<HTMLDivElement | null>;
  menuVars: any;
  prefersReducedMotion: boolean;
  navLinks: Array<{
    name: string;
    icon: any;
    desc: string;
    href: string;
  }>;
  activeNavIndex: number | null;
  mounted: boolean;
  isAuthenticated: boolean;
  user: { name?: string; email?: string } | undefined | null;
  logout: () => void;
}

export function MobileNavDrawer({
  isOpen,
  setIsOpen,
  mobileMenuRef,
  menuVars,
  prefersReducedMotion,
  navLinks,
  activeNavIndex,
  mounted,
  isAuthenticated,
  user,
  logout,
}: MobileNavDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 lg:hidden">
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/75"
          />

          {/* Menu Panel (Drawer) */}
          <m.div
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
                              <m.div
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
                <a
                  href={`https://wa.me/${COMPANY_CONTACTS.WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-brand-secondary-500 transition-all hover:scale-110 active:scale-95"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                </a>
                <a
                  href={SOCIAL_LINKS.TIKTOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-brand-secondary-500 transition-all hover:scale-110 active:scale-95"
                >
                  <TikTokIcon className="w-5 h-5" />
                </a>
                <a
                  href={SOCIAL_LINKS.INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-brand-secondary-500 transition-all hover:scale-110 active:scale-95"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>
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
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
