import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sherohq.com"),
  title: {
    default: "SHERO · Software, refurbished laptops and IT support in Tamale",
    template: "%s · SHERO",
  },
  description:
    "SHERO builds software, supplies tested refurbished laptops and supports the technology businesses run on. From Tamale, Ghana.",
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
    <html lang="en-GH">
      <body>{children}</body>
    </html>
  );
}
