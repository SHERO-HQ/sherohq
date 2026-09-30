import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Badge } from "@/components/admin/Badge";
import { ImageManager } from "@/components/admin/ImageManager";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { requireAdmin } from "@/lib/admin/auth";
import { MAX_SCREENSHOTS } from "@/lib/admin/project-form";
import { adminProject } from "@/lib/admin/projects";
import { routes } from "@/lib/site";
import { addScreenshot, moveScreenshot, removeLogo, removeScreenshot, setLogo } from "../actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await requireAdmin();
  const project = await adminProject((await params).id);
  return { title: project?.name ?? "Project" };
}

export default async function ProjectAdminPage({ params, searchParams }: Props) {
  await requireAdmin();
  const [project, { saved }] = await Promise.all([adminProject((await params).id), searchParams]);
  if (!project) notFound();
  return (
    <>
      <AdminHeader
        title={project.name}
        badge={project.published ? <Badge tone="info">Shown</Badge> : <Badge tone="none">Hidden</Badge>}
      />
      <div className="flex flex-col gap-5 px-gutter py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/work" className="text-label text-primary hover:underline">
            <InlineArrow direction="left" /> All projects
          </Link>
          {project.published && (
            <a href={`${routes.work}/${project.slug}`} target="_blank" rel="noopener noreferrer" className="text-label text-primary hover:underline">
              See the case study <InlineArrow />
            </a>
          )}
        </div>
        <ProjectEditor
          project={project}
          saved={saved === "1"}
          images={
            <>
              <ImageManager
                id={project.id}
                url={project.logoUrl}
                title="Client logo"
                empty="No logo yet: the site shows the name as a marked placeholder."
                hint="The client's logo, on a plain background. PNG keeps it sharp."
                wide={false}
                actions={{ set: setLogo, remove: removeLogo }}
              />
              <section className="flex flex-col gap-4 rounded-md border border-border bg-surface-raised p-5 lg:p-6">
                <PhotoManager
                  listingId={project.id}
                  photos={project.screenshots}
                  max={MAX_SCREENSHOTS}
                  label="Screenshots"
                  noun="screenshot"
                  hint="The first leads the Work page and case study; the second shows under What we built."
                  actions={{ add: addScreenshot, remove: removeScreenshot, move: moveScreenshot }}
                />
              </section>
            </>
          }
        />
      </div>
    </>
  );
}
