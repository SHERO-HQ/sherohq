"use client";

import React from "react";
import { createPortal } from "react-dom";
import { format, parse } from "date-fns";
import { X, Calendar as CalendarIcon, Loader2, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const Label = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <label className={cn("text-sm font-medium", className)}>{children}</label>
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={cn(
      "flex min-h-20 w-full rounded border border-border bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary-500 disabled:cursor-not-allowed disabled:opacity-50",
      props.className,
    )}
  />
);

interface ExpenseFormModalProps {
  isFormOpen: boolean;
  mounted: boolean;
  editingId: string | null;
  formData: {
    title: string;
    amount: string;
    category: string;
    date: string;
    description: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      title: string;
      amount: string;
      category: string;
      date: string;
      description: string;
    }>
  >;
  errors: Record<string, string>;
  isSaving: boolean;
  categories: string[];
  handleCloseForm: () => void;
  handleSubmit: (e: React.BaseSyntheticEvent) => Promise<void>;
}

export function ExpenseFormModal({
  isFormOpen,
  mounted,
  editingId,
  formData,
  setFormData,
  errors,
  isSaving,
  categories,
  handleCloseForm,
  handleSubmit,
}: ExpenseFormModalProps) {
  if (!isFormOpen || !mounted) return null;

  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    return parse(dateStr, "yyyy-MM-dd", new Date());
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <Card
        className={cn(
          "w-full max-w-lg bg-card border shadow-2xl p-6 md:p-8 relative transition-all duration-300",
          Object.keys(errors).length > 0
            ? "border-rose-500/30"
            : "border-border",
        )}
      >
        <button
          onClick={handleCloseForm}
          className="absolute right-4 top-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-foreground mb-6">
          {editingId ? "Edit Expense" : "Add New Expense"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm font-medium">
              Title *
            </Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Office Rent - Feb"
              className={cn(
                "bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500",
                errors.title &&
                  "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500",
              )}
              required
            />
            {errors.title && (
              <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                {errors.title}
              </p>
            )}
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm font-medium">
                Amount (GHS) *
              </Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
                className={cn(
                  "bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500 font-mono",
                  errors.amount &&
                    "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500",
                )}
                required
              />
              {errors.amount && (
                <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                  {errors.amount}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm font-medium">
                Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full bg-muted/50 border-border text-muted-foreground justify-start font-normal h-10 overflow-hidden focus-visible:ring-brand-secondary-500",
                      !formData.date && "text-muted-foreground",
                      errors.date && "border-rose-500 bg-rose-500/5",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-brand-secondary-500 shrink-0" />
                    <span className="truncate">
                      {formData.date
                        ? format(parseDate(formData.date), "PPP")
                        : "Pick a date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parseDate(formData.date)}
                    onSelect={(date) =>
                      setFormData({
                        ...formData,
                        date: date ? format(date, "yyyy-MM-dd") : "",
                      })
                    }
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                  {errors.date}
                </p>
              )}
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm font-medium">
              Category *
            </Label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full bg-muted/50 border border-border rounded text-sm text-foreground h-10 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500 transition-all duration-200 cursor-pointer"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-card text-foreground">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm font-medium">
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Additional expense notes..."
              className="bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 text-muted-foreground hover:text-foreground"
              onClick={handleCloseForm}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground font-bold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2 text-foreground" />
                  {editingId ? "Update" : "Save"} Record
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>,
    document.body,
  );
}
