import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConsultationCta } from "@/components/home/ConsultationCta";
import { Fill } from "@/components/ui/Fill";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { Placeholder } from "@/components/ui/Placeholder";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getPublishedProject, getPublishedProjects } from "@/lib/work";
import { isMissing } from "@/lib/content";
import { routes } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

// Built ahead for the projects known at deploy time, refreshed when the admin
// saves one; a project published later is built on first visit.
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPublishedProjects()).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getPublishedProject((await params).slug);
  if (!project) return {};
  const client = isMissing(project.client) ? "" : ` for ${project.client}`;
  return {
    title: `${project.name}: case study`,
    description: `How SHERO built ${project.name}${client}. Live and in use today.`,
    alternates: { canonical: `${routes.work}/${project.slug}` },
  };
}

function Chapter({ title, body, children }: { title: string; body: React.ComponentProps<typeof Fill>["value"]; children?: React.ReactNode }) {
  return (
    <section className="container-site grid gap-3 lg:grid-cols-[1fr_1.6fr] lg:gap-x-20 lg:gap-y-8 pt-section">
      <h2 className="font-display text-h2 text-heading">
        {title}
      </h2>
      <p className="max-w-measure text-body-lg text-ink">
        <Fill value={body} />
      </p>
      {children && <div className="lg:col-start-2">{children}</div>}
    </section>
  );
}

export default async function CaseStudyPage({ params }: Props) {
  const [project, projects] = await Promise.all([getPublishedProject((await params).slug), getPublishedProjects()]);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.id === project.id);
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;

  const facts = [
    { label: "client", value: project.client },
    { label: "what we built", value: project.built },
    { label: "status", value: "Live, in production" },
    { label: "year", value: project.year },
  ];

  return (
    <>
      <nav aria-label="Breadcrumb" className="container-site pt-5 font-mono text-meta text-ink-muted lg:pt-7">
        <Link href={routes.work} className="text-ink-secondary underline underline-offset-3 hover:text-primary">
          work
        </Link>{" "}
        / {project.slug}
      </nav>

      <section className="container-site flex flex-col gap-4 lg:gap-7 py-section">
        <div className="flex items-center gap-3.5">
          {project.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.logoUrl} alt={`${project.name} logo`} className="h-9 w-auto lg:h-10" />
          ) : (
            <Placeholder
              label={`${project.name} logo`}
              className="h-9 border border-dashed border-border px-3 lg:h-10 lg:px-3.5"
            />
          )}
          <StatusBadge status="live" />
        </div>
        <h1 className="max-w-6xl font-display text-h1 text-heading">
          <Fill value={project.outcome} scale={0.5} className="" />
        </h1>
      </section>

      <section className="container-site">
        <dl className="grid grid-cols-2 border-t border-border lg:grid-cols-4 lg:border-b lg:border-border">
          {facts.map((fact, i) => (
            <div
              key={fact.label}
              className={
                "flex flex-col gap-1.5 border-b border-border py-4 lg:border-b-0 lg:py-4.5 " +
                (i % 2 === 0 ? "pr-3 " : "border-l pl-3 ") +
                (i === 0 ? "lg:pr-6 lg:pl-0" : "lg:border-l lg:px-6")
              }
            >
              <dt className="font-mono text-meta text-ink-muted">{fact.label}</dt>
              <dd className="text-body font-medium text-ink">
                <Fill value={fact.value} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="container-site pt-section">
        {project.screenshots[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.screenshots[0]}
            alt={`${project.name} in use`}
            fetchPriority="high"
            className="h-60 w-full rounded-md border border-border bg-surface object-cover object-top lg:h-155"
          />
        ) : (
          <Placeholder
            label={`Wide screenshot or photo of ${project.name} in use`}
            className="h-60 rounded-md border border-border bg-surface lg:h-155"
          />
        )}
      </div>

      <Chapter title="The problem" body={project.problem} />
      <Chapter title="What we built" body={project.solution}>
        {project.screenshots[1] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.screenshots[1]}
            alt={`The main screen of ${project.name}`}
            loading="lazy"
            className="h-55 w-full rounded-md border border-border bg-surface object-cover object-top lg:h-105"
          />
        ) : (
          <Placeholder label="Screenshot: the main screen" className="h-55 rounded-md border border-border bg-surface lg:h-105" />
        )}
      </Chapter>
      <Chapter title="The result" body={project.result} />

      {next ? (
        <section className="container-site flex items-center justify-between gap-8 py-section">
          <span className="font-mono text-meta text-ink-muted">next project</span>
          <Link href={`${routes.work}/${next.slug}`} className="font-display text-h1 text-heading hover:text-primary-hover">
            {next.name} <InlineArrow />
          </Link>
        </section>
      ) : (
        <div className="pb-section" />
      )}

      <ConsultationCta
        title="Need something built?"
        body="Tell us how your business works today. We’ll show you what a system built around it could look like."
      />
    </>
  );
}
