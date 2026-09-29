import type { Metadata } from "next";
import Link from "next/link";
import { ConsultationCta } from "@/components/home/ConsultationCta";
import { Fill } from "@/components/ui/Fill";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { Placeholder } from "@/components/ui/Placeholder";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { projects } from "@/content/work";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Work: systems SHERO has built",
  description: "Client systems SHERO has built, live and in use today, shown with each client's permission.",
  alternates: { canonical: routes.work },
};

export default function WorkPage() {
  return (
    <>
      <section className="container-site flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between lg:gap-16 py-section">
        <h1 className="font-display text-h1 text-heading">
          Built by SHERO,
          <br className="hidden lg:block" /> running today.
        </h1>
        <p className="max-w-md text-body-lg text-ink-secondary">
          Systems we&rsquo;ve built for clients, now live and in use. Every one is shown with the client&rsquo;s
          permission.
        </p>
      </section>

      {projects.map((project, i) => {
        const imageFirst = i % 2 === 0;
        return (
          <section
            key={project.slug}
            aria-labelledby={`${project.slug}-title`}
            className="border-t border-border"
          >
            <div
              className={cn(
                "container-site grid gap-5 lg:gap-18 py-section",
                imageFirst ? "lg:grid-cols-[1.3fr_1fr]" : "lg:grid-cols-[1fr_1.3fr]",
              )}
            >
              <Placeholder
                label={`Screenshot or photo of ${project.name} in use`}
                className={cn(
                  "h-60 rounded-md border border-border bg-surface lg:h-140",
                  !imageFirst && "lg:order-2",
                )}
              />
              <div className="flex flex-col justify-center gap-3.5 lg:gap-5">
                <div className="flex items-center gap-3.5">
                  <StatusBadge status="live" />
                  <span className="font-mono text-meta text-ink-muted lg:hidden">
                    for <Fill value={project.client} />
                  </span>
                </div>
                <h2
                  id={`${project.slug}-title`}
                  className="font-display text-h1 text-heading"
                >
                  {project.name}
                </h2>
                <p className="text-h3 text-ink">
                  <Fill value={project.summary} />
                </p>
                <dl className="flex flex-col gap-2 border-t border-border pt-4 text-body">
                  <div className="hidden gap-4 lg:flex">
                    <dt className="w-27.5 shrink-0 font-mono text-meta text-ink-muted">client</dt>
                    <dd className="text-ink">
                      <Fill value={project.client} />
                    </dd>
                  </div>
                  <div className="flex gap-4">
                    <dt className="w-27.5 shrink-0 font-mono text-meta text-ink-muted">what we built</dt>
                    <dd className="text-ink">
                      <Fill value={project.built} />
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-6 text-body font-medium text-primary">
                  <Link href={`${routes.work}/${project.slug}`} className="hover:underline">
                    Read the story <InlineArrow />
                  </Link>
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Visit {project.name} <InlineArrow />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <ConsultationCta
        title="Need something built?"
        body="Tell us how your business works today. We’ll show you what a system built around it could look like."
      />
    </>
  );
}
