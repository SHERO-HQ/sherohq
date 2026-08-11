"use client";
import React, { useState, useEffect, memo } from "react";
import { useAdminUser, useAdminLogout } from "@/hooks/queries/useAdminQuery";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from "motion/react";
import { useSupportTickets } from "@/hooks/queries/useSupport";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";

import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNav } from "./sidebar/SidebarNav";
import { SidebarFooter } from "./sidebar/SidebarFooter";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

type WindowWithPwaPrompt = Window & {
  __pwaPromptEvent?: BeforeInstallPromptEvent | null;
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const AdminSidebar = memo(({ isOpen, setIsOpen }: Readonly<SidebarProps>) => {
  const { data: adminData } = useAdminUser();
  const admin = adminData?.admin;
  const { mutateAsync: logout } = useAdminLogout();
  
  const { data: tickets } = useSupportTickets(ADMIN_POLLING_INTERVAL);
  const unresolvedSupportCount = tickets?.filter((t: any) => t.status?.toLowerCase() === "open" || t.status?.toLowerCase() === "pending").length || 0;

  const badges: Record<string, number | undefined> = {
    "Support": unresolvedSupportCount > 0 ? unresolvedSupportCount : undefined,
  };

  const [pwaPrompt, setPwaPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => {
      if (typeof window === "undefined") return null;

      const windowWithPwaPrompt = window as WindowWithPwaPrompt;
      const capturedPrompt = windowWithPwaPrompt.__pwaPromptEvent ?? null;
      if (capturedPrompt) {
        windowWithPwaPrompt.__pwaPromptEvent = null;
      }

      return capturedPrompt;
    },
  );

  useEffect(() => {
    const navigatorWithStandalone = window.navigator as NavigatorWithStandalone;
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      navigatorWithStandalone.standalone === true;

    if (isInstalled) return;

    const handlePrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setPwaPrompt(promptEvent);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!pwaPrompt) return;
    try {
      await pwaPrompt.prompt();
      const { outcome } = await pwaPrompt.userChoice;
      if (outcome === "accepted") setPwaPrompt(null);
    } catch (err) {
      console.error("PWA Install failed", err);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed top-0 left-0 h-full glass-surface z-50 transition-all duration-200 ease-in-out shadow",
          isOpen
            ? "w-64 translate-x-0"
            : "w-20 -translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full relative">
          <SidebarHeader isOpen={isOpen} />
          
          <SidebarNav 
            isOpen={isOpen} 
            setIsOpen={setIsOpen} 
            admin={admin} 
            badges={badges} 
          />
          
          <SidebarFooter 
            isOpen={isOpen} 
            admin={admin} 
            logout={logout} 
            pwaPrompt={pwaPrompt} 
            handleInstallClick={handleInstallClick} 
          />
        </div>
      </aside>
    </>
  );
});

export default AdminSidebar;
