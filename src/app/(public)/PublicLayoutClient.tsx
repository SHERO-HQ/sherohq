"use client";

import dynamic from "next/dynamic";
import TopBarStack from "@/components/layout/TopBarStack";
import Footer from "@/components/layout/Footer";
import { usePathname } from "next/navigation";
import React from "react";

// Lazy-load components that are hidden by default
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawerUI"), {
  ssr: false,
});
const WishlistDrawer = dynamic(
  () => import("@/components/products/WishlistDrawer"),
  { ssr: false },
);
const UserChangePasswordModal = dynamic(
  () =>
    import("@/components/auth/UserChangePasswordModal").then((m) => ({
      default: m.UserChangePasswordModal,
    })),
  { ssr: false },
);

export function PublicLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMinimalLayout = pathname?.startsWith("/checkout/pay");

  if (isMinimalLayout) {
    return (
      <main id="main-content" className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {children}
      </main>
    );
  }

  return (
    <>
      <TopBarStack />
      <CartDrawer />
      <WishlistDrawer />
      <UserChangePasswordModal />
      <main
        id="main-content"
        className="min-h-screen"
        style={{ paddingTop: "var(--topbar-offset, 48px)" }}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
