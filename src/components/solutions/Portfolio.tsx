"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjects } from "@/hooks/queries/useProjects";
import { motion, AnimatePresence } from "motion/react";
import {
  ExternalLink,
  Code2,
  Smartphone,
  Server,
  Layers,
  Wrench,
  Info,
  Link,
  Copy,
  Check,
  ArrowRight,
  X,
} from "lucide-react";
import { type Project } from "@/services/api";
import AppImage from "@/components/common/AppImage";

const getTechColor = (tech: string) => {
  const name = tech.toLowerCase();
  if (name.includes("react") || name.includes("next")) {
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25";
  }
  if (name.includes("node") || name.includes("express")) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
  }
  if (name.includes("aws") || name.includes("cloud") || name.includes("s3")) {
    return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25";
  }
  if (name.includes("postgres") || name.includes("sql") || name.includes("supabase")) {
    return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25";
  }
  if (name.includes("tailwind") || name.includes("css")) {
    return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25";
  }
  return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/80";
};

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);

  // Prevent background scrolling when details modal is open
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

  // Handle Escape key to close details modal
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const categories = [
    "All",
    "Web Development",
    "Mobile Apps",
    "Infrastructure",
    "Custom Software",
  ];

  const { data: projects = [], isLoading } = useProjects(
    activeCategory === "All" ? undefined : activeCategory,
  );

  const filteredProjects = projects;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Web Development":
        return <Code2 className="w-4 h-4" />;
      case "Mobile Apps":
        return <Smartphone className="w-4 h-4" />;
      case "Infrastructure":
        return <Server className="w-4 h-4" />;
      case "Custom Software":
        return <Layers className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (!isLoading && projects.length === 0 && activeCategory === "All") {
    return null;
  }

  return (
    <section className="relative w-full py-10 bg-slate-50 dark:bg-slate-950">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
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
        </motion.div>

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

        {/* Projects Grid (Upgraded Premium Cards) */}
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
              <motion.div
                key={project.id}
                layoutId={`card-container-${project.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ y: -6, scale: 1.01 }}
                onClick={() => setSelectedProject(project)}
                className="group bg-white/70 dark:bg-slate-900/40 backdrop-blur-md  border border-slate-200 dark:border-slate-800/80 overflow-hidden hover:border-brand-secondary-500/80 dark:hover:border-brand-secondary-500/80 hover:shadow-xl hover:shadow-brand-secondary-500/5 transition-all duration-300 flex flex-col h-full cursor-pointer"
                style={{ borderRadius: 16 }}
              >
                {/* Project Image Box */}
                <motion.div
                  layoutId={`card-image-${project.id}`}
                  className="relative aspect-video bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden shrink-0 border-b border-slate-150 dark:border-slate-800/50"
                >
                  {project.image &&
                    (project.image.startsWith("http") ||
                      project.image.startsWith("/") ||
                      project.image.includes(".")) ? (
                    <AppImage
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-5xl group-hover:scale-103 transition-transform duration-500 select-none">
                      {project.image}
                    </div>
                  )}

                  {/* Hover details overlay */}
                  <div className="absolute inset-0 bg-brand-secondary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="px-3.5 py-2 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded border border-white/10 flex items-center gap-1.5 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md">
                      View Details <Info className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>

                {/* Project Info Block */}
                <div className="p-5 flex flex-col flex-1 gap-3">
                  {/* Category and Client Badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <motion.span
                      layoutId={`card-category-${project.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-secondary-100 dark:bg-brand-secondary-900/30 text-brand-secondary-700 dark:text-brand-secondary-400 text-[10px] font-bold uppercase rounded-full"
                    >
                      {getCategoryIcon(project.category)}
                      {project.category}
                    </motion.span>
                    {project.client && (
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        for {project.client}
                      </span>
                    )}
                  </div>

                  {/* Title & Short Description */}
                  <div className="space-y-1.5 flex-1">
                    <motion.h3
                      layoutId={`card-title-${project.id}`}
                      className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors leading-snug font-sora"
                    >
                      {project.title}
                    </motion.h3>
                    {project.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Tech Badges directly on the card */}
                  {project.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className={`px-2 py-0.5 text-[9px] font-medium rounded border ${getTechColor(tech)}`}
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-0.5 pl-0.5">
                          +{project.technologies.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-2 mt-auto border-t border-slate-100 dark:border-slate-800/40 gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary-600 dark:text-brand-secondary-400 group-hover:underline">
                      View Details
                    </span>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Launch</span>
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        <AnimatePresence>
          {selectedProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
                onClick={() => setSelectedProject(null)}
              />

              {/* Modal Panel (morphic card container) */}
              <motion.div
                layoutId={`card-container-${selectedProject.id}`}
                className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800  overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh] custom-scrollbar"
                style={{ borderRadius: 16 }}
              >
                {/* Close Button floating absolute on top right */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/50 hover:bg-slate-950/75 text-white backdrop-blur-md transition-all duration-200 border border-white/10 hover:scale-105 cursor-pointer active:scale-95"
                  aria-label="Close Case Study"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Hero Image Section */}
                <motion.div
                  layoutId={`card-image-${selectedProject.id}`}
                  className="relative aspect-video md:aspect-21/9 w-full bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 overflow-hidden border-b border-slate-200 dark:border-slate-800 shrink-0"
                >
                  {selectedProject.image &&
                    (selectedProject.image.startsWith("http") ||
                      selectedProject.image.startsWith("/") ||
                      selectedProject.image.includes(".")) ? (
                    <AppImage
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 1024px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl select-none">
                      {selectedProject.image}
                    </div>
                  )}
                </motion.div>

                {/* Scrollable Body */}
                <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                  {/* Header Information */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <motion.span
                        layoutId={`card-category-${selectedProject.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-secondary-100 dark:bg-brand-secondary-900/30 text-brand-secondary-700 dark:text-brand-secondary-400 text-xs font-bold uppercase rounded-full border border-brand-secondary-200/50 dark:border-brand-secondary-800/50"
                      >
                        {getCategoryIcon(selectedProject.category)}
                        {selectedProject.category}
                      </motion.span>
                      {selectedProject.client && (
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          for {selectedProject.client}
                        </span>
                      )}
                    </div>
                    <motion.h3
                      layoutId={`card-title-${selectedProject.id}`}
                      className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight"
                    >
                      {selectedProject.title}
                    </motion.h3>
                  </div>

                  {/* Split Pane Details Content */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    {/* Left Column (Metadata Details - 2 Cols) */}
                    <div className="md:col-span-2 space-y-6">
                      {selectedProject.client && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                            Client / Partner
                          </span>
                          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                            {selectedProject.client}
                          </p>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                          Industry / Category
                        </span>
                        <div className="flex items-center gap-2 text-base font-medium text-slate-800 dark:text-slate-200">
                          {getCategoryIcon(selectedProject.category)}
                          <span>{selectedProject.category}</span>
                        </div>
                      </div>

                      {/* Technologies (using specialized gradients) */}
                      {selectedProject.technologies?.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                            Technology Stack
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedProject.technologies.map((tech) => (
                              <span
                                key={tech}
                                className={`px-2.5 py-1 text-xs font-medium rounded border ${getTechColor(tech)}`}
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Project Live Link Details */}
                      {selectedProject.link && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                            Live Link
                          </span>
                          <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200/50 dark:border-slate-800/80 overflow-hidden">
                            <Link className="size-3.5 text-brand-secondary-600 dark:text-brand-secondary-400 shrink-0" />
                            <code className="text-[11px] text-slate-600 dark:text-slate-400 truncate flex-1 font-mono">
                              {selectedProject.link}
                            </code>
                            <button
                              onClick={() => copyToClipboard(selectedProject.link!)}
                              className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 cursor-pointer active:scale-90"
                              title="Copy link to clipboard"
                            >
                              {copied ? (
                                <Check className="size-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column (Overview & Case details - 3 Cols) */}
                    <div className="md:col-span-3 space-y-6">
                      {selectedProject.description && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                            Project Overview
                          </span>
                          <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
                            {selectedProject.description}
                          </p>
                        </div>
                      )}

                      {selectedProject.useCase && (
                        <div className="space-y-2.5">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                            Strategic Solution
                          </span>
                          <div className="relative p-5 bg-linear-to-br from-brand-secondary-50/50 to-slate-50/50 dark:from-brand-secondary-950/10 dark:to-slate-900/30 rounded-xl border border-brand-secondary-500/20 dark:border-brand-secondary-500/10 overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-5 text-brand-secondary-600 dark:text-brand-secondary-400 select-none pointer-events-none">
                              <Info className="w-16 h-16" />
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed relative z-10">
                              &quot;{selectedProject.useCase}&quot;
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Sticky Action Bar */}
                {selectedProject.link && (
                  <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end shrink-0">
                    <a
                      href={selectedProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-secondary-600 hover:bg-brand-secondary-700 dark:bg-brand-secondary-600 dark:hover:bg-brand-secondary-700 text-white text-sm font-semibold rounded shadow-md shadow-brand-secondary-600/10 hover:shadow-lg hover:shadow-brand-secondary-600/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group/btn"
                    >
                      <span>Launch Live Project</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </a>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Portfolio;
