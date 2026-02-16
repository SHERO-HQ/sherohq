import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled] = useState(() => {
    // Check if already installed (run only on initial render)
    return (
      globalThis.matchMedia?.("(display-mode: standalone)").matches ||
      (globalThis.navigator as Navigator & { standalone?: boolean })
        ?.standalone === true
    );
  });

  useEffect(() => {
    // Already installed or not in browser
    if (isInstalled) return;

    // Check if user has dismissed the prompt recently
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) {
      const dismissedTime = Number.parseInt(dismissed, 10);
      // Don't show again for 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Listen for the install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the prompt after a short delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    globalThis.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );

    // Listen for successful install
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

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

  // Don't render if already installed or no prompt available
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
              <div className="shrink-0 w-12 h-12 bg-linear-to-br from-emerald-500 to-blue-600 rounded flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
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
                className="cursor-pointer flex-1 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
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
