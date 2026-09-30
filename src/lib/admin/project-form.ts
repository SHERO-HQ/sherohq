// Parses the admin's Work (client project) form. Empty text is stored as null
// and shown on the site as a [bracketed] placeholder, so nothing is invented.
import { slugFromName } from "./product-form";

export const MAX_SCREENSHOTS = 6;

/** The written parts of a case study, in page order, with their limits. */
export const projectTextFields = [
  { key: "client", label: "Client", max: 80 },
  { key: "year", label: "Year", max: 20 },
  { key: "built", label: "What we built", max: 120, placeholder: "Web app · mobile app · dashboard" },
  { key: "summary", label: "One-line summary", max: 160, hint: "On the Work page." },
  { key: "outcome", label: "Outcome", max: 200, hint: "The case study's headline: what it made possible." },
  { key: "problem", label: "The problem", max: 800, long: true },
  { key: "solution", label: "What we built, in words", max: 1200, long: true },
  { key: "result", label: "The result", max: 800, long: true, hint: "Concrete and true: who uses it, time saved, what they can now do." },
] as const;

type TextKey = (typeof projectTextFields)[number]["key"];

export type ProjectValues = Record<TextKey, string | null> & {
  slug: string;
  name: string;
  url: string | null;
  published: boolean;
  displayOrder: number;
};

export type ProjectErrors = Partial<Record<string, string>>;

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export function parseProjectForm(
  form: FormData,
  existingSlug: string | null,
): { ok: true; values: ProjectValues } | { ok: false; errors: ProjectErrors } {
  const errors: ProjectErrors = {};

  const name = text(form, "name");
  if (!name) errors.name = "Enter the project's name.";
  else if (name.length > 60) errors.name = "Keep this under 60 characters.";

  const slug = existingSlug ?? (text(form, "slug") || slugFromName(name));
  if (!existingSlug && (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 40))
    errors.slug = "Use lowercase letters, numbers and dashes, e.g. trustcircle.";

  const values = {} as Record<TextKey, string | null>;
  for (const field of projectTextFields) {
    const value = text(form, field.key);
    if (value.length > field.max) errors[field.key] = `Keep this under ${field.max} characters.`;
    values[field.key] = value || null;
  }

  const url = text(form, "url") || null;
  if (url) {
    try {
      if (new URL(url).protocol !== "https:") errors.url = "Use an https:// address.";
    } catch {
      errors.url = "Enter the full address, e.g. https://trustcircle.app.";
    }
  }

  const order = Number(text(form, "displayOrder") || "0");
  if (!Number.isInteger(order) || order < 0 || order > 999) errors.displayOrder = "Enter a whole number, e.g. 1.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    values: { ...values, slug, name, url, published: form.get("published") === "on", displayOrder: order },
  };
}

/** The written fields still empty (shown on the site as placeholders). */
export function emptyProjectFields(project: Partial<Record<TextKey, string | null>>): string[] {
  return projectTextFields.filter((f) => !project[f.key]).map((f) => f.label);
}
