"use client";
import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import logoLight from "@/assets/logo/shero-light.svg";
import logoDark from "@/assets/logo/shero-dark.svg";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const installed =
      globalThis.matchMedia?.("(display-mode: standalone)").matches ||
      (globalThis.navigator as Navigator & { standalone?: boolean })
        ?.standalone === true;
    queueMicrotask(() => setIsInstalled(installed));
  }, []);

  useEffect(() => {
    if (isInstalled) return;

    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    type PWAGlobal = { __pwaPromptEvent?: BeforeInstallPromptEvent | null };
    const captured = (globalThis as unknown as PWAGlobal).__pwaPromptEvent;
    if (captured) {
      handleBeforeInstallPrompt(captured);
      (globalThis as unknown as PWAGlobal).__pwaPromptEvent = null;
    }

    const handleAppInstalled = () => {
      setShowPrompt(false);
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
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } catch {
      console.error("Install prompt failed");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (isInstalled || !deferredPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-60 bg-white dark:bg-slate-900 rounded shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-12 h-12 rounded bg-slate-900 dark:bg-white flex items-center justify-center overflow-hidden p-1.5">
                <Image
                  src={logoLight}
                  alt="SHERO"
                  className="block dark:hidden w-full h-full object-contain"
                />
                <Image
                  src={logoDark}
                  alt="SHERO"
                  className="hidden dark:block w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Install SHERO App
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Get quick access and a better experience!
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="cursor-pointer shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleDismiss}
                className="cursor-pointer flex-1 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
              >
                <Download className="w-4 h-4" />
                Install
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
