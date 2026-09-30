// Parses the admin's product form into database values, with an error per
// field. A product's page lives at sherohq.com/<slug>, so a slug can't take
// the name of an existing page.
import type { ProductCompareRow } from "@/db/schema";
import { productThemes } from "@/lib/product-themes";

export const MAX_COMPARE_ROWS = 6;

/** Top-level paths the site already uses (pages, redirects, files). */
export const reservedSlugs = [
  "about", "admin", "api", "cart", "careers", "checkout", "consultation", "contact-us", "cookies", "favicon",
  "legal", "partners", "privacy", "products", "robots", "services", "shop", "sitemap", "support", "terms",
  "track", "uploads", "work", "opengraph-image", "apple-touch-icon", "assets",
];

export type ProductValues = {
  slug: string;
  name: string;
  status: "in_development" | "live";
  theme: string;
  title: string;
  summary: string;
  problem: string;
  audience: string;
  compare: ProductCompareRow[];
  liveUrl: string | null;
  namePlaceholder: string;
  businessLabel: string;
  businessPlaceholder: string;
  detailLabel: string;
  detailPlaceholder: string;
  detailNumeric: boolean;
  published: boolean;
  displayOrder: number;
};

export type ProductErrors = Partial<Record<string, string>>;

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

function required(errors: ProductErrors, key: string, value: string, label: string, max: number) {
  if (!value) errors[key] = `Enter ${label}.`;
  else if (value.length > max) errors[key] = `Keep this under ${max} characters.`;
}

export function slugFromName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    .replace(/-$/, "");
}

/** `existingSlug` is set when editing: the slug can't change after creation. */
export function parseProductForm(
  form: FormData,
  existingSlug: string | null,
): { ok: true; values: ProductValues } | { ok: false; errors: ProductErrors } {
  const errors: ProductErrors = {};

  const name = text(form, "name");
  required(errors, "name", name, "the product's name", 60);

  const slug = existingSlug ?? (text(form, "slug") || slugFromName(name));
  if (!existingSlug) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 40)
      errors.slug = "Use lowercase letters, numbers and dashes, e.g. merchander.";
    else if (reservedSlugs.includes(slug)) errors.slug = `sherohq.com/${slug} is already a page. Choose another.`;
  }

  const status = text(form, "status") === "live" ? "live" : "in_development";
  const theme = text(form, "theme");
  if (!productThemes.some((t) => t.value === theme)) errors.theme = "Choose a colour theme.";

  const title = text(form, "title");
  required(errors, "title", title, "a headline", 120);
  const summary = text(form, "summary");
  required(errors, "summary", summary, "a one-line summary", 160);
  const problem = text(form, "problem");
  required(errors, "problem", problem, "the problem it solves", 600);
  const audience = text(form, "audience");
  required(errors, "audience", audience, "who it's for", 200);

  const compare: ProductCompareRow[] = [];
  for (let i = 0; i < MAX_COMPARE_ROWS; i++) {
    const today = text(form, `compare-today-${i}`);
    const withIt = text(form, `compare-with-${i}`);
    if (!today && !withIt) continue;
    if (!today || !withIt) errors[`compare-${i}`] = "Fill in both sides, or clear the row.";
    else if (today.length > 140 || withIt.length > 140) errors[`compare-${i}`] = "Keep each side under 140 characters.";
    else compare.push({ today, with: withIt });
  }

  const liveUrl: string | null = text(form, "liveUrl") || null;
  if (liveUrl) {
    try {
      const url = new URL(liveUrl);
      if (url.protocol !== "https:") errors.liveUrl = "Use an https:// address.";
    } catch {
      errors.liveUrl = "Enter the full address, e.g. https://merchander.sherohq.com.";
    }
  }
  if (status === "live" && !liveUrl) errors.liveUrl = "A live product needs its address.";

  const businessLabel = text(form, "businessLabel") || "Business name";
  const detailLabel = text(form, "detailLabel");
  if (status === "in_development") required(errors, "detailLabel", detailLabel, "the waitlist question", 80);

  const order = Number(text(form, "displayOrder") || "0");
  if (!Number.isInteger(order) || order < 0 || order > 999) errors.displayOrder = "Enter a whole number, e.g. 1.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    values: {
      slug,
      name,
      status,
      theme,
      title,
      summary,
      problem,
      audience,
      compare,
      liveUrl,
      namePlaceholder: text(form, "namePlaceholder") || "Ama Mensah",
      businessLabel,
      businessPlaceholder: text(form, "businessPlaceholder"),
      detailLabel: detailLabel || "What would you use it for?",
      detailPlaceholder: text(form, "detailPlaceholder"),
      detailNumeric: form.get("detailNumeric") === "on",
      published: form.get("published") === "on",
      displayOrder: order,
    },
  };
}
