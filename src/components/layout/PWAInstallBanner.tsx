"use client";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import Image from "next/image";
import sheroIcon from "@/assets/logo/shero.svg";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallBanner = () => {
  const [isIPhone] = useState(() => {
    const userAgent = globalThis.navigator?.userAgent ?? "";
    return /iPhone/i.test(userAgent);
  });

  const [isAndroid] = useState(() => {
    const userAgent = globalThis.navigator?.userAgent ?? "";
    return /Android/i.test(userAgent);
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

    const dismissed = localStorage.getItem("ios-pwa-banner-dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const timeoutId = window.setTimeout(() => setShowIOSBanner(true), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [isIPhone]);

  const handleDismissIOSBanner = () => {
    setShowIOSBanner(false);
    localStorage.setItem("ios-pwa-banner-dismissed", Date.now().toString());
  };

  const handleIPhoneInstall = async () => {
    // iOS does not support beforeinstallprompt, so we open share sheet when available.
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
      // User may cancel the share sheet; no further action needed.
    }
  };

  useEffect(() => {
    if (!isAndroid) return;

    const installed =
      globalThis.matchMedia?.("(display-mode: standalone)").matches ||
      (globalThis.navigator as Navigator & { standalone?: boolean })
        ?.standalone === true;

    if (installed) return;

    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPWABanner(true), 30000);
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
  }, [isAndroid]);

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
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
  };

  if (!isIPhone && !isAndroid) return null;
  if (!showIOSBanner && !showPWABanner) return null;

  return (
    <div className="w-full md:hidden bg-slate-900/95 border-b border-slate-800 backdrop-blur-sm">
      {showIOSBanner && isIPhone && (
        <div className="px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden">
              <Image
                src={sheroIcon}
                alt="SHERO"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                Install SHERO
              </p>
              <p className="mt-0.5 text-xs leading-4 text-slate-300">
                Tap Share → Add to Home Screen
              </p>
            </div>
            <button
              type="button"
              onClick={handleIPhoneInstall}
              className="mt-0.5 inline-flex shrink-0 px-2 py-1 rounded bg-emerald-300/50 hover:bg-emerald-700 text-white text-[10px] transition-colors whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Install
            </button>
            <button
              type="button"
              onClick={handleDismissIOSBanner}
              className="mt-0.5 shrink-0 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Dismiss iPhone install banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {showPWABanner && isAndroid && deferredPrompt && (
        <div className="px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Download className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                Install SHERO App
              </p>
              <p className="mt-0.5 text-xs leading-4 text-slate-300">
                Get quick access and a better experience
              </p>
            </div>
            <button
              type="button"
              onClick={handleInstallPWA}
              className="mt-0.5 shrink-0 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold transition-colors whitespace-nowrap"
            >
              Install
            </button>
            <button
              type="button"
              onClick={handleDismissPWABanner}
              className="mt-0.5 shrink-0 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Dismiss app install banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAInstallBanner;
