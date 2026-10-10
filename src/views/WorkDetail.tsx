"use client";

import Link from "next/link";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import AppImage from "@/components/common/AppImage";
import { statusLabel } from "@/lib/project-status";

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

// Where "Join the free pilot" goes when a product has no link saved.
const PRODUCT_LINKS: Record<string, string> = {
  merchander: "https://merchander.app",
};

const BULLET = /^\s*(?:[-*•]\s+)/;

// Turns plain text from the admin into paragraphs and bullet lists.
// A bullet that runs on from the intro sentence ("... • Feature") is split out.
function FormattedText({ text }: { text: string }) {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/([^\n])\s+•\s+/g, "$1\n• ")
    .split("\n");
  const blocks: { type: "p" | "ul"; items: string[] }[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (BULLET.test(line)) {
      const item = line.replace(BULLET, "");
      const last = blocks[blocks.length - 1];
      if (last?.type === "ul") last.items.push(item);
      else blocks.push({ type: "ul", items: [item] });
    } else {
      blocks.push({ type: "p", items: [line] });
    }
  }
  return (
    <div className="space-y-3 text-muted-foreground leading-relaxed">
      {blocks.map((block, i) =>
        block.type === "ul" ? (
          <ul key={i} className="list-disc space-y-1.5 pl-6">
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{block.items[0]}</p>
        ),
      )}
    </div>
  );
}

const WorkDetail = ({ project }: WorkDetailProps) => {
  const isProduct = project.type === "product";
  const ctaLabel = isProduct ? "Join the free pilot" : "Visit";
  const ctaHref =
    project.link ||
    (isProduct ? PRODUCT_LINKS[project.title.trim().toLowerCase()] : null) ||
    null;
  const hasImage =
    !!project.image &&
    (project.image.startsWith("http") ||
      project.image.startsWith("/") ||
      project.image.includes("."));

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <section className="pt-8 pb-6">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Our Work
          </Link>

        </div>
      </section>

      <section className="pb-12">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {hasImage && (
            <div className="relative aspect-video rounded overflow-hidden border border-border">
              <AppImage
                src={project.image as string}
                alt={`${project.title} preview`}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
              {project.status !== "live" && (
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm dark:bg-slate-900/95 dark:text-slate-100">
                  Preview
                </span>
              )}
            </div>
          )}

          <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-2.5 py-1 rounded bg-brand-secondary-100 dark:bg-brand-secondary-900/30 text-brand-secondary-700 dark:text-brand-secondary-400 text-xs font-bold uppercase">
              {project.category}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/30 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              {statusLabel(project.status)}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            {project.title}
          </h1>
          {project.client && (
            <p className="mt-3 text-muted-foreground">For {project.client}</p>
          )}
          </div>

          {project.description && (
            <div>
              <h2 className="text-xl font-bold mb-3">About</h2>
              <FormattedText text={project.description} />
            </div>
          )}

          {project.useCase && (
            <div>
              <h2 className="text-xl font-bold mb-3">Use case</h2>
              <FormattedText text={project.useCase} />
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold mb-3">Status</h2>
            <p className="text-muted-foreground">
              {statusLabel(project.status)}
            </p>
          </div>

          {project.technologies.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3">Built with</h2>
              <ul className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <li
                    key={tech}
                    className="px-3 py-1 rounded border border-border bg-card text-sm text-muted-foreground"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {ctaHref && (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded bg-brand-secondary-800 hover:bg-brand-secondary-700 text-white font-medium text-sm transition-all"
              >
                {ctaLabel}
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <Link
              href="/consultation"
              className="inline-flex items-center gap-2 px-6 py-3 rounded border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WorkDetail;
