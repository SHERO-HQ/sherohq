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
import AppImage from "@/components/common/AppImage";

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

 {/* Projects Grid */}
 <div className="cursor-pointer grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 md:gap-6 sm:gap-4 gap-2">
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-brand-secondary-500 dark:hover:border-brand-secondary-500 hover:shadow hover:shadow-brand-secondary-500/10 transition duration-300 flex flex-col h-full"
            onClick={() => setSelectedProject(project)}
          >
            {/* Project Image */}
            <div className="relative h-28 sm:h-40 md:h-48 bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {project.image &&
              (project.image.startsWith("http") ||
                project.image.startsWith("/") ||
                project.image.includes(".")) ? (
                <AppImage
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="text-4xl sm:text-7xl group-hover:scale-110 transition-transform duration-300">
                  {project.image}
                </div>
              )}

              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-brand-secondary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-white font-semibold text-xs sm:text-sm">
                  <span className="flex items-center gap-1.5">
                    View Details
                    <Info className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-1">
              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-brand-secondary-100 dark:bg-brand-secondary-900/30 text-brand-secondary-700 dark:text-brand-secondary-400 text-[10px] sm:text-xs font-semibold rounded truncate max-w-full">
                  {getCategoryIcon(project.category)}
                  <span className="truncate">{project.category}</span>
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors line-clamp-2 flex-1">
                {project.title}
              </h3>

              {/* View Details Button and Project Link */}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/50 gap-2">
                <button
                  aria-label={`View details for ${project.title}`}
                  title="View details"
                  className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 hover:text-brand-secondary-700 dark:hover:text-brand-secondary-300 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject(project);
                  }}
                >
                  <span>Details</span>
                  <Info className="size-3.5 sm:size-4 shrink-0" />
                </button>
                <a
                  href={project.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={project.link ? `Visit website for ${project.title}` : "Project link coming soon"}
                  title={project.link ? "Visit website" : "Link coming soon"}
                  className="inline-flex items-center gap-1 text-[9px] sm:text-xs font-medium text-slate-400 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>{project.link ? "Link" : "Soon"}</span>
                  <ExternalLink className="size-3 sm:size-3.5 shrink-0" />
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
 {selectedProject.image && (
 <div className="relative aspect-auto overflow-hidden bg-slate-100! dark:bg-slate-800">
 {selectedProject.image.startsWith("http") ||
 selectedProject.image.startsWith("/") ||
 selectedProject.image.includes(".") ? (
 <AppImage
 src={selectedProject.image}
 alt={selectedProject.title}
 width={800}
 height={500}
 sizes="(max-width: 768px) 100vw, 800px"
 className="w-full h-auto object-cover"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-8xl">
 {selectedProject.image}
 </div>
 )}
 </div>
 )}

 {(selectedProject.client || selectedProject.category) && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {selectedProject.client && (
 <div className="space-y-1">
 <h4 className="text-xs font-bold text-brand-secondary-600 dark:text-brand-secondary-400 uppercase tracking-widest">
 Client / Partner
 </h4>
 <p className="text-base font-medium text-slate-900 dark:text-white">
 {selectedProject.client}
 </p>
 </div>
 )}
 {selectedProject.category && (
 <div className="space-y-1">
 <h4 className="text-xs font-bold text-brand-secondary-600 dark:text-brand-secondary-400 uppercase tracking-widest">
 Industry / Category
 </h4>
 <div className="flex items-center gap-2 text-base font-medium text-slate-900 dark:text-white">
 {getCategoryIcon(selectedProject.category)}
 {selectedProject.category}
 </div>
 </div>
 )}
 </div>
 )}

 {selectedProject.description && (
 <div className="space-y-3">
 <h4 className="text-xs font-bold text-brand-secondary-600 dark:text-brand-secondary-400 uppercase tracking-widest">
 Project Overview
 </h4>
 <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
 {selectedProject.description}
 </p>
 </div>
 )}

 {selectedProject.useCase && (
 <div className="space-y-3">
 <h4 className="text-xs font-bold text-brand-secondary-600 dark:text-brand-secondary-400 uppercase tracking-widest">
 Strategic Use Case
 </h4>
 <div className="p-5 bg-brand-secondary-50 dark:bg-brand-secondary-900/20 rounded border border-brand-secondary-100 dark:border-brand-secondary-500/20">
 <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
 &quot;{selectedProject.useCase}&quot;
 </p>
 </div>
 </div>
 )}

 {selectedProject.technologies?.length > 0 && (
 <div className="space-y-3">
 <h4 className="text-xs font-bold text-brand-secondary-600 dark:text-brand-secondary-400 uppercase tracking-widest">
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
 )}

 {selectedProject.link && (
 <div className="space-y-3">
 <h4 className="text-xs font-bold text-brand-secondary-600 dark:text-brand-secondary-400 uppercase tracking-widest">
 Project Link
 </h4>
 <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
 <Link className="size-4 text-brand-secondary-600 dark:text-brand-secondary-400 shrink-0" />
 <code className="text-xs text-slate-600 dark:text-slate-400 truncate flex-1 block">
 {selectedProject.link}
 </code>
 <button
 onClick={() => copyToClipboard(selectedProject.link!)}
 className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400"
 title="Copy to clipboard"
 >
 {copied ? (
 <Check className="size-4 text-brand-secondary-600" />
 ) : (
 <Copy className="size-4" />
 )}
 </button>
 </div>
 </div>
 )}

 {selectedProject.link && (
 <div className="pt-4 sticky bottom-0 pb-2">
 <a
 href={selectedProject.link}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white font-medium rounded transition duration-300 hover:shadow hover:shadow-brand-secondary-500/25 w-full active:scale-[0.98]"
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
