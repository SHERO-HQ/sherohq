import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@fontsource-variable/sora/index.css";
import "@fontsource-variable/jetbrains-mono/index.css";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegistration } from "@/components/common/ServiceWorkerRegistration";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import dynamic from "next/dynamic";
import { PageTransition } from "@/components/common/PageTransition";
import "../index.css";

const aubette = localFont({
  src: "../assets/font/AubetteArchiType.woff2",
  variable: "--font-logo-next",
  weight: "700",
  display: "swap",
});

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
    <html lang="en" suppressHydrationWarning className={`${aubette.variable}`}>
      <head>
        {/* Critical CSS for LCP: Ensure H1 is visible immediately and has correct font-family */}
        <style dangerouslySetInnerHTML={{ __html: `
          h1 { opacity: 1 !important; visibility: visible !important; }
          .font-primary { font-family: 'Sora Variable', sans-serif; }
          @media (max-width: 640px) {
            div[data-version^="v-refinement-"] {
              position: fixed !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              inset: auto 0 0 0 !important;
              z-index: 9999 !important;
              height: 600px !important;
              max-height: 85vh !important;
              transform: none !important;
              display: flex !important;
            }
          }
        `}} />
      </head>
      <body
        className="font-primary transition-colors duration-500"
        suppressHydrationWarning
      >
        {/* Capture the PWA install prompt event before React hydrates.
 Dynamic-imported PWAInstallPrompt may mount after the event fires,
 so we stash it globally for the component to pick up later. */}
        <Script
          id="pwa-prompt"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.__pwaPromptEvent=null;window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__pwaPromptEvent=e});`,
          }}
        />
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
          <PageTransition>{children}</PageTransition>
        </Providers>
        <Analytics />
        <SpeedInsights />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
