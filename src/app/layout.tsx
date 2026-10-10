import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Red_Hat_Display, Red_Hat_Text, Red_Hat_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegistration } from "@/components/common/ServiceWorkerRegistration";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import JsonLd from "@/components/common/JsonLd";
import { ThirdPartyScripts } from "@/components/layout/ThirdPartyScripts";
import "../index.css";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com"
).replace(/\/$/, "");

const DEFAULT_PREVIEW_IMAGE = `${SITE_URL}/shero.png`;

const aubette = localFont({
  src: "../assets/font/AubetteArchiType.woff2",
  variable: "--font-logo-next",
  weight: "700",
  display: "swap",
  preload: false,
});

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-display-next",
  display: "swap",
});

const redHatText = Red_Hat_Text({
  subsets: ["latin"],
  variable: "--font-primary-next",
  display: "swap",
});

const redHatMono = Red_Hat_Mono({
  subsets: ["latin"],
  variable: "--font-mono-next",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SHERO",
    template: "%s | SHERO",
  },
  description:
    "SHERO - Purposeful technology solutions, custom software development, and enterprise hardware. Redefining what's possible for businesses and communities.",
  keywords: [
    "SHERO",
    "SHERO HQ",
    "SHERO Tech",
    "SHERO Technologies",
    "SHERO Ghana",
    "SHERO Africa",
    "SHERO Shop",
    "SHERO Solutions",
    "SHERO Support",
    "SHERO FAQ",
    "SHERO Privacy",
    "SHERO Terms",
    "technology solutions Ghana",
    "software development Africa",
    "Laptops Ghana",
    "Refurbished laptops",
    "custom software solutions",
    "IT services Tamale",
  ],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    title: "SHERO",
    description: "Purposeful technology solutions",
    url: SITE_URL,
    siteName: "SHERO",
    images: [
      {
        url: DEFAULT_PREVIEW_IMAGE,
        width: 1200,
        height: 630,
        alt: "SHERO",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SHERO",
    description: "Purposeful technology solutions",
    images: [DEFAULT_PREVIEW_IMAGE],
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
  appleWebApp: {
    title: "SHERO",
    capable: true,
    statusBarStyle: "default",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${aubette.variable} ${redHatDisplay.variable} ${redHatText.variable} ${redHatMono.variable}`}>
      <head>
        <JsonLd />
        {/* Prevent hydration theme flash by synchronously reading/applying active theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('shero-ui-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
        {/* Critical CSS for LCP: Ensure H1 is visible immediately and has correct font-family */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          h1 { opacity: 1 !important; visibility: visible !important; }
          .font-primary { font-family: var(--font-primary-next); }
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
        `,
          }}
        />
      </head>
      <body
        className="font-primary font-medium transition-colors "
        suppressHydrationWarning
      >
        <Providers>
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
  focus:z-100 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground
  focus:rounded focus:shadow"
          >
            Skip to main content
          </a>
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
        <ServiceWorkerRegistration />
        <ThirdPartyScripts 
          gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} 
          fbPixelId={process.env.NEXT_PUBLIC_FB_PIXEL_ID}
        />
      </body>
    </html>
  );
}
