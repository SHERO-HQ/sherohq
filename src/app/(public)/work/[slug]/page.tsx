import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects } from "@/lib/drizzle/schema";
import WorkDetail from "@/views/WorkDetail";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

// A complete sentence or word-boundary cut, never mid-word.
function summarize(text: string | null, max = 155): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (lastStop > 60) return cut.slice(0, lastStop + 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\-–]+$/, "")}...`;
}

function absoluteImage(image: string | null): string | null {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  if (image.startsWith("/")) {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://sherohq.com";
    return `${base}${image}`;
  }
  return null;
}

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
  const description = summarize(project.description) || `${project.title} by SHERO.`;
  const image = absoluteImage(project.image);
  return {
    title: project.title,
    description,
    keywords: [project.title, project.category, project.client, "SHERO", "Tamale"].filter(
      (k): k is string => !!k,
    ),
    openGraph: {
      title: project.title,
      description,
      type: "website",
      ...(image ? { images: [{ url: image, alt: `${project.title} preview` }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: project.title,
      description,
      ...(image ? { images: [image] } : {}),
    },
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
        status:
          project.status === "in_development" || project.status === "paused"
            ? project.status
            : "live",
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
