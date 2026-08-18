"use client";

import { useEffect } from "react";

interface ThirdPartyScriptsProps {
  gaId?: string;
  fbPixelId?: string;
}

export function ThirdPartyScripts({ gaId, fbPixelId }: ThirdPartyScriptsProps) {
  useEffect(() => {
    let loaded = false;

    const loadScripts = () => {
      if (loaded) return;
      loaded = true;

      // Clean up event listeners
      window.removeEventListener("scroll", loadScripts);
      window.removeEventListener("mousemove", loadScripts);
      window.removeEventListener("touchstart", loadScripts);
      window.removeEventListener("keydown", loadScripts);

      // 1. Google Analytics 4
      if (gaId) {
        const gaScript = document.createElement("script");
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        gaScript.async = true;
        document.head.appendChild(gaScript);

        const dataLayer = ((window as any).dataLayer = (window as any).dataLayer || []);
        function gtag(...args: any[]) {
          dataLayer.push(args);
        }
        (window as any).gtag = gtag;
        gtag("js", new Date());
        gtag("config", gaId);
      }

      // 2. Meta (Facebook) Pixel
      if (fbPixelId) {
        const w = window as any;
        if (!w.fbq) {
          const fbqFunction: any = function (...args: any[]) {
            if (fbqFunction.callMethod) {
              fbqFunction.callMethod(...args);
            } else {
              fbqFunction.queue.push(args);
            }
          };
          w.fbq = fbqFunction;
          if (!w._fbq) w._fbq = fbqFunction;
          fbqFunction.push = fbqFunction;
          fbqFunction.loaded = true;
          fbqFunction.version = "2.0";
          fbqFunction.queue = [];

          const fbScript = document.createElement("script");
          fbScript.async = true;
          fbScript.src = "https://connect.facebook.net/en_US/fbevents.js";
          const firstScript = document.getElementsByTagName("script")[0];
          if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(fbScript, firstScript);
          } else {
            document.head.appendChild(fbScript);
          }
        }

        if (w.fbq) {
          w.fbq("init", fbPixelId);
          w.fbq("track", "PageView");
        }
      }
    };

    // Trigger on user interaction or after idle timeout
    window.addEventListener("scroll", loadScripts, { passive: true, once: true });
    window.addEventListener("mousemove", loadScripts, { passive: true, once: true });
    window.addEventListener("touchstart", loadScripts, { passive: true, once: true });
    window.addEventListener("keydown", loadScripts, { passive: true, once: true });

    const idleTimer =
      typeof window.requestIdleCallback !== "undefined"
        ? window.requestIdleCallback(() => setTimeout(loadScripts, 2500))
        : setTimeout(loadScripts, 3500);

    return () => {
      window.removeEventListener("scroll", loadScripts);
      window.removeEventListener("mousemove", loadScripts);
      window.removeEventListener("touchstart", loadScripts);
      window.removeEventListener("keydown", loadScripts);
      if (
        typeof window.cancelIdleCallback !== "undefined" &&
        typeof idleTimer === "number"
      ) {
        window.cancelIdleCallback(idleTimer);
      } else {
        clearTimeout(idleTimer as any);
      }
    };
  }, [gaId, fbPixelId]);

  return (
    <>
      {fbPixelId && (
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}
    </>
  );
}
