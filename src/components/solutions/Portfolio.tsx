"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjects } from "@/hooks/queries/useProjects";
import { m, AnimatePresence } from "motion/react";
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
  if (
    name.includes("postgres") ||
    name.includes("sql") ||
    name.includes("supabase")
  ) {
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

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
              <m.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  opacity: { duration: 0.5, delay: idx * 0.08 },
                  y: { duration: 0.5, delay: idx * 0.08 },
                }}
                onClick={() => setSelectedProject(project)}
                className="group rounded bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 overflow-hidden hover:-translate-y-1.5 hover:scale-[1.01] hover:border-brand-secondary-500/80 dark:hover:border-brand-secondary-500/80 hover:shadow-xl hover:shadow-brand-secondary-500/5 transition-all duration-300 flex flex-col h-full cursor-pointer"
              >
                {/* Project Image Box */}
                <div className="relative aspect-video bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden shrink-0 border-b border-slate-150 dark:border-slate-800/50">
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
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 overflow-hidden relative group-hover:scale-105 transition-transform duration-500 select-none">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[12px_12px]" />
                      <div className="relative z-10 p-3.5 rounded bg-white/95 dark:bg-slate-800/95 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                        <Layers className="w-8 h-8 text-brand-secondary-500/70" />
                      </div>
                    </div>
                  )}

                  {/* Hover details overlay */}
                  <div className="absolute inset-0 bg-brand-secondary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="px-3.5 py-2 bg-slate-950/95 text-white text-[10px] font-bold uppercase tracking-wider rounded border border-white/10 flex items-center gap-1.5 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md">
                      View Details <Info className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Project Info Block */}
                <div className="p-5 flex flex-col flex-1 gap-3">
                  {/* Category and Client Badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-secondary-100 dark:bg-brand-secondary-900/30 text-brand-secondary-700 dark:text-brand-secondary-400 text-[10px] font-bold uppercase rounded">
                      {getCategoryIcon(project.category)}
                      {project.category}
                    </span>
                    {project.client && (
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        for {project.client}
                      </span>
                    )}
                  </div>

                  {/* Title & Short Description */}
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors leading-snug font-sora">
                      {project.title}
                    </h3>
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
              </m.div>
            ))}
        </div>

        {mounted &&
          createPortal(
            <AnimatePresence>
              {selectedProject && (
                <div className="fixed inset-0 z-100 flex justify-end overflow-hidden">
                  {/* Backdrop */}
                  <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
                    onClick={() => setSelectedProject(null)}
                  />

                  {/* Drawer Panel */}
                  <m.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{
                      type: "spring",
                      damping: 30,
                      stiffness: 300,
                      mass: 0.8,
                    }}
                    className="relative w-full sm:w-125 md:w-150 bg-background border-l border-border shadow-2xl flex flex-col h-full overflow-hidden"
                  >
                    {/* Floating Header */}
                    <div className="absolute top-0 inset-x-0 p-4 md:p-6 flex items-start justify-between z-20 pointer-events-none">
                      <div className="pointer-events-auto">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background/90 backdrop-blur-md text-brand-secondary-700 dark:text-brand-secondary-400 text-xs font-bold uppercase rounded-full shadow-sm border border-border">
                          {getCategoryIcon(selectedProject.category)}
                          {selectedProject.category}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedProject(null)}
                        className="p-2.5 rounded-full bg-background/90 hover:bg-background backdrop-blur-md text-foreground shadow-sm border border-border transition-all duration-200 cursor-pointer active:scale-95 pointer-events-auto"
                        aria-label="Close Case Study"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                      {/* Full Bleed Hero Image */}
                      <div className="relative aspect-video w-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {/* Gradient Overlay for Top Header Readability */}
                        <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-black/40 to-transparent z-10 pointer-events-none" />

                        {selectedProject.image &&
                        (selectedProject.image.startsWith("http") ||
                          selectedProject.image.startsWith("/") ||
                          selectedProject.image.includes(".")) ? (
                          <AppImage
                            src={selectedProject.image}
                            alt={selectedProject.title}
                            fill
                            sizes="(max-width: 600px) 100vw, 600px"
                            className="object-cover"
                            priority
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted/50 overflow-hidden relative select-none">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
                            <div className="relative z-10 p-6 rounded bg-card shadow-sm border border-border">
                              <Layers className="w-16 h-16 text-brand-secondary-500/70" />
                            </div>
                          </div>
                        )}
                      </div>

                      <m.div
                        initial="hidden"
                        animate="show"
                        variants={{
                          hidden: {},
                          show: {
                            transition: {
                              staggerChildren: 0.1,
                              delayChildren: 0.2,
                            },
                          },
                        }}
                        className="p-6 md:p-8 space-y-10 pb-10"
                      >
                        {/* Title & Client */}
                        <m.div
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: {
                              opacity: 1,
                              y: 0,
                              transition: { type: "spring", damping: 20 },
                            },
                          }}
                          className="space-y-4"
                        >
                          <h3 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight font-sora">
                            {selectedProject.title}
                          </h3>
                          {selectedProject.client && (
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-brand-secondary-600 dark:text-brand-secondary-400 uppercase tracking-widest bg-brand-secondary-50 dark:bg-brand-secondary-900/30 px-2.5 py-1 rounded">
                                Client
                              </span>
                              <span className="text-base font-semibold text-foreground">
                                {selectedProject.client}
                              </span>
                            </div>
                          )}
                        </m.div>

                        {/* Overview */}
                        {selectedProject.description && (
                          <m.div
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              show: {
                                opacity: 1,
                                y: 0,
                                transition: { type: "spring", damping: 20 },
                              },
                            }}
                            className="space-y-3"
                          >
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                              <span className="w-4 h-px bg-border block" />{" "}
                              Project Overview
                            </h4>
                            <p className="text-base text-muted-foreground leading-relaxed">
                              {selectedProject.description}
                            </p>
                          </m.div>
                        )}

                        {/* Strategic Solution */}
                        {selectedProject.useCase && (
                          <m.div
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              show: {
                                opacity: 1,
                                y: 0,
                                transition: { type: "spring", damping: 20 },
                              },
                            }}
                            className="space-y-3"
                          >
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                              <span className="w-4 h-px bg-border block" />{" "}
                              Strategic Solution
                            </h4>
                            <div className="relative p-6 bg-card border border-border rounded overflow-hidden group shadow-sm">
                              <div className="absolute top-0 right-0 p-4 opacity-5 text-brand-secondary-600 dark:text-brand-secondary-400 select-none pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                                <Info className="w-20 h-20" />
                              </div>
                              <p className="text-base text-foreground italic leading-relaxed relative z-10 font-medium">
                                &quot;{selectedProject.useCase}&quot;
                              </p>
                            </div>
                          </m.div>
                        )}

                        {/* Tech Stack */}
                        {selectedProject.technologies?.length > 0 && (
                          <m.div
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              show: {
                                opacity: 1,
                                y: 0,
                                transition: { type: "spring", damping: 20 },
                              },
                            }}
                            className="space-y-4"
                          >
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                              <span className="w-4 h-px bg-border block" />{" "}
                              Technology Stack
                            </h4>
                            <div className="flex flex-wrap gap-2.5">
                              {selectedProject.technologies.map((tech) => (
                                <span
                                  key={tech}
                                  className={`px-3.5 py-1.5 text-sm font-semibold rounded-full border border-border bg-background/50 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default ${getTechColor(tech)}`}
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </m.div>
                        )}
                      </m.div>
                    </div>

                    {/* Docked Action Bar */}
                    {selectedProject.link && (
                      <div className="p-4 sm:p-6 bg-background/80 backdrop-blur-md border-t border-border shrink-0 z-20">
                        <m.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.4,
                            type: "spring",
                            damping: 20,
                          }}
                          className="flex flex-col sm:flex-row items-center gap-3 w-full"
                        >
                          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 bg-background/60 p-3 rounded border border-border">
                            <Link className="size-4 text-brand-secondary-600 dark:text-brand-secondary-400 shrink-0" />
                            <code className="text-xs text-muted-foreground truncate flex-1 font-mono select-all">
                              {selectedProject.link}
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(selectedProject.link!)
                              }
                              className="p-1.5 bg-background shadow-sm rounded transition-colors text-muted-foreground hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 cursor-pointer active:scale-90 border border-border shrink-0"
                              title="Copy link to clipboard"
                            >
                              {copied ? (
                                <Check className="size-4 text-emerald-600" />
                              ) : (
                                <Copy className="size-4" />
                              )}
                            </button>
                          </div>

                          <a
                            href={selectedProject.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white text-sm font-bold rounded shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group/btn shrink-0"
                          >
                            <span>Launch Project</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                          </a>
                        </m.div>
                      </div>
                    )}
                  </m.div>
                </div>
              )}
            </AnimatePresence>,
            document.body,
          )}
      </div>
    </section>
  );
};

export default Portfolio;
