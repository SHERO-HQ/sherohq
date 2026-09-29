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
      <section className="container-site flex flex-col gap-3.5 pt-8 pb-7 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pt-24 lg:pb-[72px]">
        <h1 className="font-display text-4xl/[37px] font-bold tracking-[-0.03em] text-heading lg:text-[72px]/[74px] lg:tracking-[-0.035em]">
          Built by SHERO,
          <br className="hidden lg:block" /> running today.
        </h1>
        <p className="max-w-[420px] text-[17px]/[26px] text-ink-secondary lg:text-lg/7">
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
                "container-site grid gap-5 py-9 lg:gap-[72px] lg:py-[72px]",
                imageFirst ? "lg:grid-cols-[1.3fr_1fr]" : "lg:grid-cols-[1fr_1.3fr]",
              )}
            >
              <Placeholder
                label={`Screenshot or photo of ${project.name} in use`}
                className={cn(
                  "h-[240px] rounded-md border border-border bg-surface lg:h-[560px]",
                  !imageFirst && "lg:order-2",
                )}
              />
              <div className="flex flex-col justify-center gap-3.5 lg:gap-5">
                <div className="flex items-center gap-3.5">
                  <StatusBadge status="live" />
                  <span className="font-mono text-xs/4 text-ink-muted lg:hidden">
                    for <Fill value={project.client} />
                  </span>
                </div>
                <h2
                  id={`${project.slug}-title`}
                  className="font-display text-[32px]/9 font-bold tracking-[-0.02em] text-heading lg:text-5xl/[52px] lg:tracking-[-0.025em]"
                >
                  {project.name}
                </h2>
                <p className="text-[17px]/[26px] text-ink lg:text-xl/[31px]">
                  <Fill value={project.summary} />
                </p>
                <dl className="flex flex-col gap-2 border-t border-border pt-4 text-[15px]/5">
                  <div className="hidden gap-4 lg:flex">
                    <dt className="w-[110px] shrink-0 font-mono text-xs/5 text-ink-muted">client</dt>
                    <dd className="text-ink">
                      <Fill value={project.client} />
                    </dd>
                  </div>
                  <div className="flex gap-4">
                    <dt className="w-[110px] shrink-0 font-mono text-xs/5 text-ink-muted">what we built</dt>
                    <dd className="text-ink">
                      <Fill value={project.built} />
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-6 text-[15px]/[22px] font-medium text-primary lg:text-sm/5">
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
