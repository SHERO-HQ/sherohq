"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjects } from "@/hooks/queries/useProjects";
import { m } from "motion/react";
import { Wrench } from "lucide-react";
import { SectionBadge } from "@/components/common/SectionBadge";
import { PortfolioCard } from "./PortfolioCard";
import { slugify } from "@/lib/slug";

const Portfolio = ({ hideWhenEmpty = true }: { hideWhenEmpty?: boolean } = {}) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const router = useRouter();

  const allCategoryDefinitions = [
    "All",
    "Web Development",
    "Mobile Apps",
    "Infrastructure",
    "Custom Software",
    "Products",
  ];

  const { data: projects = [], isLoading } = useProjects(
    activeCategory === "All" ? undefined : activeCategory,
  );

  const activeProjects = projects;

  // Filter out any categories that have zero active projects
  const presentCategories = new Set(activeProjects.map((p) => p.category));
  const categories = allCategoryDefinitions.filter(
    (c) => c === "All" || presentCategories.has(c),
  );

  const filteredProjects = activeProjects.filter((p) => {
    if (activeCategory === "All") return true;
    return p.category === activeCategory;
  });

  // Nothing uploaded yet: show no empty section and no filter row.
  if (hideWhenEmpty && !isLoading && projects.length === 0 && activeCategory === "All") {
    return null;
  }

  return (
    <section className="relative w-full py-10 bg-slate-50 dark:bg-slate-950">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <SectionBadge icon={Wrench} className="mb-4">
            Our Work
          </SectionBadge>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 transition-colors ">
            What We've Built
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore our portfolio of successful projects and see how we've
            helped businesses transform digitally
          </p>
        </m.div>

        {/* Category Filters */}
        {categories.length > 1 && (
        <div className="flex justify-center mb-8">
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full"
          >
            <TabsList className="w-full max-w-fit mx-auto h-auto p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar justify-start sm:justify-center flex-nowrap">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="px-6 py-2 text-sm whitespace-nowrap data-[state=active]:bg-brand-secondary-600 data-[state=active]:text-white data-[state=active]:shadow transition "
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading &&
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={`project-skeleton-${i}`}
                className="h-80 bg-slate-100 dark:bg-slate-900 animate-pulse rounded border border-slate-200 dark:border-slate-800"
              />
            ))}

          {!isLoading && filteredProjects.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                No projects found in this category
              </p>
            </div>
          )}

          {!isLoading &&
            filteredProjects.map((project, idx) => (
              <PortfolioCard
                key={project.id}
                project={project}
                idx={idx}
                onSelect={(p) => router.push(`/work/${slugify(p.title) || p.id}`)}
              />
            ))}
        </div>

      </div>
    </section>
  );
};

export default Portfolio;
