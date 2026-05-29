"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { List, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ProductFeaturesCardProps {
  features: string[];
  newFeature: string;
  onNewFeatureChange: (value: string) => void;
  onAddFeature: () => void;
  onRemoveFeature: (index: number) => void;
}

export default function ProductFeaturesCard({
  features,
  newFeature,
  onNewFeatureChange,
  onAddFeature,
  onRemoveFeature,
}: ProductFeaturesCardProps) {
  return (
    <Card className="bg-slate-900 border-white/5 p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <List className="w-5 h-5 text-brand-secondary-400" />
        <h3 className="text-lg font-bold text-white">Features</h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a product feature..."
            value={newFeature}
            onChange={(e) => onNewFeatureChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddFeature();
              }
            }}
            className="bg-slate-800/50 border-white/5 text-white"
          />
          <Button
            type="button"
            onClick={onAddFeature}
            className="bg-slate-800 text-white hover:bg-slate-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {features.map((feature, index) => (
            <Badge
              key={feature}
              className="bg-slate-800 text-slate-200 border-white/5 py-1.5 px-3 group"
            >
              {feature}
              <button
                type="button"
                onClick={() => onRemoveFeature(index)}
                className="ml-2 text-slate-500 hover:text-rose-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {features.length === 0 && (
            <p className="text-xs text-slate-500 italic">
              No features added yet.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
