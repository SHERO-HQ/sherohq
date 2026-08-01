"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { List, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFormContext } from "react-hook-form";
import type { ProductFormValues } from "@/lib/validations/product";

export default function ProductFeaturesCard() {
  const { watch, setValue } = useFormContext<ProductFormValues>();
  const features = watch("features") || [];

  const [newFeature, setNewFeature] = useState("");

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setValue("features", [...features, newFeature.trim()], { shouldDirty: true });
    setNewFeature("");
  };

  const handleRemoveFeature = (index: number) => {
    const updated = features.filter((_, i) => i !== index);
    setValue("features", updated, { shouldDirty: true });
  };

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
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddFeature();
              }
            }}
            className="bg-muted/50 border-border text-foreground"
          />
          <Button
            type="button"
            onClick={handleAddFeature}
            className="bg-muted text-foreground hover:bg-accent"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {features.map((feature, index) => (
            <Badge
              key={`${feature}-${index}`}
              className="bg-muted text-muted-foreground border-border py-1.5 px-3 group"
            >
              {feature}
              <button
                type="button"
                onClick={() => handleRemoveFeature(index)}
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
