import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects } from "@/lib/drizzle/schema";
import WorkDetail from "@/views/WorkDetail";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

async function getProject(slug: string) {
  try {
    const rows = await db.select().from(projects);
    const bySlug = rows.find((r) => slugify(r.title) === slug);
    if (bySlug) return { project: bySlug, legacyId: false };
    const byId = rows.find((r) => r.id === slug);
    return byId ? { project: byId, legacyId: true } : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: id } = await params;
  const found = await getProject(id);
  if (!found) return { title: "Our Work" };
  const project = found.project;
  return {
    title: project.title,
    description: project.description?.slice(0, 155) || `${project.title} by SHERO.`,
  };
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: id } = await params;
  const found = await getProject(id);
  if (!found) notFound();
  const { project, legacyId } = found;
  // Old links that used the id go to the readable address.
  if (legacyId) redirect(`/work/${slugify(project.title) || project.id}`);

  let technologies: string[] = [];
  const raw = project.technologies as unknown;
  if (Array.isArray(raw)) technologies = raw as string[];
  else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) technologies = parsed;
    } catch {}
  }

  return (
    <WorkDetail
      project={{
        id: project.id,
        title: project.title,
        category: project.category,
        status: project.status === "in_development" ? "in_development" : "live",
        client: project.client,
        description: project.description,
        useCase: project.useCase,
        technologies,
        image: project.image,
        link: project.link,
      }}
    />
  );
}
