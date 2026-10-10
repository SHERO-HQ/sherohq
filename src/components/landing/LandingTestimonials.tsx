"use client";
import { useMemo } from "react";
import { Briefcase } from "lucide-react";
import { SectionBadge } from "@/components/common/SectionBadge";
import { useProjects } from "@/hooks/queries/useProjects";
import { slugify } from "@/lib/slug";
import Link from "next/link";
// Clients that have given permission to be shown. Anyone else is not listed.
// Clients that agreed to be shown. Each line is the first sentence of the
// project's "Challenge / Overview" from the admin.
const SHOWN_CLIENTS = ["TrustCircle", "Tastea", "Dajrim"];

const normalize = (text?: string | null) =>
  (text ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

const firstSentence = (text: string) => {
  const flat = text
    .replace(/\s+/g, " ")
    .replace(/^\s*(the\s+)?challenge\s*[:\-–]\s*/i, "")
    .trim();
  const match = flat.match(/^.*?[.!?](\s|$)/);
  const line = (match ? match[0] : flat).trim();
  return line.length > 140 ? `${line.slice(0, 137).trimEnd()}...` : line;
};

const LandingTestimonials = (_props: { limit?: number } = {}) => {
  const { data: projects = [] } = useProjects();

  const items = useMemo(
    () =>
      SHOWN_CLIENTS.map((name) => {
        const key = normalize(name);
        // The project is found by its title or its client name ("Trust Circle" matches TrustCircle)
        const project = projects.find(
          (p) => normalize(p.title).includes(key) || normalize(p.client).includes(key),
        );
        return {
          name,
          line: project?.description?.trim() ? firstSentence(project.description) : "",
          href: project ? `/work/${slugify(project.title) || project.id}` : null,
        };
      }),
    [projects],
  );

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-slate-950 relative border-t border-slate-200 dark:border-white/5 transition-colors">
      <div className="container px-4 md:px-6 relative z-10 w-full mx-auto md:w-11/12 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <SectionBadge icon={Briefcase} className="mb-2">
            Work we&apos;ve done
          </SectionBadge>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            Work we&apos;ve done
          </h2>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.name}
              className="relative rounded border border-slate-200 dark:border-slate-800 bg-card p-5"
            >
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {item.href ? (
                  <Link href={item.href} className="after:absolute after:inset-0">
                    {item.name}
                  </Link>
                ) : (
                  item.name
                )}
              </p>
              {item.line && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.line}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default LandingTestimonials;
