"use client";
import React, { useState, useRef } from "react";
import { useVisibleInterval } from "@/hooks/useVisibleInterval";

export const TerminalWidget: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useVisibleInterval(
    () => setActiveStep((prev) => (prev + 1) % 4),
    2000,
    ref,
  );

  const steps = [
    {
      label: "DEVICE PROVISIONING",
      detail: "Shero Workstation Pro v4",
      status: "Active"
    },
    {
      label: "CPU CORE TEST",
      detail: "16-Core Xeon Processor",
      status: "[Passed]"
    },
    {
      label: "ECC MEMORY CONFIG",
      detail: "64GB DDR5 Secure Storage",
      status: "[Passed]"
    },
    {
      label: "OS SECURE DEPLOYMENT",
      detail: "Fully Provisioned & Encrypted",
      status: "Ready"
    },
  ];

  return (
    <div ref={ref} className="w-full h-36 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 font-mono text-[9px] relative overflow-hidden select-none z-10">
      <div className="absolute inset-x-0 h-[2px] bg-brand-secondary-500/20 top-0 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-[bounce_3s_infinite_ease-in-out]" />

      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800 mb-2">
        <span className="text-brand-secondary-500 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary-500 animate-ping" />
          SHERO-Hardware
        </span>
        <span className="text-slate-700 dark:text-slate-300">SYS_OK</span>
      </div>

      <div className="space-y-1.5">
        {steps.map((step, idx) => {
          const isActive = idx === activeStep;
          const isDone = idx < activeStep;
          return (
            <div
              key={step.label}
              className={`flex items-center justify-between transition-all duration-300 ${isActive
                  ? "text-brand-secondary-400 font-bold translate-x-1"
                  : isDone
                    ? "text-slate-600 dark:text-slate-400"
                    : "text-slate-800 dark:text-slate-200"
                }`}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-1 h-1 rounded-full ${isActive ? "bg-brand-secondary-400" : isDone ? "bg-slate-600 dark:bg-slate-500" : "bg-slate-400 dark:bg-slate-700"}`}
                />
                {step.label}:
              </span>
              <span className="truncate max-w-[100px]">{step.detail}</span>
              <span className="text-[8px] tracking-wide shrink-0">
                {step.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
