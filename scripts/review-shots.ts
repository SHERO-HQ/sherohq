// Screenshots every built page next to its design mockup, on desktop and
// mobile, in light and dark, for the review page. Needs `yarn build` first.
//
//   yarn review:shots            # writes review/shots/*.jpg and review/manifest.json
//
// Set PW_CHROMIUM_PATH to use a preinstalled Chromium.
import { execSync, spawn } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, type Browser, type BrowserContextOptions, type Page } from "@playwright/test";
import { codeForStep, stepAt } from "../src/lib/admin/totp";
import { localAdmin } from "./local-admin";

const root = resolve(import.meta.dirname, "..");
const outDir = resolve(root, "review/shots");
const port = 3100;
const base = `http://localhost:${port}`;

type Entry = {
  slug: string;
  title: string;
  route: string;
  /** Mockup file name without -light/-dark, per viewport; null when there is none. */
  design: { desktop: string | null; mobile: string | null };
  /** For the mobile menu: open it before the screenshot. */
  openMenu?: boolean;
  /** Put this listing in the cart first (cart and checkout). */
  withCart?: string;
  /** An admin page: signed in, and its mockup is in design/admin (desktop only). */
  admin?: boolean;
  /** Follow this link first (e.g. to open one listing). */
  openLink?: string;
};

// A sample from `yarn db:seed`; the shop pages need the local database.
const sample = "/shop/sample-dell-latitude-7490";

const entries: Entry[] = [
  { slug: "home", title: "Home", route: "/", design: { desktop: "Home", mobile: "Home" } },
  { slug: "menu", title: "Mobile menu", route: "/", design: { desktop: null, mobile: "Menu" }, openMenu: true },
  { slug: "services", title: "Services", route: "/services", design: { desktop: "Services", mobile: "Services" } },
  { slug: "about", title: "About", route: "/about", design: { desktop: "About", mobile: "About" } },
  { slug: "careers", title: "Careers", route: "/about/careers", design: { desktop: "Careers", mobile: "Careers" } },
  { slug: "work", title: "Work", route: "/work", design: { desktop: "Work", mobile: "Work" } },
  {
    slug: "case-study",
    title: "Case study",
    route: "/work/trustcircle",
    design: { desktop: "Case-TrustCircle", mobile: "Case-TrustCircle" },
  },
  { slug: "merchander", title: "Merchander", route: "/merchander", design: { desktop: "Merchander", mobile: "Merchander" } },
  { slug: "pharmasyst", title: "Pharmasyst", route: "/pharmasyst", design: { desktop: "Pharmasyst", mobile: "Pharmasyst" } },
  { slug: "shop", title: "Shop", route: "/shop", design: { desktop: "Shop", mobile: "Shop" } },
  { slug: "laptop", title: "Laptop", route: sample, design: { desktop: "Laptop", mobile: "Laptop" } },
  { slug: "cart", title: "Cart", route: "/cart", design: { desktop: "Cart", mobile: "Cart" }, withCart: sample },
  {
    slug: "checkout",
    title: "Checkout",
    route: "/checkout",
    design: { desktop: "Checkout", mobile: "Checkout" },
    withCart: sample,
  },
  { slug: "track", title: "Track order", route: "/track", design: { desktop: "Track", mobile: "Track" } },
  { slug: "support", title: "Support", route: "/support", design: { desktop: "Support", mobile: "Support" } },
  {
    slug: "consultation",
    title: "Consultation",
    route: "/support/consultation",
    design: { desktop: "Consultation", mobile: "Consultation" },
  },
  { slug: "privacy", title: "Privacy", route: "/legal/privacy", design: { desktop: "Legal-Privacy", mobile: "Privacy" } },
  { slug: "terms", title: "Terms", route: "/legal/terms", design: { desktop: null, mobile: null } },
  { slug: "cookies", title: "Cookies", route: "/legal/cookies", design: { desktop: null, mobile: null } },
  { slug: "not-found", title: "404", route: "/this-page-does-not-exist", design: { desktop: "404", mobile: "404" } },
  { slug: "admin-login", title: "Admin: sign in", route: "/admin/login", design: { desktop: null, mobile: null } },
  {
    slug: "admin-listings",
    title: "Admin: Listings",
    route: "/admin/listings",
    design: { desktop: "Listings", mobile: null },
    admin: true,
  },
  {
    slug: "admin-listing",
    title: "Admin: a listing",
    route: "/admin/listings",
    design: { desktop: "Listing", mobile: null },
    admin: true,
    openLink: "Draft listing (sample, never shown)",
  },
  { slug: "admin-products", title: "Admin: Products", route: "/admin/products", design: { desktop: null, mobile: null }, admin: true },
  {
    slug: "admin-product",
    title: "Admin: a product",
    route: "/admin/products",
    design: { desktop: null, mobile: null },
    admin: true,
    openLink: "Merchander",
  },
  { slug: "admin-work", title: "Admin: Work", route: "/admin/work", design: { desktop: "Work", mobile: null }, admin: true },
  {
    slug: "admin-project",
    title: "Admin: a project",
    route: "/admin/work",
    design: { desktop: null, mobile: null },
    admin: true,
    openLink: "TrustCircle",
  },
];

