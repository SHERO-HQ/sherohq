"use client";

import React from "react";
import { m, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Briefcase,
  Code2,
  BarChart,
  User,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SchedulerSuccess } from "./scheduler/SchedulerSuccess";
import {
  SchedulerStep1Service,
  type ServiceType,
} from "./scheduler/SchedulerStep1Service";
import { SchedulerStep2DateTime } from "./scheduler/SchedulerStep2DateTime";
import { SchedulerStep3Info } from "./scheduler/SchedulerStep3Info";
import { useSchedulerState } from "./scheduler/useSchedulerState";

const services: ServiceType[] = [
  {
    id: "it-support",
    title: "Managed IT Support",
    description:
      "Proactive monitoring, helpdesk, and ongoing system maintenance.",
    icon: <MessageSquare className="w-6 h-6" />,
  },
  {
    id: "infrastructure",
    title: "Infrastructure & Systems",
    description:
      "Server setups, secure network design, and infrastructure audits.",
    icon: <BarChart className="w-6 h-6" />,
  },
  {
    id: "hardware",
    title: "Hardware & POS Setups",
    description:
      "Strategic planning and configuration of physical hardware systems.",
    icon: <Briefcase className="w-6 h-6" />,
  },
  {
    id: "software",
    title: "Software Engineering",
    description: "Custom web, mobile, and SaaS application development.",
    icon: <Code2 className="w-6 h-6" />,
  },
  {
    id: "other",
    title: "Other",
    description: "Something else? Let's discuss your unique requirements.",
    icon: <HelpCircle className="w-6 h-6" />,
  },
];

const Scheduler = () => {
  const {
    router,
    step,
    direction,
    scrollRef,
    formData,
    setFormData,
    status,
    nextStep,
    prevStep,
    handleSubmit,
    isStep1Valid,
    isStep2Valid,
  } = useSchedulerState();

  if (status === "success") {
    const serviceTitle =
      services.find((s) => s.id === formData.service)?.title || "Consultation";

    return (
      <SchedulerSuccess
        serviceTitle={serviceTitle}
        formData={formData}
        onReset={() => router.refresh()}
      />
    );
  }

  return (
    <div
      ref={scrollRef}
      className="max-w-310 mx-auto bg-white dark:bg-slate-900 rounded shadow shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col justify-center md:flex-row min-h-125 md:min-h-150"
    >
      {/* Sidebar / Progress */}
      <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-950 px-3 py-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="mb-6 md:mb-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Consultation
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 hidden md:block mt-1">
            Schedule your meeting in 3 easy steps.
          </p>
        </div>

        {/* Horizontal Steps on Mobile / Vertical on Desktop */}
        <div className="flex md:flex-col justify-between md:justify-start gap-4 sm:gap-14 md:gap-0 md:space-y-8 relative mb-4 md:mb-0 isolate">
          {/* Vertical Line for Desktop */}
          <div className="hidden md:block absolute left-4 top-2 bottom-1 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10">
            <div
              className="w-full bg-brand-secondary-500 transition duration-500 ease-out"
              style={{ height: `${((step - 1) / 2) * 100}%` }}
            />
          </div>

          {/* Horizontal Line for Mobile */}
          <div className="md:hidden absolute top-4 sm:left-20 sm:right-20 left-12 right-12 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10">
            <div
              className="h-full bg-brand-secondary-500 transition duration-500 ease-out"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>

          {(
            [
              { id: 1, label: "Service", icon: Briefcase },
              { id: 2, label: "Time", icon: Clock },
              { id: 3, label: "Details", icon: User },
            ] as const
          ).map((s) => (
            <div
              key={s.id}
              className="relative flex md:items-center gap-3 md:gap-4 flex-1 md:flex-none flex-col md:flex-row items-center text-center md:text-left"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold relative z-10 transition duration-300 shrink-0 border-2",
                  step === s.id
                    ? "bg-brand-secondary-600 border-brand-secondary-600 text-white shadow shadow-brand-secondary-500/30 ring-4 ring-brand-secondary-50 dark:ring-brand-secondary-900/20"
                    : step > s.id
                      ? "bg-brand-secondary-100 dark:bg-brand-secondary-900 border-brand-secondary-500 text-brand-secondary-600 dark:text-brand-secondary-400"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500",
                )}
              >
                {step > s.id ? (
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <s.icon className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </div>
              <div>
                <p
                  className={cn(
                    "text-xs md:text-sm font-medium whitespace-nowrap",
                    step === s.id
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Summary (Desktop Only) */}
        {step > 1 && (
          <div className="hidden md:block mt-auto p-4 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Booking Summary
            </h4>
            {formData.service && (
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                <Briefcase className="w-4 h-4 text-brand-secondary-500" />
                {services.find((s) => s.id === formData.service)?.title}
              </div>
            )}
            {formData.date && (
              <div className="flex items-center font-semibold gap-2 mb-2 text-sm text-slate-600 dark:text-slate-300">
                <CalendarIcon className="w-4 h-4 text-brand-secondary-500" />
                {format(formData.date, "MMM do, yyyy")}
              </div>
            )}

            {formData.time && (
              <div className="flex items-center font-semibold gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-brand-secondary-500" />
                {formData.time} GMT
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="w-full flex-1 justify-center p-3 sm:p-6 md:p-10 relative bg-white dark:bg-slate-900 flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <m.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 10, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: direction * -10, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {step === 1 && (
              <SchedulerStep1Service
                services={services}
                selectedService={formData.service}
                onSelectService={(serviceId) =>
                  setFormData({ ...formData, service: serviceId })
                }
                nextStep={nextStep}
                isValid={isStep1Valid}
              />
            )}

            {step === 2 && (
              <SchedulerStep2DateTime
                date={formData.date}
                time={formData.time}
                onSelectDate={(date) => setFormData({ ...formData, date })}
                onSelectTime={(time) => setFormData({ ...formData, time })}
                nextStep={nextStep}
                prevStep={prevStep}
                isValid={isStep2Valid}
              />
            )}

            {step === 3 && (
              <SchedulerStep3Info
                services={services}
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                prevStep={prevStep}
                status={status}
              />
            )}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Scheduler;
