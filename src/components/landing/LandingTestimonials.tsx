"use client";
import { useMemo } from "react";
import { Briefcase } from "lucide-react";
import { SectionBadge } from "@/components/common/SectionBadge";
import { useProjects } from "@/hooks/queries/useProjects";

// Clients that have given permission to be shown. Anyone else is not listed.
const SHOWN_CLIENTS = ["TrustCircle", "Tastea", "Dajrim"];

const firstSentence = (text: string) => {
  const match = text.trim().match(/^.*?[.!?](\s|$)/);
  const line = (match ? match[0] : text).trim();
  return line.length > 140 ? `${line.slice(0, 137).trimEnd()}...` : line;
};

const LandingTestimonials = (_props: { limit?: number } = {}) => {
  const { data: projects = [] } = useProjects();

  const items = useMemo(
    () =>
      SHOWN_CLIENTS.map((name) => {
        const project = projects.find(
          (p) =>
            p.client?.toLowerCase().includes(name.toLowerCase()) &&
            p.description?.trim(),
        );
        return {
          name,
          line: project?.description
            ? firstSentence(project.description)
            : "A SHERO client.",
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
              className="rounded border border-slate-200 dark:border-slate-800 bg-card p-5"
            >
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {item.name}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.line}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default LandingTestimonials;
