import type { Metadata, Viewport } from "next";
import { themeBootScript } from "@/lib/theme";
import { display, mono, text } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sherohq.com"),
  title: {
    default: "SHERO · Refurbished laptops, software and IT support in Tamale, Ghana",
    template: "%s · SHERO",
  },
  description:
    "Tested refurbished laptops, custom software and IT support from SHERO in Tamale. Free delivery across Ghana on orders over GHS 2,000.",
  applicationName: "SHERO",
  openGraph: { siteName: "SHERO", locale: "en_GH", type: "website" },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0F1A" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme is set by the boot script before React loads, so React
    // shouldn't treat it as a mismatch.
    <html lang="en-GH" className={`${display.variable} ${text.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
