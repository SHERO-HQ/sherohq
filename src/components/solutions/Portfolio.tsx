"use client";

import { useProjects } from "@/hooks/queries/useProjects";
import { Wrench } from "lucide-react";
import { SectionBadge } from "@/components/common/SectionBadge";
import { PortfolioCard } from "./PortfolioCard";
import { slugify } from "@/lib/slug";

const GROUPS = [
  { type: "client", title: "Built for clients" },
  { type: "product", title: "Built by SHERO" },
] as const;

const Portfolio = ({ hideWhenEmpty = true }: { hideWhenEmpty?: boolean } = {}) => {
  const { data: projects = [], isLoading } = useProjects();

  // Nothing uploaded yet: show no empty section.
  if (hideWhenEmpty && !isLoading && projects.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full py-10 bg-slate-50 dark:bg-slate-950">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <SectionBadge icon={Wrench} className="mb-4">
            Our Work
          </SectionBadge>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 transition-colors">
            What We&apos;ve Built
          </h2>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={`project-skeleton-${i}`}
                className="h-80 bg-slate-100 dark:bg-slate-900 animate-pulse rounded border border-slate-200 dark:border-slate-800"
              />
            ))}
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <p className="py-16 text-center text-lg text-slate-500 dark:text-slate-400">
            Projects will be listed here soon.
          </p>
        )}

        {!isLoading &&
          GROUPS.map((group) => {
            const items = projects.filter(
              (p) => (p.type === "product" ? "product" : "client") === group.type,
            );
            if (items.length === 0) return null;
            return (
              <div key={group.type} className="mb-12 last:mb-0">
                <h3 className="mb-5 text-lg font-bold text-slate-900 dark:text-slate-100">
                  {group.title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((project) => (
                    <PortfolioCard
                      key={project.id}
                      project={project}
                      href={`/work/${slugify(project.title) || project.id}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
};

export default Portfolio;
