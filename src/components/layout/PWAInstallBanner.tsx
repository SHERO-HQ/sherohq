"use client";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import Image from "next/image";
import { m, AnimatePresence } from "motion/react";

const sheroIcon = "/assets/logo/shero.svg";

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
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full glass-surface border-x-0 border-t-0 overflow-hidden"
          >
            <div className="container max-w-7xl mx-auto px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <Image
                    src={sheroIcon}
                    alt="SHERO"
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold tracking-wide text-brand-secondary-600 dark:text-brand-secondary-400">
                    Install SHERO
                  </p>
                  <p className="mt-0.5 text-[9px] leading-tight text-slate-600 dark:text-slate-400">
                    Tap Share → Add to Home Screen for the best experience
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleIPhoneInstall}
                  className="inline-flex items-center justify-center h-6 px-2 rounded font-semibold bg-brand-secondary-600 hover:bg-brand-secondary-700 dark:bg-brand-secondary-500 dark:hover:bg-brand-secondary-400 text-white text-[10px] transition-all active:scale-95 whitespace-nowrap shadow-sm shadow-brand-secondary-500/20"
                >
                  <Download className="h-3 w-3 mr-1.5" />
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
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* PWA Popup - Bottom Right Fixed */}
        {showPWABanner && deferredPrompt && (
          <m.div
            initial={{ x: 300, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 300, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-20 md:bottom-14 right-6 z-100 w-[calc(100vw-14rem)] sm:w-[280px]"
          >
            <div className="glass-surface-md p-4 rounded shadow transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-brand-secondary-50 dark:bg-brand-secondary-900/20 text-brand-secondary-600 dark:text-brand-secondary-400 border border-brand-secondary-100/50 dark:border-brand-secondary-800/30">
                    <Image src={sheroIcon} alt="SHERO" width={24} height={24} className="w-6 h-6 object-contain" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[11px] font-medium text-brand-secondary-600 dark:text-brand-secondary-400">
                    Install SHERO
                  </p>
                  <p className="mt-1 text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Install now for premium features and offline access on this
                    device.
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleInstallPWA}
                      className="inline-flex items-center justify-center h-8 px-6 rounded font-medium text-slate-900 bg-brand-secondary-600 hover:bg-brand-secondary-700 dark:bg-brand-secondary-500 dark:hover:bg-brand-secondary-400 text-[11px] transition-all active:scale-95 shadow shadow-brand-secondary-500/20"
                    >
                      Install
                    </button>
                    <button
                      type="button"
                      onClick={handleDismissPWABanner}
                      className="inline-flex items-center justify-center h-8 px-4 rounded font-medium bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] transition-all active:scale-95"
                    >
                      Later
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
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PWAInstallBanner;
