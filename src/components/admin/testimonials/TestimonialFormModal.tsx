"use client";

import React from "react";
import { Star, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Testimonial } from "@/services/api";

interface TestimonialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTestimonial: Testimonial | null;
  formData: {
    quote: string;
    author: string;
    role: string;
    company: string;
    image: string;
    order: number;
    active: boolean;
    rating: number;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      quote: string;
      author: string;
      role: string;
      company: string;
      image: string;
      order: number;
      active: boolean;
      rating: number;
    }>
  >;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isPending: boolean;
}

export function TestimonialFormModal({
  isOpen,
  onClose,
  editingTestimonial,
  formData,
  setFormData,
  handleSubmit,
  isPending,
}: TestimonialFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
      >
        <div className="space-y-2">
          <Label htmlFor="author">Author Name</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) =>
              setFormData({ ...formData, author: e.target.value })
            }
            required
            className="bg-muted border-border"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              placeholder="e.g. CEO"
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              placeholder="e.g. Acme Inc"
              className="bg-muted border-border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quote">Quote</Label>
          <Textarea
            id="quote"
            value={formData.quote}
            onChange={(e) =>
              setFormData({ ...formData, quote: e.target.value })
            }
            required
            className="bg-muted border-border min-h-30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              placeholder="https://..."
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: Number(e.target.value) })
              }
              className="bg-muted border-border"
            />
          </div>
        </div>

        <div className="space-y-3 py-2 border-t border-border">
          <Label>Rating</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setFormData({ ...formData, rating: val })}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    val <= formData.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-600"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 py-2">
          <input
            id="active"
            type="checkbox"
            checked={formData.active}
            onChange={(e) =>
              setFormData({ ...formData, active: e.target.checked })
            }
            className="w-4 h-4 rounded border-border bg-muted"
          />
          <Label htmlFor="active" className="cursor-pointer">
            Active
          </Label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
