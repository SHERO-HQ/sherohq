"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "development") {
        // Active unregistration in development to prevent HMR chunk loading errors (NS_ERROR_CORRUPTED_CONTENT)
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then((success) => {
              if (success) {
                console.log("[SW] Unregistered active service worker in development mode to prevent chunk load corruption");
              }
            });
          }
        });
        return;
      }

      if (
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.startsWith("192.168.")
      ) {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((reg) => {
            // [SW] Registered
            // Check for updates on each navigation
            reg.addEventListener("updatefound", () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New content available — you could prompt user to refresh here
                    // [SW] New content available
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.error("[SW] Registration failed:", err);
          });
      }
    }
  }, []);

  return null;
}
