import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The card shown when a sherohq.com link is shared on WhatsApp, Facebook or X.
// Pages can override it with their own opengraph-image file.
export const alt = "SHERO: software, tested laptops and IT support. From Tamale, delivering across Ghana.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontFile = (pkg: string, file: string) =>
  readFile(join(process.cwd(), "node_modules/@fontsource", pkg, "files", file));

export default async function OpenGraphImage() {
  const [display, text, logo] = await Promise.all([
    fontFile("red-hat-display", "red-hat-display-latin-700-normal.woff"),
    fontFile("red-hat-text", "red-hat-text-latin-400-normal.woff"),
    readFile(join(process.cwd(), "public/assets/logo/shero-dark.svg"), "utf8"),
  ]);
  const logoSrc = `data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#FFFFFF",
          borderBottom: "12px solid #043284",
        }}
      >
        <img src={logoSrc} alt="" width={183} height={64} />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontFamily: "Red Hat Display",
              fontSize: 76,
              lineHeight: "80px",
              letterSpacing: "-0.03em",
              color: "#043284",
              maxWidth: 960,
            }}
          >
            Software, tested laptops and IT support.
          </div>
          <div style={{ fontFamily: "Red Hat Text", fontSize: 32, color: "#4B5563" }}>
            Based in Tamale, working with clients in Ghana and beyond. sherohq.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Red Hat Display", data: display, weight: 700, style: "normal" },
        { name: "Red Hat Text", data: text, weight: 400, style: "normal" },
      ],
    },
  );
}
