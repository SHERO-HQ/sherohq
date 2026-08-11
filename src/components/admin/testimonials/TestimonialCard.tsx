"use client";

import React from "react";
import { GripVertical, Eye, EyeOff, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppImage from "@/components/common/AppImage";
import type { Testimonial } from "@/services/api";

interface TestimonialCardProps {
  t: Testimonial;
  onConfirmPublish: (t: Testimonial) => void;
  onConfirmDelete: (id: string) => void;
}

export function TestimonialCard({
  t,
  onConfirmPublish,
  onConfirmDelete,
}: TestimonialCardProps) {
  return (
    <div className="bg-muted/30 border border-border rounded p-4 flex items-center gap-4 group hover:border-brand-secondary-500/30 transition relative overflow-hidden">
      <div className="text-slate-600 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="relative w-12 h-12 rounded bg-accent overflow-hidden shrink-0 flex items-center justify-center">
        {t.image ? (
          <AppImage
            src={t.image}
            alt={t.author}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold bg-brand-secondary-500/10">
            {t.author.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground truncate">{t.author}</h3>
          {!t.active && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase font-bold">
              Unpublished
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate italic">
          "{t.quote}"
        </p>
        {typeof t.rating === "number" && (
          <div className="flex gap-0.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < t.rating!
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-600"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 relative z-5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onConfirmPublish(t)}
          title={t.active ? "Unpublish from site" : "Publish to site"}
          className={
            t.active
              ? "text-brand-secondary-500 hover:text-brand-secondary-400"
              : "text-muted-foreground hover:text-foreground"
          }
        >
          {t.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onConfirmDelete(t.id)}
          className="text-muted-foreground hover:text-rose-400"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
