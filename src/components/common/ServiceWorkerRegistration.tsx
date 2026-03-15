"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
 useEffect(() => {
 if (
 typeof window !== "undefined" &&
 "serviceWorker" in navigator &&
 window.location.protocol === "https:"
 ) {
 navigator.serviceWorker
 .register("/sw.js", { scope: "/" })
 .then((reg) => {
 console.log("[SW] Registered, scope:", reg.scope);
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
 console.log("[SW] New content available, reload to update.");
 }
 });
 }
 });
 })
 .catch((err) => {
 console.error("[SW] Registration failed:", err);
 });
 }
 }, []);

 return null;
}
