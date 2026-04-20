"use client";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import sheroIcon from "@/assets/logo/shero.svg";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallBanner = () => {
  const [isIPhone] = useState(() => {
    if (typeof window === "undefined") return false;
    const userAgent = globalThis.navigator?.userAgent ?? "";
    return /iPhone/i.test(userAgent);
  });

  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPWABanner, setShowPWABanner] = useState(false);

  useEffect(() => {
    if (!isIPhone) return;

    const installed =
      globalThis.matchMedia?.("(display-mode: standalone)").matches ||
      (globalThis.navigator as Navigator & { standalone?: boolean })
        ?.standalone === true;

    if (installed) return;

    const dismissed = localStorage.getItem("ios-install-v2-dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const timeoutId = window.setTimeout(() => setShowIOSBanner(true), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [isIPhone]);

  const handleDismissIOSBanner = () => {
    setShowIOSBanner(false);
    localStorage.setItem("ios-install-v2-dismissed", Date.now().toString());
  };

  const handleIPhoneInstall = async () => {
    if (!isIPhone) return;

    try {
      if (globalThis.navigator?.share) {
        await globalThis.navigator.share({
          title: "SHERO",
          text: "Install SHERO",
          url: globalThis.location?.href ?? "/",
        });
      }
    } catch {
      // User may cancel
    }
  };

  useEffect(() => {
    const installed =
      globalThis.matchMedia?.("(display-mode: standalone)").matches ||
      (globalThis.navigator as Navigator & { standalone?: boolean })
        ?.standalone === true;

    if (installed) return;

    const dismissed = localStorage.getItem("pwa-install-v2-dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPWABanner(true), 3000);
    };

    type PWAGlobal = { __pwaPromptEvent?: BeforeInstallPromptEvent | null };
    const captured = (globalThis as unknown as PWAGlobal).__pwaPromptEvent;
    if (captured) {
      handleBeforeInstallPrompt(captured);
      (globalThis as unknown as PWAGlobal).__pwaPromptEvent = null;
    }

    const handleAppInstalled = () => {
      setShowPWABanner(false);
      setDeferredPrompt(null);
    };

    globalThis.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );
    globalThis.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      globalThis.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      globalThis.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setShowPWABanner(false);
        setDeferredPrompt(null);
      }
    } catch {
      console.error("Install prompt failed");
    }
  };

  const handleDismissPWABanner = () => {
    setShowPWABanner(false);
    localStorage.setItem("pwa-install-v2-dismissed", Date.now().toString());
  };

  return (
    <>
      <AnimatePresence>
        {/* iPhone Banner - Top Docked */}
        {showIOSBanner && isIPhone && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-white/95 dark:bg-slate-950/95 border-b border-slate-100 dark:border-slate-800/50 overflow-hidden"
          >
            <div className="container max-w-7xl mx-auto px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <Image
                    src={sheroIcon}
                    alt="SHERO"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary-600 dark:text-brand-secondary-400">
                    Install SHERO
                  </p>
                  <p className="mt-0.5 text-[11px] leading-tight text-slate-600 dark:text-slate-400 font-medium">
                    Tap Share → Add to Home Screen for the best experience
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleIPhoneInstall}
                  className="inline-flex items-center justify-center h-8 px-3 rounded font-bold bg-brand-secondary-600 hover:bg-brand-secondary-700 dark:bg-brand-secondary-500 dark:hover:bg-brand-secondary-400 text-white text-[11px] transition-all active:scale-95 whitespace-nowrap shadow-sm shadow-brand-secondary-500/20"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Install
                </button>
                <button
                  type="button"
                  onClick={handleDismissIOSBanner}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Dismiss iPhone install banner"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* PWA Popup - Bottom Right Fixed */}
        {showPWABanner && deferredPrompt && (
          <motion.div
            initial={{ x: 300, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 300, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-100 w-[calc(100vw-3rem)] sm:w-[380px]"
          >
            <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-4 rounded shadow border border-slate-100 dark:border-slate-800 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-brand-secondary-50 dark:bg-brand-secondary-900/20 text-brand-secondary-600 dark:text-brand-secondary-400 border border-brand-secondary-100/50 dark:border-brand-secondary-800/30">
                  <Download className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-brand-secondary-600 dark:text-brand-secondary-400">
                    Install SHERO
                  </p>
                  <p className="mt-1 text-[12px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Install now for premium features and offline access on this
                    device.
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleInstallPWA}
                      className="flex-1 inline-flex items-center justify-center h-8 px-4 rounded font-bold bg-brand-secondary-600 hover:bg-brand-secondary-700 dark:bg-brand-secondary-500 dark:hover:bg-brand-secondary-400 text-white text-[12px] transition-all active:scale-95 shadow-lg shadow-brand-secondary-500/20"
                    >
                      Install App
                    </button>
                    <button
                      type="button"
                      onClick={handleDismissPWABanner}
                      className="inline-flex items-center justify-center h-8 px-4 rounded font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[12px] transition-all active:scale-95"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDismissPWABanner}
                  className="absolute top-3 right-3 p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Dismiss install popup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PWAInstallBanner;
