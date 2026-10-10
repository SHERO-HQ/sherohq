import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { Project } from "@/services/api";
import AppImage from "@/components/common/AppImage";
import { statusLabel, STATUS_DOT } from "@/lib/project-status";

interface PortfolioCardProps {
  project: Project;
  href: string;
}

// Static card: no entrance animation, blur or scale, so nothing repaints
// or flashes while scrolling.
export function PortfolioCard({ project, href }: PortfolioCardProps) {
  const hasImage =
    !!project.image &&
    (project.image.startsWith("http") ||
      project.image.startsWith("/") ||
      project.image.includes("."));
  const status = statusLabel(project.status);
  const technologies = project.technologies ?? [];

  return (
    <article className="group relative flex h-full flex-row overflow-hidden sm:flex-col rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {/* Image, with the status on top of it */}
      <div className="relative w-28 shrink-0 self-stretch overflow-hidden sm:aspect-[16/9] sm:w-auto sm:self-auto bg-slate-100 dark:bg-slate-950">
        {hasImage ? (
          <AppImage
            src={project.image as string}
            alt=""
            fill
            sizes="(max-width: 640px) 112px, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center bg-brand-secondary-50 dark:bg-brand-secondary-900/20"
          >
            <span className="font-sora text-5xl font-bold text-brand-secondary-300 dark:text-brand-secondary-700">
              {project.title.trim().charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="absolute left-3 top-3 hidden items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-800 shadow-sm dark:bg-slate-900/95 dark:text-slate-100 sm:inline-flex">
          <span className={`size-1.5 rounded-full ${STATUS_DOT[project.status] ?? STATUS_DOT.live}`} aria-hidden="true" />
          {status}
        </span>
      </div>

      {/* Text */}
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 sm:hidden">
          <span className={`size-1.5 rounded-full ${STATUS_DOT[project.status] ?? STATUS_DOT.live}`} aria-hidden="true" />
          {status}
        </p>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-secondary-700 dark:text-brand-secondary-400">
          {project.category}
          {project.client && (
            <span className="font-normal normal-case tracking-normal text-slate-500 dark:text-slate-400">
              {" "}
              · For {project.client}
            </span>
          )}
        </p>

        <h3 className="mt-1.5 font-sora text-base font-bold leading-snug text-slate-900 dark:text-white">
          {/* Stretched link makes the whole card clickable */}
          <Link href={href} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h3>

        {project.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {project.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p className="min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">
            {technologies.slice(0, 3).join(" · ")}
            {technologies.length > 3 ? ` · +${technologies.length - 3}` : ""}
          </p>
          <div className="flex shrink-0 items-center gap-3">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${project.title}`}
                className="relative z-10 text-slate-400 hover:text-brand-secondary-700 dark:hover:text-brand-secondary-400"
              >
                <ExternalLink className="size-4" />
              </a>
            )}
            <ArrowUpRight
              aria-hidden="true"
              className="size-5 text-slate-400 transition-colors group-hover:text-brand-secondary-700 dark:group-hover:text-brand-secondary-400"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
