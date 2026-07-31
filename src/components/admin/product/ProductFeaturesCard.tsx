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
    <Card className="bg-card border-border p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <List className="w-5 h-5 text-brand-secondary-400" />
        <h3 className="text-lg font-bold text-foreground">Features</h3>
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
            className="bg-muted/50 border-border text-foreground"
          />
          <Button
            type="button"
            onClick={onAddFeature}
            className="bg-muted text-foreground hover:bg-slate-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {features.map((feature, index) => (
            <Badge
              key={feature}
              className="bg-muted text-slate-200 border-border py-1.5 px-3 group"
            >
              {feature}
              <button
                type="button"
                onClick={() => onRemoveFeature(index)}
                className="ml-2 text-muted-foreground hover:text-rose-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {features.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No features added yet.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
