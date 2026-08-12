import type { Metadata } from "next";
import AdminLayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | SHERO Admin",
  },
  robots: { index: false, follow: false },
  manifest: "/admin.webmanifest",
  appleWebApp: {
    title: "SHERO Admin",
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
