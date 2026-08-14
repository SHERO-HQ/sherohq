"use client";

import React from "react";
import { format } from "date-fns";
import {
  ChevronLeft,
  Briefcase,
  Calendar as CalendarIcon,
  User,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatLocalEquivalent } from "@/lib/consultation-time";
import type { ServiceType } from "./SchedulerStep1Service";

interface SchedulerStep3InfoProps {
  services: ServiceType[];
  formData: {
    service: string;
    date: Date | undefined;
    time: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    message: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      service: string;
      date: Date | undefined;
      time: string;
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      message: string;
    }>
  >;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  prevStep: () => void;
  status: "idle" | "submitting" | "success";
}

export function SchedulerStep3Info({
  services,
  formData,
  setFormData,
  handleSubmit,
  prevStep,
  status,
}: SchedulerStep3InfoProps) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        Your Information
      </h2>

      {/* Mobile Summary in Step 3 */}
      <div className="md:hidden mb-6 p-4 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="w-4 h-4 text-brand-secondary-500" />
          <span className="font-semibold">
            {services.find((s) => s.id === formData.service)?.title}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <CalendarIcon className="w-4 h-4 text-brand-secondary-500 shrink-0" />
          <div>
            <span>
              {formData.date && format(formData.date, "MMM do")} at {formData.time} GMT (Accra)
            </span>
            {formatLocalEquivalent(formData.time, formData.date) && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                ({formatLocalEquivalent(formData.time, formData.date)} local)
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4" /> First Name
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  firstName: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-secondary-500 transition"
              placeholder="John"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4" /> Last Name
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="w-full px-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-secondary-500 transition"
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-secondary-500 transition"
              placeholder="john@company.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone Number
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-secondary-500 transition"
              placeholder="+233 123 456 7890"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Note (Optional)
          </label>
          <textarea
            rows={3}
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full px-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-secondary-500 transition resize-none"
            placeholder="Anything specific to discuss?"
          />
        </div>

        <div className="mt-auto pt-6 flex justify-between items-center gap-4">
          <Button
            type="button"
            onClick={prevStep}
            variant="ghost"
            size="lg"
            className="rounded px-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button
            type="submit"
            disabled={status === "submitting"}
            size="lg"
            className="flex-1 md:flex-none rounded px-8 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white shadow shadow-brand-secondary-500/30"
          >
            {status === "submitting" ? "Confirming..." : "Confirm Booking"}
          </Button>
        </div>
      </form>
    </div>
  );
}
