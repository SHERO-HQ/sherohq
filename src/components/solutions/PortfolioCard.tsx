import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/services/api";
import AppImage from "@/components/common/AppImage";
import { statusLabel, STATUS_DOT } from "@/lib/project-status";
import { firstSentence, hasImage, isMark } from "@/lib/project-text";
import { cn } from "@/lib/utils";

interface PortfolioCardProps {
  project: Project;
  href: string;
}

// Static card: no entrance animation, blur or scale, so nothing repaints
// or flashes while scrolling. Phones get a compact row, larger screens a
// screenshot on top with the challenge underneath.
export function PortfolioCard({ project, href }: PortfolioCardProps) {
  const image = hasImage(project.image) ? project.image : null;
  const status = statusLabel(project.status);
  const technologies = project.technologies ?? [];
  const summary = firstSentence(project.description);

  return (
    <article className="group relative flex h-full flex-row overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-300 sm:flex-col dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="relative w-28 shrink-0 self-stretch overflow-hidden border-slate-200 bg-slate-100 sm:aspect-[16/10] sm:w-auto sm:self-auto sm:border-b dark:border-slate-800 dark:bg-slate-950">
        {image ? (
          <AppImage
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 112px, (max-width: 1024px) 50vw, 400px"
            className={cn(isMark(image) ? "object-contain p-[14%]" : "object-cover object-top")}
          />
        ) : (
          <div aria-hidden="true" className="flex h-full w-full items-center justify-center">
            <span className="text-5xl font-bold text-slate-300 dark:text-slate-700">
              {project.title.trim().charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
        <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          {project.category}
          {project.client && ` · For ${project.client}`}
        </p>

        <h3 className="mt-1 flex items-start justify-between gap-3 break-words text-base font-bold leading-snug text-slate-900 sm:mt-2 sm:text-xl dark:text-white">
          {/* Stretched link makes the whole card clickable */}
          <Link href={href} className="after:absolute after:inset-0 after:rounded-xl">
            {project.title}
          </Link>
          <ArrowUpRight
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-primary-600 dark:group-hover:text-brand-primary-300"
          />
        </h3>

        {summary && (
          <p className="mt-2 truncate text-sm text-slate-600 sm:line-clamp-3 sm:whitespace-normal sm:text-base sm:leading-relaxed dark:text-slate-300">
            {summary}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 sm:pt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">
            <span className={cn("size-1.5 rounded-full", STATUS_DOT[project.status] ?? STATUS_DOT.live)} aria-hidden="true" />
            {status}
          </span>
          {technologies.slice(0, 2).map((tech) => (
            <span
              key={tech}
              className="hidden rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-500 sm:inline dark:border-slate-700 dark:text-slate-400"
            >
              {tech}
            </span>
          ))}
          {technologies.length > 2 && (
            <span className="hidden text-xs text-slate-500 sm:inline dark:text-slate-400">
              +{technologies.length - 2}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
