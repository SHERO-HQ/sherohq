"use client";

import React from "react";
import { m } from "motion/react";
import {
  Layers,
  Info,
  ExternalLink,
} from "lucide-react";
import type { Project } from "@/services/api";
import AppImage from "@/components/common/AppImage";
import { getTechColor, getCategoryIcon } from "./portfolioUtils";

interface PortfolioCardProps {
  project: Project;
  idx: number;
  onSelect: (project: Project) => void;
}

export function PortfolioCard({ project, idx, onSelect }: PortfolioCardProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        opacity: { duration: 0.5, delay: idx * 0.08 },
        y: { duration: 0.5, delay: idx * 0.08 },
      }}
      onClick={() => onSelect(project)}
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
  );
}
