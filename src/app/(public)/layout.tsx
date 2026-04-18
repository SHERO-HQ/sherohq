"use client";

import dynamic from "next/dynamic";
import TopBarStack from "@/components/layout/TopBarStack";
import Footer from "@/components/layout/Footer";
import { PageTransition } from "@/components/common/PageTransition";

// Lazy-load components that are hidden by default (drawers, modals, prompts)
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

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
