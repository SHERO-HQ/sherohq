"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DeleteSupportModalProps {
  isOpen: boolean;
  type: "consultation" | "inquiry" | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteSupportModal({
  isOpen,
  type,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteSupportModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isDeleting) onClose();
      }}
      title={`Delete ${type === "consultation" ? "Consultation" : "Inquiry"}`}
    >
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Are you sure you want to delete this{" "}
          {type === "consultation" ? "consultation" : "inquiry"}? This action
          cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            disabled={isDeleting}
            onClick={onClose}
            className="border-border text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface RescheduleConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  currentTime: string;
  setCurrentDate: (date: string) => void;
  setCurrentTime: (time: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isRescheduling: boolean;
}

export function RescheduleConsultationModal({
  isOpen,
  onClose,
  currentDate,
  currentTime,
  setCurrentDate,
  setCurrentTime,
  onSubmit,
  isRescheduling,
}: RescheduleConsultationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Consultation"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              New Date
            </label>
            <Input
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="bg-card/50 border-border text-foreground"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              New Time (GMT / Accra)
            </label>
            <select
              required
              value={currentTime}
              onChange={(e) => setCurrentTime(e.target.value)}
              className="flex h-10 w-full rounded border border-border bg-card/50 px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand-secondary-500"
            >
              <option value="" disabled>
                Select a time slot
              </option>
              {[
                "09:00 AM",
                "10:00 AM",
                "11:00 AM",
                "01:00 PM",
                "02:00 PM",
                "03:00 PM",
                "04:00 PM",
              ].map((slot) => (
                <option key={slot} value={slot} className="bg-card">
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-border text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isRescheduling}
            className="bg-brand-secondary-500 hover:bg-brand-secondary-600 text-white"
          >
            {isRescheduling ? "Rescheduling..." : "Reschedule"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
