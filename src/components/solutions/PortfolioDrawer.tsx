"use client";

import React, { useState } from "react";
import { m, AnimatePresence } from "motion/react";
import {
  Layers,
  Info,
  Link,
  Copy,
  Check,
  ArrowRight,
  X,
} from "lucide-react";
import type { Project } from "@/services/api";
import AppImage from "@/components/common/AppImage";
import { getTechColor, getCategoryIcon } from "./portfolioUtils";

interface PortfolioDrawerProps {
  selectedProject: Project | null;
  onClose: () => void;
}

export function PortfolioDrawer({
  selectedProject,
  onClose,
}: PortfolioDrawerProps) {
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

  return (
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
            onClick={onClose}
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
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
              {/* Sticky Top Header Bar (Category, Title, Client & Close Button) */}
              <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border p-4 md:p-6 space-y-3 shrink-0 shadow-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-secondary-100 dark:bg-brand-secondary-900/40 text-brand-secondary-700 dark:text-brand-secondary-400 text-xs font-bold uppercase rounded-full border border-brand-secondary-500/20">
                    {getCategoryIcon(selectedProject.category)}
                    {selectedProject.category}
                  </span>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-muted text-foreground transition-colors cursor-pointer active:scale-95"
                    aria-label="Close Case Study"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Title & Client Sticky Header */}
                <div className="space-y-1.5">
                  <h3 className="text-xl md:text-2xl font-extrabold text-foreground leading-snug font-sora">
                    {selectedProject.title}
                  </h3>
                  {selectedProject.client && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-brand-secondary-600 dark:text-brand-secondary-400 uppercase tracking-widest bg-brand-secondary-50 dark:bg-brand-secondary-900/30 px-2 py-0.5 rounded border border-brand-secondary-500/20">
                        Client
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {selectedProject.client}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Full Bleed Hero Image */}
              <div className="relative aspect-video w-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
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
                className="p-6 md:p-8 space-y-10 pb-10 flex-1"
              >
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
                      <span className="w-4 h-px bg-border block" /> Project
                      Overview
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
                      <span className="w-4 h-px bg-border block" /> Strategic
                      Solution
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
                      <span className="w-4 h-px bg-border block" /> Technology
                      Stack
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

            {/* Docked Action Bar (Always visible) */}
            <div className="p-4 sm:p-6 bg-background/95 backdrop-blur-md border-t border-border shrink-0 z-20">
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  damping: 20,
                }}
                className="flex flex-col sm:flex-row items-center gap-3 w-full"
              >
                {selectedProject.link ? (
                  <>
                    <div className="flex items-center gap-3 w-full sm:w-auto flex-1 bg-background/60 p-3 rounded border border-border">
                      <Link className="size-4 text-brand-secondary-600 dark:text-brand-secondary-400 shrink-0" />
                      <code className="text-xs text-muted-foreground truncate flex-1 font-mono select-all">
                        {selectedProject.link}
                      </code>
                      <button
                        onClick={() => copyToClipboard(selectedProject.link!)}
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
                  </>
                ) : (
                  <a
                    href="/contact-us?inquiry=solution"
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white text-sm font-bold rounded shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group/btn"
                  >
                    <span>Inquire About This Solution</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </a>
                )}
              </m.div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
