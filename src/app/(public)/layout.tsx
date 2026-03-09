"use client";

import dynamic from "next/dynamic";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

// Lazy-load components that are hidden by default (drawers, modals, prompts)
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"), {
  ssr: false,
});
const WishlistDrawer = dynamic(
  () => import("@/components/products/WishlistDrawer"),
  { ssr: false },
);
const PWAInstallPrompt = dynamic(
  () => import("@/components/common/PWAInstallPrompt"),
  { ssr: false },
);
const UserChangePasswordModal = dynamic(
  () =>
    import("@/components/auth/UserChangePasswordModal").then((m) => ({
      default: m.UserChangePasswordModal,
    })),
  { ssr: false },
);

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <CartDrawer />
      <WishlistDrawer />
      <PWAInstallPrompt />
      <UserChangePasswordModal />
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
