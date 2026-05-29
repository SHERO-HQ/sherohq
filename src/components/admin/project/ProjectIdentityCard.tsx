"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Project } from "@/services/api";

interface ProjectIdentityCardProps {
  projectData: Partial<Project>;
  onUpdateProjectData: (updates: Partial<Project>) => void;
  errors?: Record<string, string>;
}

export default function ProjectIdentityCard({
  projectData,
  onUpdateProjectData,
  errors = {},
}: ProjectIdentityCardProps) {
  const handleInputChange = (field: keyof Project, value: string) => {
    onUpdateProjectData({ [field]: value });
  };

  return (
    <Card className={cn(
      "bg-slate-900 border border-white/5 p-6 md:p-8 space-y-6 transition-all duration-300",
      (errors.title || errors.description) && "border-rose-500/30 bg-rose-500/2"
    )}>
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <Briefcase className="w-5 h-5 text-brand-secondary-400" />
        <h3 className="text-lg font-bold text-white">Project Details</h3>
      </div>

      <div className="space-y-4">
        {/* Project Title */}
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm font-medium text-slate-400"
          >
            Project Title *
          </label>
          <Input
            id="title"
            placeholder="e.g. Enterprise E-commerce Platform"
            value={projectData.title || ""}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className={cn(
              "bg-slate-800/50 border-white/5 text-white focus-visible:ring-brand-secondary-500",
              errors.title && "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500"
            )}
            required
          />
          {errors.title && (
            <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
              {errors.title}
            </p>
          )}
        </div>

        {/* Challenge / Overview */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-slate-400"
          >
            Challenge / Overview *
          </label>
          <textarea
            id="description"
            placeholder="What problem were you solving?"
            value={projectData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className={cn(
              "w-full min-h-36 bg-slate-800/50 border border-white/5 rounded p-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50 resize-y leading-relaxed text-sm transition-all",
              errors.description && "border-rose-500 bg-rose-500/5 focus:ring-rose-500"
            )}
            required
          />
          {errors.description && (
            <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
              {errors.description}
            </p>
          )}
        </div>

        {/* Solution / Use Case */}
        <div className="space-y-2">
          <label
            htmlFor="useCase"
            className="text-sm font-medium text-slate-400"
          >
            Solution / Use Case
          </label>
          <textarea
            id="useCase"
            placeholder="How did you solve it?"
            value={projectData.useCase || ""}
            onChange={(e) => handleInputChange("useCase", e.target.value)}
            className="w-full min-h-36 bg-slate-800/50 border border-white/5 rounded p-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50 resize-y leading-relaxed text-sm transition-all"
          />
        </div>
      </div>
    </Card>
  );
}
