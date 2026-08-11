"use client";

import React from "react";
import { User, LogOut } from "lucide-react";
import NavLink from "@/components/common/NavLink";
import { getAbsoluteUrl } from "@/utils/subdomain";

interface DesktopUserMenuProps {
  userMenuRef: React.RefObject<HTMLDivElement | null>;
  userMenuButtonRef: React.RefObject<HTMLButtonElement | null>;
  mounted: boolean;
  isAuthenticated: boolean;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: { name?: string; email?: string } | undefined | null;
  logout: () => void;
}

export function DesktopUserMenu({
  userMenuRef,
  userMenuButtonRef,
  mounted,
  isAuthenticated,
  isUserMenuOpen,
  setIsUserMenuOpen,
  user,
  logout,
}: DesktopUserMenuProps) {
  return (
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
            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
