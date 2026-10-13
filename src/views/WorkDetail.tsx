"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import AppImage from "@/components/common/AppImage";
import { statusLabel, STATUS_DOT } from "@/lib/project-status";
import { firstSentence, hasImage, isMark, toBlocks } from "@/lib/project-text";
import { cn } from "@/lib/utils";

interface WorkDetailProps {
  project: {
    id: string;
    title: string;
    category: string;
    status: "live" | "in_development" | "in_validation" | "paused";
    type: "client" | "product";
    client: string | null;
    description: string | null;
    useCase: string | null;
    technologies: string[];
    image: string | null;
    link: string | null;
  };
}

// Where "Join the free pilot" goes. This wins over the link saved in the admin.
const PRODUCT_LINKS: Record<string, string> = {
  merchander: "https://app.merchander.app/signup",
};

// One line shown under Status for products that are still being built.
const PRODUCT_NOTES: Record<string, string> = {
  merchander: "Join the free pilot to be among the first merchants to use it.",
};

// Plain text from the admin as paragraphs, numbered and bulleted lists.
function FormattedText({ text }: { text: string }) {
  return (
    <div className="space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
      {toBlocks(text).map((block, i) =>
        block.type === "p" ? (
          <p key={i}>{block.text}</p>
        ) : block.type === "ol" ? (
          <ol key={i} className="list-decimal space-y-2 pl-6 marker:font-semibold marker:text-foreground">
            {block.items.map((item, j) => (
              <li key={j} className="pl-1">{item}</li>
            ))}
          </ol>
        ) : (
          <ul key={i} className="list-disc space-y-2 pl-6">
            {block.items.map((item, j) => (
              <li key={j} className="pl-1">{item}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

const WorkDetail = ({ project }: WorkDetailProps) => {
  const isProduct = project.type === "product";
  const ctaLabel = isProduct ? "Join the free pilot" : `Visit ${project.title}`;
  const key = project.title.trim().toLowerCase();
  const ctaHref = (isProduct ? PRODUCT_LINKS[key] : null) || project.link || null;
  const statusNote =
    isProduct && project.status !== "live" ? PRODUCT_NOTES[key] : undefined;
  const image = hasImage(project.image) ? project.image : null;
  const status = statusLabel(project.status);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <section className="pt-8 pb-10">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Our Work
          </Link>

          <p className="text-sm text-muted-foreground">
            {project.category}
            {project.client && ` · For ${project.client}`}
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            {project.title}
          </h1>
          {project.description && (
            <p className="mt-5 max-w-3xl text-lg md:text-xl leading-relaxed text-muted-foreground">
              {firstSentence(project.description)}
            </p>
          )}
        </div>
      </section>

      {image && (
        <section className="pb-12">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border bg-muted">
              <AppImage
                src={image}
                alt={`${project.title} preview`}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1152px"
                className={cn(isMark(image) ? "object-contain p-[12%]" : "object-cover object-top")}
              />
              {project.status !== "live" && (
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm dark:bg-slate-900/95 dark:text-slate-100">
                  Preview
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="pb-16">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-12 max-w-3xl">
            {project.description && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {isProduct ? "The problem" : "The challenge"}
                </h2>
                <FormattedText text={project.description} />
              </div>
            )}

            {project.useCase && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {isProduct ? "What it does" : "What we built"}
                </h2>
                <FormattedText text={project.useCase} />
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 self-start rounded-xl border border-border bg-card p-6">
            <h2 className="sr-only">Project details</h2>
            <dl className="space-y-5 text-sm">
              {project.client && (
                <div>
                  <dt className="text-muted-foreground">Client</dt>
                  <dd className="mt-1 font-medium">{project.client}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Category</dt>
                <dd className="mt-1 font-medium">{project.category}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="mt-1 inline-flex items-center gap-2 font-medium">
                  <span
                    className={cn("size-2 rounded-full", STATUS_DOT[project.status] ?? STATUS_DOT.live)}
                    aria-hidden="true"
                  />
                  {status}
                </dd>
                {statusNote && <dd className="mt-1 text-muted-foreground">{statusNote}</dd>}
              </div>
              {project.technologies.length > 0 && (
                <div>
                  <dt className="text-muted-foreground">Built with</dt>
                  <dd className="mt-2">
                    <ul className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <li
                          key={tech}
                          className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6">
              {ctaHref && (
                <a
                  href={ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded bg-brand-primary-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-primary-800 dark:bg-brand-primary-500 dark:hover:bg-brand-primary-400"
                >
                  {ctaLabel}
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
              <Link
                href="/consultation"
                className="inline-flex h-9 items-center justify-center gap-2 rounded border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                Talk to us
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default WorkDetail;
