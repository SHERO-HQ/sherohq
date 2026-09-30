// A role on the Careers page. Pure, so it's tested.
export type RoleValues = { title: string; description: string; howToApply: string; open: boolean };
export type RoleErrors = Partial<Record<keyof RoleValues, string>>;

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export function parseRoleForm(form: FormData): { ok: true; values: RoleValues } | { ok: false; errors: RoleErrors } {
  const errors: RoleErrors = {};
  const title = text(form, "title");
  if (!title) errors.title = "Name the role, e.g. Hardware technician.";
  else if (title.length > 80) errors.title = "Keep the title under 80 characters.";
  const description = text(form, "description");
  if (!description) errors.description = "Say what the work is, in a few plain sentences.";
  else if (description.length > 1200) errors.description = "Keep it under 1,200 characters.";
  const howToApply = text(form, "howToApply");
  if (!howToApply) errors.howToApply = "Say how to apply, e.g. email your CV with the role in the subject.";
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, values: { title, description, howToApply, open: form.get("open") === "on" } };
}
