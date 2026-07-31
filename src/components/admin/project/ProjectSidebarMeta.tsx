"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Link as LinkIcon, Globe, Plus, X, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Project } from "@/services/api";

interface ProjectSidebarMetaProps {
  projectData: Partial<Project>;
  onUpdateProjectData: (updates: Partial<Project>) => void;
  errors?: Record<string, string>;
  newTech: string;
  onNewTechChange: (value: string) => void;
  onAddTech: () => void;
  onRemoveTech: (index: number) => void;
}

export default function ProjectSidebarMeta({
  projectData,
  onUpdateProjectData,
  errors = {},
  newTech,
  onNewTechChange,
  onAddTech,
  onRemoveTech,
}: ProjectSidebarMetaProps) {
  const categories = [
    "Web Development",
    "Mobile Apps",
    "Infrastructure",
    "Custom Software",
  ];

  const handleInputChange = (field: keyof Project, value: string) => {
    onUpdateProjectData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Category & Details */}
      <Card className={cn(
        "bg-card border border-border p-6 space-y-6 transition-all duration-300",
        errors.category && "border-rose-500/30"
      )}>
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Tag className="w-4 h-4 text-brand-secondary-400" />
          <h3 className="font-bold text-foreground text-sm">Classification</h3>
        </div>

        <div className="space-y-4">
          {/* Category Selector */}
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Category *
            </label>
            <select
              id="category"
              value={projectData.category || ""}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className={cn(
                "w-full bg-muted border-border text-foreground rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-secondary-500/50",
                errors.category && "border-rose-500 bg-rose-500/5 focus:ring-rose-500"
              )}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-[11px] text-rose-400 mt-1">
                {errors.category}
              </p>
            )}
          </div>

          {/* Client Name */}
          <div className="space-y-2">
            <label
              htmlFor="client"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Client Name
            </label>
            <Input
              id="client"
              placeholder="e.g. Acme Innovations"
              value={projectData.client || ""}
              onChange={(e) => handleInputChange("client", e.target.value)}
              className="bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500"
            />
          </div>

          {/* Project Link */}
          <div className="space-y-2">
            <label
              htmlFor="link"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
            >
              Project Link <LinkIcon className="w-3.5 h-3.5" />
            </label>
            <Input
              id="link"
              placeholder="https://example.com"
              value={projectData.link || ""}
              onChange={(e) => handleInputChange("link", e.target.value)}
              className="bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500"
            />
          </div>
        </div>
      </Card>

      {/* Technologies */}
      <Card className="bg-card border border-border p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Globe className="w-4 h-4 text-brand-secondary-400" />
          <h3 className="font-bold text-foreground text-sm">Stack / Technologies</h3>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add tech (e.g. React)..."
              value={newTech}
              onChange={(e) => onNewTechChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddTech();
                }
              }}
              className="bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500 text-sm h-9"
            />
            <Button
              type="button"
              onClick={onAddTech}
              className="bg-muted hover:bg-slate-700 text-foreground border border-border h-9 w-9 p-0 flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {projectData.technologies && projectData.technologies.length > 0 ? (
              projectData.technologies.map((tech, index) => (
                <Badge
                  key={`${tech}-${index}`}
                  className="bg-muted hover:bg-slate-700 text-slate-200 border-border py-1 px-2.5 text-xs flex items-center gap-1.5"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => onRemoveTech(index)}
                    className="text-muted-foreground hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-xs text-slate-600 italic">No technologies added yet.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
