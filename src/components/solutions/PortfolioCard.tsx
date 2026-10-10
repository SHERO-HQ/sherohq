import Link from "next/link";
import { ExternalLink, Layers } from "lucide-react";
import type { Project } from "@/services/api";
import AppImage from "@/components/common/AppImage";
import { getTechColor, getCategoryIcon } from "./portfolioUtils";

interface PortfolioCardProps {
  project: Project;
  href: string;
}

// Plain, static card: no entrance animation, blur or scale, so nothing
// repaints or flashes while scrolling.
export function PortfolioCard({ project, href }: PortfolioCardProps) {
  const hasImage =
    !!project.image &&
    (project.image.startsWith("http") ||
      project.image.startsWith("/") ||
      project.image.includes("."));

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded border border-slate-200 bg-white transition-colors hover:border-brand-secondary-500 dark:border-slate-800 dark:bg-slate-900">
      <div className="relative aspect-video shrink-0 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
        {hasImage ? (
          <AppImage
            src={project.image as string}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Layers className="h-8 w-8 text-slate-300 dark:text-slate-700" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-brand-secondary-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-brand-secondary-700 dark:bg-brand-secondary-900/30 dark:text-brand-secondary-400">
            {getCategoryIcon(project.category)}
            {project.category}
          </span>
          {project.status === "in_development" && (
            <span className="inline-flex items-center rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              In development
            </span>
          )}
          {project.client && (
            <span className="text-[10px] font-medium text-slate-500">
              for {project.client}
            </span>
          )}
        </div>

        <div className="flex-1 space-y-1.5">
          <h3 className="font-sora text-base font-bold leading-snug text-slate-900 dark:text-white">
            {/* Stretched link makes the whole card clickable */}
            <Link href={href} className="after:absolute after:inset-0">
              {project.title}
            </Link>
          </h3>
          {project.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {project.description}
            </p>
          )}
        </div>

        {project.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-2 dark:border-slate-800">
            {project.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className={`rounded border px-2 py-0.5 text-[9px] font-medium ${getTechColor(tech)}`}
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="mt-0.5 pl-0.5 font-mono text-[9px] text-slate-500">
                +{project.technologies.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary-700 dark:text-brand-secondary-400">
            View details
          </span>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-brand-secondary-700 dark:hover:text-brand-secondary-400"
            >
              <span>Visit</span>
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
