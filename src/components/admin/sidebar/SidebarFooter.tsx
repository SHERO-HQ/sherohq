"use client";
import React from "react";
import { Download, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import AppImage from "@/components/common/AppImage";

interface SidebarFooterProps {
  isOpen: boolean;
  admin: any;
  logout: () => void;
  pwaPrompt: any;
  handleInstallClick: () => Promise<void>;
}

export function SidebarFooter({
  isOpen,
  admin,
  logout,
  pwaPrompt,
  handleInstallClick,
}: SidebarFooterProps) {
  return (
    <div className="p-3 border-t border-border space-y-2 shrink-0">

      <button
        onClick={() => logout()}
        className={cn(
          "w-full flex items-center px-3 py-3 rounded text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all group",
          isOpen ? "gap-3" : "gap-0 justify-center px-0",
        )}
      >
        <LogOut className="w-5 h-5 shrink-0" />
        <span
          className={cn(
            "font-medium text-sm whitespace-nowrap transition-all ",
            isOpen
              ? "opacity-100 translate-x-0 w-auto"
              : "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden",
          )}
        >
          Logout
        </span>
      </button>

      {/* Profile Summary */}
      <div
        className={cn(
          "flex items-center px-3 py-2 border border-border mt-4 rounded transition-all ",
          isOpen ? "gap-3" : "gap-0 justify-center px-0",
        )}
      >
        <div className={cn("relative w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden p-1 transition-all", isOpen ? "border-r border-border" : "border-r-0")}>
          {admin?.avatar ? (
            <AppImage
              src={admin.avatar}
              alt={admin.username}
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <div
          className={cn(
            "flex-1 min-w-0 transition-all ",
            isOpen
              ? "opacity-100 translate-x-0 w-auto"
              : "opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden",
          )}
        >
          <p className="text-sm font-semibold text-foreground truncate">
            {admin?.username?.toUpperCase() || "Admin"}
          </p>
          <p className="text-[10px] text-muted-foreground truncate capitalize font-medium">
            {admin?.role || "Administrator"}
          </p>
        </div>
      </div>
    </div>
  );
}
