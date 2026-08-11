"use client";

import React from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ServiceType = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

interface SchedulerStep1ServiceProps {
  services: ServiceType[];
  selectedService: string;
  onSelectService: (serviceId: string) => void;
  nextStep: () => void;
  isValid: boolean;
}

export function SchedulerStep1Service({
  services,
  selectedService,
  onSelectService,
  nextStep,
  isValid,
}: SchedulerStep1ServiceProps) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        Select a Service
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelectService(service.id)}
            className={cn(
              "flex items-start md:items-center p-4 rounded border-2 transition duration-200 text-left hover:border-brand-secondary-500/50 hover:bg-brand-secondary-50 dark:hover:bg-brand-secondary-900/10 group relative overflow-hidden cursor-pointer",
              selectedService === service.id
                ? "border-brand-secondary-500 bg-brand-secondary-50/50 dark:bg-brand-secondary-900/10 shadow-sm"
                : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded flex items-center justify-center mr-4 transition-colors shrink-0",
                selectedService === service.id
                  ? "bg-brand-secondary-100 dark:bg-brand-secondary-900/30 text-brand-secondary-600 dark:text-brand-secondary-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-brand-secondary-500",
              )}
            >
              {service.icon}
            </div>
            <div className="cursor-pointer flex-1">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base">
                {service.title}
              </h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {service.description}
              </p>
            </div>
            <div
              className={cn(
                "ml-3 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-1 md:mt-0",
                selectedService === service.id
                  ? "border-brand-secondary-500 bg-brand-secondary-500 text-white"
                  : "border-slate-200 dark:border-slate-700",
              )}
            >
              {selectedService === service.id && (
                <CheckCircle2 className="w-3 h-3" />
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-8 md:mt-auto pt-4 flex justify-end">
        <Button
          onClick={nextStep}
          disabled={!isValid}
          size="lg"
          className="w-full md:w-auto rounded px-8 dark:text-slate-200"
        >
          Continue <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
