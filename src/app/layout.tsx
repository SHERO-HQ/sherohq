import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegistration } from "@/components/common/ServiceWorkerRegistration";
import "../index.css";

export const metadata: Metadata = {
  title: {
    default: "SHERO - Redefine Possible",
    template: "%s | SHERO",
  },
  description:
    "SHERO - Innovative technology solutions for businesses and individuals",
  keywords: [
    "SHERO",
    "technology solutions",
    "software development",
    "IT services",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com",
  ),
  openGraph: {
    type: "website",
    title: "SHERO - Redefine Possible",
    description: "Innovative technology solutions",
    url: "https://sherohq.com",
    siteName: "SHERO",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHERO - Redefine Possible",
    description: "Innovative technology solutions",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-primary transition-colors duration-500">
        <Providers>
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
              focus:z-100 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground
              focus:rounded focus:shadow-lg"
          >
            Skip to main content
          </a>
          <div id="main-content">{children}</div>
        </Providers>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
