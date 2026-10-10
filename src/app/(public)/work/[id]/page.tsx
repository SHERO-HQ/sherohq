import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects } from "@/lib/drizzle/schema";
import WorkDetail from "@/views/WorkDetail";

export const dynamic = "force-dynamic";

async function getProject(id: string) {
  try {
    const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return { title: "Our Work" };
  return {
    title: project.title,
    description: project.description?.slice(0, 155) || `${project.title} by SHERO.`,
  };
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

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
