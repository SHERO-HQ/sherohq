import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConsultationCta } from "@/components/home/ConsultationCta";
import { Fill } from "@/components/ui/Fill";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { Placeholder } from "@/components/ui/Placeholder";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getProject, projects } from "@/content/work";
import { isMissing } from "@/lib/content";
import { routes } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
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
    <section className="container-site grid gap-3 pt-10 lg:grid-cols-[1fr_1.6fr] lg:gap-x-20 lg:gap-y-8 lg:pt-20">
      <h2 className="font-display text-2xl/[29px] font-bold text-heading lg:text-4xl/[42px] lg:tracking-[-0.02em]">
        {title}
      </h2>
      <p className="max-w-[720px] text-base/[26px] text-ink lg:text-xl/8">
        <Fill value={body} />
      </p>
      {children && <div className="lg:col-start-2">{children}</div>}
    </section>
  );
}

export default async function CaseStudyPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];

  const facts = [
    { label: "client", value: project.client },
    { label: "what we built", value: project.built },
    { label: "status", value: "Live, in production" },
    { label: "year", value: project.year },
  ];

  return (
    <>
      <nav aria-label="Breadcrumb" className="container-site pt-5 font-mono text-[13px]/[18px] text-ink-muted lg:pt-7">
        <Link href={routes.work} className="text-ink-secondary hover:text-primary">
          work
        </Link>{" "}
        / {project.slug}
      </nav>

      <section className="container-site flex flex-col gap-4 py-7 lg:gap-7 lg:py-14">
        <div className="flex items-center gap-3.5">
          <Placeholder
            label={`${project.name} logo`}
            className="h-9 border border-dashed border-border px-3 lg:h-10 lg:px-3.5"
          />
          <StatusBadge status="live" />
        </div>
        <h1 className="max-w-[1100px] font-display text-[30px]/[34px] font-bold tracking-[-0.03em] text-heading lg:text-6xl/[62px] lg:tracking-[-0.035em]">
          <Fill value={project.outcome} scale={0.5} className="leading-tight" />
        </h1>
      </section>

      <section className="container-site">
        <dl className="grid grid-cols-2 border-t border-rule-strong lg:grid-cols-4 lg:border-b lg:border-border">
          {facts.map((fact, i) => (
            <div
              key={fact.label}
              className={
                "flex flex-col gap-1.5 border-b border-border py-4 lg:border-b-0 lg:py-[18px] " +
                (i % 2 === 0 ? "pr-3 " : "border-l pl-3 ") +
                (i === 0 ? "lg:pr-6 lg:pl-0" : "lg:border-l lg:px-6")
              }
            >
              <dt className="font-mono text-xs/4 text-ink-muted">{fact.label}</dt>
              <dd className="text-[15px]/[22px] font-medium text-ink lg:text-base/6">
                <Fill value={fact.value} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="container-site pt-8 lg:pt-14">
        <Placeholder
          label={`Wide screenshot or photo of ${project.name} in use`}
          className="h-[240px] rounded-md border border-border bg-surface lg:h-[620px]"
        />
      </div>

      <Chapter title="The problem" body={project.problem} />
      <Chapter title="What we built" body={project.solution}>
        <Placeholder
          label="Screenshot: the main screen"
          className="h-[220px] rounded-md border border-border bg-surface lg:h-[420px]"
        />
      </Chapter>
      <Chapter title="The result" body={project.result} />

      {project.quote && (
        <section className="container-site pt-12 lg:pt-24">
          <figure className="flex flex-col gap-5 border-y border-border py-8 lg:py-12">
            <blockquote className="max-w-[980px] font-display text-[22px]/[30px] font-semibold text-heading lg:text-[32px]/[42px] lg:tracking-[-0.015em]">
              {project.quote.text}
            </blockquote>
            <figcaption className="font-mono text-xs/4 text-ink-muted">{project.quote.attribution}</figcaption>
          </figure>
        </section>
      )}

      <section className="container-site flex items-center justify-between gap-8 pt-12 lg:pt-16">
        <span className="font-mono text-xs/4 text-ink-muted">next project</span>
        <Link
          href={`${routes.work}/${next.slug}`}
          className="font-display text-[26px]/8 font-bold tracking-[-0.02em] text-heading hover:text-primary-hover lg:text-[40px]/[44px]"
        >
          {next.name} <InlineArrow />
        </Link>
      </section>

      <ConsultationCta
        title="Need something built?"
        body="Tell us how your business works today. We’ll show you what a system built around it could look like."
      />
    </>
  );
}
