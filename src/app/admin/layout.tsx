import type { Metadata } from "next";

// The admin (admin.sherohq.com): no site header, footer, cookie notice or
// analytics, and never indexed.
export const metadata: Metadata = {
  title: { default: "SHERO admin", template: "%s · SHERO admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-page text-ink">{children}</div>;
}
