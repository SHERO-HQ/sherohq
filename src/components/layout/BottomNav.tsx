"use client";
import { useEffect, useState } from "react";
import { Home, ShoppingBag, ShoppingCart, Heart, Share2, X } from "lucide-react";
import NavLink from "@/components/common/NavLink";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useIsMounted } from "@/hooks/useIsMounted";
import { getAbsoluteUrl } from "@/utils/subdomain";

const BottomNav = () => {
  const { setIsCartOpen, totalQuantity } = useCart();
  const { setIsWishlistOpen, wishlist } = useWishlist();
  const mounted = useIsMounted();
  const [isIOS] = useState(() => {
    const userAgent = globalThis.navigator?.userAgent ?? "";
    const platform = globalThis.navigator?.platform ?? "";
    const isIPhoneOrIPad = /iPhone|iPad|iPod/i.test(userAgent);
    const isIPadOSDesktopMode =
      /Macintosh/i.test(userAgent) &&
      (globalThis.navigator?.maxTouchPoints ?? 0) > 1;

    return (
      isIPhoneOrIPad ||
      (platform === "MacIntel" && (globalThis.navigator?.maxTouchPoints ?? 0) > 1) ||
      isIPadOSDesktopMode
    );
  });
  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const homeHref = getAbsoluteUrl("/");
  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: homeHref,
      end: true,
      iconClassName: "w-7 h-7",
    },
    {
      icon: ShoppingBag,
      label: "Shop",
      path: getAbsoluteUrl("/shop"),
      end: true,
      iconClassName: "w-7 h-7",
    },
    {
      icon: Heart,
      label: "Wishlist",
      path: getAbsoluteUrl("/wishlist"),
      end: true,
    },
    {
      icon: ShoppingCart,
      label: "Cart",
      path: getAbsoluteUrl("/cart"),
      end: true,
    },
  ];

  useEffect(() => {
    if (!isIOS) return;

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
  }, [isIOS]);

  const handleDismissIOSBanner = () => {
    setShowIOSBanner(false);
    localStorage.setItem("ios-pwa-banner-dismissed", Date.now().toString());
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      {showIOSBanner && isIOS && (
        <div className="mx-3 mb-2 rounded-2xl border border-emerald-500/20 bg-slate-950/95 px-3 py-2.5 text-white shadow-lg shadow-slate-950/20 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20">
              <Share2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400/90">
                SHERO on iPhone
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-200">
                In Safari, tap Share and choose Add to Home Screen.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismissIOSBanner}
              className="-mt-0.5 shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Dismiss iPhone install banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800">
        <nav className="flex justify-around items-center h-14 py-2">
          {navItems.map((item) => {
            if (item.label === "Cart") {
              return (
                <button
                  key={item.label}
                  onClick={() => setIsCartOpen(true)}
                  aria-label={`Open Cart (${totalQuantity} items)`}
                  className="cursor-pointer flex flex-col items-center justify-center w-full h-full gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors relative"
                >
                  <item.icon
                    className={item.iconClassName ?? "w-6 h-6"}
                    strokeWidth={2}
                  />
                  <span className="text-[12px] font-medium">{item.label}</span>
                  {mounted && totalQuantity > 0 && (
                    <span className="absolute top-1 right-1/2 translate-x-4 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[8px] font-bold text-white">
                      {totalQuantity}
                    </span>
                  )}
                </button>
              );
            }
            if (item.label === "Wishlist") {
              return (
                <button
                  key={item.label}
                  onClick={() => setIsWishlistOpen(true)}
                  aria-label={`Open Wishlist (${wishlist.length} items)`}
                  className="cursor-pointer flex flex-col items-center justify-center w-full h-full gap-1 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors relative"
                >
                  <item.icon
                    className={`w-6 h-6 ${mounted && wishlist.length > 0 ? "fill-red-500 text-red-500" : ""}`}
                    strokeWidth={2}
                  />
                  <span className="text-[12px] font-medium">{item.label}</span>
                  {mounted && wishlist.length > 0 && (
                    <span className="absolute top-1 right-1/2 translate-x-4 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white">
                      {wishlist.length}
                    </span>
                  )}
                </button>
              );
            }
            return (
              <NavLink
                key={item.label}
                href={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                      : "bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`
                }
              >
                <>
                  <item.icon
                    className={item.iconClassName ?? "w-6 h-6"}
                    strokeWidth={2}
                  />
                  <span className="text-[12px] font-medium">{item.label}</span>
                </>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default BottomNav;
