"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjects } from "@/hooks/queries/useProjects";
import { motion } from "motion/react";
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
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { type Project } from "@/services/api";

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);

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
    <section className="relative w-full py-20 bg-slate-50 dark:bg-slate-950">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded uppercase">
            <Wrench className="size-4" />
            Our Work
          </span>
          <h2 className="text-3xl md:text-4xl font-sora font-bold text-slate-900 dark:text-white mb-4">
            Featured Projects
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore our portfolio of successful projects and see how we've
            helped businesses transform digitally
          </p>
        </motion.div>

        {/* Category Filters */}
        <div className="flex justify-center mb-12">
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
                  className="px-6 py-2 text-sm whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Projects Grid */}
        <div className="cursor-pointer grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            filteredProjects.length > 0 &&
            filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
                onClick={() => setSelectedProject(project)}
              >
                {/* Project Image */}
                <div className="relative h-48 bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden">
                  {project.image &&
                  (project.image.startsWith("http") ||
                    project.image.startsWith("/") ||
                    project.image.includes(".")) ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      width={600}
                      height={400}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-7xl group-hover:scale-110 transition-transform duration-300">
                      {project.image}
                    </div>
                  )}

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-emerald-600/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-white font-semibold">
                      <span className="flex items-center gap-2">
                        View Details
                        <Info className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded">
                      {getCategoryIcon(project.category)}
                      {project.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold font-sora text-slate-900 dark:text-white mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {project.title}
                  </h3>

                  {/* View Details Button and Project Link */}
                  <div className="flex items-center justify-between mt-auto">
                    <button
                      className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                      }}
                    >
                      View Details
                      <Info className="size-4" />
                    </button>
                    <a
                      href={project.link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {project.link ? "Project Link" : "Link coming soon"}
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject?.title || "Project Details"}
        >
          {selectedProject && (
            <div className="space-y-8">
              {/* Project Image in Modal */}
              <div className="relative aspect-auto overflow-hidden bg-slate-100! dark:bg-slate-800">
                {selectedProject.image &&
                (selectedProject.image.startsWith("http") ||
                  selectedProject.image.startsWith("/") ||
                  selectedProject.image.includes(".")) ? (
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    {selectedProject.image}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    Client / Partner
                  </h4>
                  <p className="text-lg font-medium text-slate-900 dark:text-white">
                    {selectedProject.client}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    Industry / Category
                  </h4>
                  <div className="flex items-center gap-2 text-lg font-medium text-slate-900 dark:text-white">
                    {getCategoryIcon(selectedProject.category)}
                    {selectedProject.category}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Project Overview
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                  {selectedProject.description}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Strategic Use Case
                </h4>
                <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 rounded border border-emerald-100 dark:border-emerald-500/20">
                  <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "{selectedProject.useCase}"
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Technology Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded border border-slate-200 dark:border-slate-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Project Link
                </h4>
                <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <Link className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <code className="text-xs text-slate-600 dark:text-slate-400 truncate flex-1 block">
                    {selectedProject.link ||
                      `https://sherotech.io/projects/${selectedProject.id}`}
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        selectedProject.link ||
                          `https://sherotech.io/projects/${selectedProject.id}`,
                      )
                    }
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="size-4 text-emerald-600" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {selectedProject.link && (
                <div className="pt-6 sticky bottom-0 bg-slate-900 pb-2">
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 w-full active:scale-[0.98]"
                  >
                    Launch Live Project
                    <ExternalLink className="size-5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </section>
  );
};

export default Portfolio;
