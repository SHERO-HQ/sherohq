"use client";

import Nav from "@/components/layout/Nav";
import CartDrawer from "@/components/cart/CartDrawer";
import WishlistDrawer from "@/components/products/WishlistDrawer";
import PWAInstallPrompt from "@/components/common/PWAInstallPrompt";
import { UserChangePasswordModal } from "@/components/auth/UserChangePasswordModal";

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
      {children}
    </>
  );
}
