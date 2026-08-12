"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjects } from "@/hooks/queries/useProjects";
import { m } from "motion/react";
import { Wrench } from "lucide-react";
import { type Project } from "@/services/api";
import { PortfolioCard } from "./PortfolioCard";
import { PortfolioDrawer } from "./PortfolioDrawer";

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const categories = [
    "All",
    "Web Development",
    "Mobile Apps",
    "Infrastructure",
    "Custom Software",
  ];

  const FEATURED_FALLBACK_PROJECTS: Project[] = [
    {
      id: "dajrim",
      title: "Dajrim Platform",
      category: "Custom Software",
      client: "SHERO Ecosystem",
      description: "Digital management and operational platform built to streamline business workflows and digital service delivery.",
      useCase: "Digital Business Management & Operations",
      technologies: ["Next.js", "TypeScript", "TailwindCSS", "Node.js"],
      image: null,
      link: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: "samakose-trustcircle",
      title: "Samakose / TrustCircle",
      category: "Web Development",
      client: "Community & Financial Growth",
      description: "Trusted collaborative ecosystem enabling secure community circles, transparent financial tracking, and shared resource growth.",
      useCase: "Community Trust & Shared Resource Management",
      technologies: ["React", "TypeScript", "PostgreSQL", "TailwindCSS"],
      image: null,
      link: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: "hardware-it-infrastructure",
      title: "Managed IT & Hardware Deployment",
      category: "Infrastructure",
      client: "Regional Enterprise Hub",
      description: "Full-scale hardware supply, workstation setup, and high-availability IT infrastructure for business operations.",
      useCase: "Managed Hardware & Infrastructure Setup",
      technologies: ["HP & Dell Hardware", "Network Routing", "Systems IT Support"],
      image: null,
      link: null,
      createdAt: new Date().toISOString(),
    },
  ];

  const { data: projects = [], isLoading } = useProjects(
    activeCategory === "All" ? undefined : activeCategory,
  );

  const activeProjects = projects.length > 0 ? projects : FEATURED_FALLBACK_PROJECTS;

  const filteredProjects = activeProjects.filter((p) => {
    if (activeCategory === "All") return true;
    return p.category === activeCategory;
  });

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
          <span className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-[10px] font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-200/20 border border-brand-secondary-500/50 dark:border-brand-secondary-800/50 rounded uppercase transition-colors duration-300">
            <Wrench className="size-4" />
            Our Work
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 transition-colors duration-300">
            What We've Built
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore our portfolio of successful projects and see how we've
            helped businesses transform digitally
          </p>
        </m.div>

        {/* Category Filters */}
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
                  className="px-6 py-2 text-sm whitespace-nowrap data-[state=active]:bg-brand-secondary-600 data-[state=active]:text-white data-[state=active]:shadow transition duration-300"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

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
                onSelect={(p) => setSelectedProject(p)}
              />
            ))}
        </div>

        {mounted &&
          createPortal(
            <PortfolioDrawer
              selectedProject={selectedProject}
              onClose={() => setSelectedProject(null)}
            />,
            document.body,
          )}
      </div>
    </section>
  );
};

export default Portfolio;
