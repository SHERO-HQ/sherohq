"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Tag, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SpecRow {
  id: string;
  key: string;
  value: string;
}

interface ProductSpecsCardProps {
  specsList: SpecRow[];
  onAddSpecRow: () => void;
  onRemoveSpecRow: (id: string) => void;
  onUpdateSpecRow: (
    id: string,
    field: "key" | "value",
    newValue: string
  ) => void;
}

export default function ProductSpecsCard({
  specsList,
  onAddSpecRow,
  onRemoveSpecRow,
  onUpdateSpecRow,
}: ProductSpecsCardProps) {
  return (
    <Card className="bg-card border-border p-6 md:p-8 space-y-6 pt-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-brand-secondary-400" />
          <h3 className="text-lg font-bold text-foreground">Specifications</h3>
        </div>
        <Button
          type="button"
          onClick={onAddSpecRow}
          variant="outline"
          size="sm"
          className="border-border text-foreground hover:bg-accent hover:text-brand-secondary-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Spec
        </Button>
      </div>

      <div className="space-y-3">
        {specsList.map((spec) => (
          <div
            key={spec.id}
            className="flex gap-3 items-start p-3 rounded bg-muted/30 border border-border animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <div className="flex-1 space-y-1">
              <Input
                placeholder="Key (e.g. RAM)"
                value={spec.key}
                onChange={(e) =>
                  onUpdateSpecRow(spec.id, "key", e.target.value)
                }
                className="bg-muted/50 border-border text-foreground h-9 text-sm"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Input
                placeholder="Value (e.g. 16GB)"
                value={spec.value}
                onChange={(e) =>
                  onUpdateSpecRow(spec.id, "value", e.target.value)
                }
                className="bg-muted/50 border-border text-foreground h-9 text-sm"
              />
            </div>
            <Button
              type="button"
              onClick={() => onRemoveSpecRow(spec.id)}
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-rose-400 hover:bg-rose-950/20 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {specsList.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-border rounded">
            <p className="text-muted-foreground text-sm italic mb-2">
              No technical specifications added.
            </p>
            <Button
              type="button"
              onClick={onAddSpecRow}
              variant="link"
              className="text-brand-secondary-400"
            >
              Add your first specification
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
