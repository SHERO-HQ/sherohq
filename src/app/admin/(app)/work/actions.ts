"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";
import { deletePhoto, PhotoError, storePhoto } from "@/lib/admin/photo-store";
import { MAX_SCREENSHOTS, parseProjectForm, type ProjectErrors } from "@/lib/admin/project-form";

export type SaveProjectState = { errors: ProjectErrors; message: string | null };
type Result = { ok: true } | { ok: false; message: string };

const isId = (id: unknown): id is string => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id);

/** Work feeds the Work page, case studies and the Home client row. */
function refreshSite() {
  revalidatePath("/", "layout");
}

export async function saveProject(id: string | null, _state: SaveProjectState, form: FormData): Promise<SaveProjectState> {
  await requireAdmin();
  let existingSlug: string | null = null;
  if (id !== null) {
    if (!isId(id)) return { errors: {}, message: "This project no longer exists." };
    const [row] = await db.select({ slug: projects.slug }).from(projects).where(eq(projects.id, id));
    if (!row) return { errors: {}, message: "This project no longer exists." };
    existingSlug = row.slug;
  }
  const parsed = parseProjectForm(form, existingSlug);
  if (!parsed.ok) return { errors: parsed.errors, message: "Check the highlighted fields." };

  let savedId = id;
  if (id) {
    const values: Partial<typeof parsed.values> = { ...parsed.values };
    delete values.slug; // Fixed after creation, so shared links keep working.
    await db.update(projects).set(values).where(eq(projects.id, id));
  } else {
    const [taken] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, parsed.values.slug));
    if (taken) return { errors: { slug: "Another project already uses this address." }, message: "Check the highlighted fields." };
    const [row] = await db.insert(projects).values(parsed.values).returning({ id: projects.id });
    savedId = row.id;
  }
  refreshSite();
  redirect(`/admin/work/${savedId}?saved=1`);
}

export async function deleteProject(id: string) {
  await requireAdmin();
  if (!isId(id)) return;
  const [deleted] = await db
    .delete(projects)
    .where(eq(projects.id, id))
    .returning({ logoUrl: projects.logoUrl, screenshots: projects.screenshots });
  if (deleted) for (const url of [deleted.logoUrl, ...deleted.screenshots]) if (url) await deletePhoto(url);
  refreshSite();
  redirect("/admin/work");
}

async function target(id: string) {
  if (!isId(id)) return null;
  const [row] = await db
    .select({ slug: projects.slug, logoUrl: projects.logoUrl, screenshots: projects.screenshots })
    .from(projects)
    .where(eq(projects.id, id));
  return row ?? null;
}

async function store(file: FormDataEntryValue | null, name: string): Promise<string | Result> {
  if (!(file instanceof File)) return { ok: false, message: "Choose an image." };
  try {
    return await storePhoto(file, name);
  } catch (error) {
    return { ok: false, message: error instanceof PhotoError ? error.message : "The image couldn't be saved." };
  }
}

export async function setLogo(id: string, form: FormData): Promise<Result> {
  await requireAdmin();
  const project = await target(id);
  if (!project) return { ok: false, message: "This project no longer exists." };
  const url = await store(form.get("photo"), `${project.slug}-logo`);
  if (typeof url !== "string") return url;
  await db.update(projects).set({ logoUrl: url }).where(eq(projects.id, id));
  if (project.logoUrl) await deletePhoto(project.logoUrl);
  refreshSite();
  return { ok: true };
}

export async function removeLogo(id: string): Promise<Result> {
  await requireAdmin();
  const project = await target(id);
  if (project?.logoUrl) {
    await db.update(projects).set({ logoUrl: null }).where(eq(projects.id, id));
    await deletePhoto(project.logoUrl);
  }
  refreshSite();
  return { ok: true };
}

export async function addScreenshot(id: string, form: FormData): Promise<Result> {
  await requireAdmin();
  const project = await target(id);
  if (!project) return { ok: false, message: "This project no longer exists." };
  if (project.screenshots.length >= MAX_SCREENSHOTS) return { ok: false, message: `Up to ${MAX_SCREENSHOTS} screenshots.` };
  const url = await store(form.get("photo"), `${project.slug}-screen`);
  if (typeof url !== "string") return url;
  const [updated] = await db
    .update(projects)
    .set({ screenshots: sql`${projects.screenshots} || jsonb_build_array(${url}::text)` })
    .where(and(eq(projects.id, id), sql`jsonb_array_length(${projects.screenshots}) < ${MAX_SCREENSHOTS}`))
    .returning({ id: projects.id });
  if (!updated) {
    await deletePhoto(url);
    return { ok: false, message: `Up to ${MAX_SCREENSHOTS} screenshots.` };
  }
  refreshSite();
  return { ok: true };
}

export async function removeScreenshot(id: string, url: string): Promise<Result> {
  await requireAdmin();
  const project = await target(id);
  if (!project || !project.screenshots.includes(url)) return { ok: false, message: "That screenshot is already gone." };
  await db
    .update(projects)
    .set({ screenshots: project.screenshots.filter((s) => s !== url) })
    .where(eq(projects.id, id));
  await deletePhoto(url);
  refreshSite();
  return { ok: true };
}

export async function moveScreenshot(id: string, url: string, by: -1 | 1): Promise<Result> {
  await requireAdmin();
  const project = await target(id);
  const from = project?.screenshots.indexOf(url) ?? -1;
  const to = from + by;
  if (!project || from === -1 || to < 0 || to >= project.screenshots.length) return { ok: true };
  const screenshots = [...project.screenshots];
  [screenshots[from], screenshots[to]] = [screenshots[to], screenshots[from]];
  await db.update(projects).set({ screenshots }).where(eq(projects.id, id));
  refreshSite();
  return { ok: true };
}