/** Signs in once with the local admin from `yarn db:seed`; admin shots reuse the session. */
let adminSession: BrowserContextOptions["storageState"];
async function signInToAdmin(browser: Browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${base}/admin/login`);
  await page.getByLabel("Email").fill(localAdmin.email);
  await page.getByLabel("Password").fill(localAdmin.password);
  await page.getByLabel("Code from your authenticator app").fill(codeForStep(localAdmin.totpSecret, stepAt(Date.now())));
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin/listings");
  adminSession = await context.storageState();
  await context.close();
}

const viewports = {
  // Desktop is captured at 0.75 scale to keep the review page light.
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 0.75 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5 },
} as const;
type Viewport = keyof typeof viewports;
const themes = ["light", "dark"] as const;

// The mockups reference the logo as /_blob/<id>; serve SHERO's real files.
const blobLogos: Record<string, string> = {
  a4f0d806d836ddd7c2b1674dedd7188e: "public/assets/logo/shero-dark.svg",
  "4114aca4d41461766acd2d4cceb84137": "public/assets/logo/shero-light.svg",
};

const localFontsCss = (["display", "text", "mono"] as const)
  .map((cut) => {
    const file = resolve(root, `node_modules/@fontsource-variable/red-hat-${cut}/files/red-hat-${cut}-latin-wght-normal.woff2`);
    const family = `Red Hat ${cut[0].toUpperCase()}${cut.slice(1)}`;
    return `@font-face{font-family:'${family}';src:url(file://${file}) format('woff2');font-weight:300 900;font-style:normal}`;
  })
  .join("\n");

async function shoot(page: Page, file: string) {
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(outDir, file), fullPage: true, type: "jpeg", quality: 62 });
  return file;
}

async function captureBuilt(browser: Browser, entry: Entry, viewport: Viewport, theme: (typeof themes)[number]) {
  const context = await browser.newContext({
    ...viewports[viewport],
    colorScheme: theme,
    isMobile: viewport === "mobile",
    storageState: entry.admin ? adminSession : undefined,
  });
  const page = await context.newPage();
  if (entry.withCart) {
    await page.goto(`${base}${entry.withCart}`, { waitUntil: "load" });
    await page.locator("button:visible", { hasText: "Add to cart" }).first().click();
  }
  await page.goto(`${base}${entry.route}`, { waitUntil: "load" });
  if (entry.openLink) {
    await page.getByRole("link", { name: entry.openLink }).click();
    await page.waitForLoadState("load");
  }
  if (entry.openMenu) {
    await page.click("button[aria-label='Open menu']");
    await page.waitForSelector("#mobile-menu");
  }
  const file = await shoot(page, `${entry.slug}-built-${viewport}-${theme}.jpg`);
  await context.close();
  return file;
}

async function captureDesign(browser: Browser, name: string, entry: Entry, viewport: Viewport, theme: (typeof themes)[number]) {
  const path = resolve(root, entry.admin ? `design/admin/${name}-${theme}.dc.html` : `design/website/${viewport}/${name}-${theme}.dc.html`);
  if (!existsSync(path)) return null;
  const context = await browser.newContext({ ...viewports[viewport], colorScheme: theme });
  await context.route("**/_blob/*", (route) => {
    const id = new URL(route.request().url()).pathname.split("/").pop()!;
    const logo = blobLogos[id];
    return logo ? route.fulfill({ path: resolve(root, logo), contentType: "image/svg+xml" }) : route.abort();
  });
  await context.route("**/support.js", (route) => route.fulfill({ body: "", contentType: "text/javascript" }));
  // Serve the mockups' Google Fonts from the local packages, so capture works offline.
  await context.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ body: localFontsCss, contentType: "text/css" }),
  );
  const page = await context.newPage();
  await page.goto(`file://${path}`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const file = await shoot(page, `${entry.slug}-design-${viewport}-${theme}.jpg`);
  await context.close();
  return file;
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("The site didn't start. Run `yarn build` first.");
}

mkdirSync(outDir, { recursive: true });
const server = spawn("yarn", ["start", "-p", String(port)], { cwd: root, stdio: "ignore", detached: true });
try {
  await waitForServer();
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_PATH || undefined });
  await signInToAdmin(browser);
  const manifest = [];
  for (const entry of entries) {
    const shots: Record<string, Record<string, { built: string | null; design: string | null }>> = {};
    for (const viewport of Object.keys(viewports) as Viewport[]) {
      if (entry.openMenu && viewport === "desktop") continue;
      shots[viewport] = {};
      for (const theme of themes) {
        const built = await captureBuilt(browser, entry, viewport, theme);
        const name = entry.design[viewport];
        const design = name ? await captureDesign(browser, name, entry, viewport, theme) : null;
        shots[viewport][theme] = { built, design };
      }
    }
    manifest.push({ slug: entry.slug, title: entry.title, route: entry.route, shots });
    console.log(`captured ${entry.title}`);
  }
  await browser.close();
  const commit = execSync("git rev-parse --short HEAD", { cwd: root }).toString().trim();
  writeFileSync(
    resolve(root, "review/manifest.json"),
    JSON.stringify({ capturedAt: new Date().toISOString(), commit, pages: manifest }, null, 2),
  );
} finally {
  if (server.pid) {
    try {
      process.kill(-server.pid);
    } catch {
      // Already exited.
    }
  }
}
