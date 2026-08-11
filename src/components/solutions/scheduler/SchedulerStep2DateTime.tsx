"use client";

import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

const isTimeSlotPassed = (timeSlot: string, forDate: Date): boolean => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedDate = new Date(
    forDate.getFullYear(),
    forDate.getMonth(),
    forDate.getDate(),
  );

  if (selectedDate.getTime() !== today.getTime()) {
    return false;
  }

  const [time, period] = timeSlot.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let slotHour = hours;

  if (period === "PM" && hours !== 12) {
    slotHour = hours + 12;
  } else if (period === "AM" && hours === 12) {
    slotHour = 0;
  }

  const slotTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    slotHour,
    minutes,
  );

  return slotTime <= now;
};

interface SchedulerStep2DateTimeProps {
  date: Date | undefined;
  time: string;
  onSelectDate: (d: Date | undefined) => void;
  onSelectTime: (t: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  isValid: boolean;
}

export function SchedulerStep2DateTime({
  date,
  time,
  onSelectDate,
  onSelectTime,
  nextStep,
  prevStep,
  isValid,
}: SchedulerStep2DateTimeProps) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        Choose Date & Time
      </h2>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 mx-auto max-w-87.5 xl:max-w-none">
          <div className="border border-slate-200 dark:border-slate-800 rounded p-1 sm:p-3 bg-slate-50/50 dark:bg-slate-900/50">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                onSelectDate(d);
                onSelectTime("");
              }}
              disabled={(d) =>
                d.getDay() === 0 ||
                d < new Date(new Date().setHours(0, 0, 0, 0))
              }
              className="rounded mx-auto"
            />
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 xl:block">
            Available Times
          </label>
          {!date ? (
            <div className="h-32 xl:h-64 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded text-slate-400 text-sm bg-slate-50/50 dark:bg-slate-900/50">
              Select a date to see times
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
              {(date.getDay() === 6
                ? timeSlots.filter((t) => t !== "04:00 PM")
                : timeSlots
              ).map((t) => {
                const isPassed = isTimeSlotPassed(t, date);

                let slotClass =
                  "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-secondary-500 hover:text-brand-secondary-500";

                if (isPassed) {
                  slotClass =
                    "bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700 opacity-50 !cursor-not-allowed";
                } else if (time === t) {
                  slotClass =
                    "bg-brand-secondary-600 text-white border-brand-secondary-600 shadow shadow-brand-secondary-500/20 scale-105";
                }

                return (
                  <button
                    key={t}
                    onClick={() => onSelectTime(t)}
                    disabled={isPassed}
                    className={cn(
                      "px-3 py-2 rounded text-sm font-medium transition text-center border cursor-pointer",
                      slotClass,
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="cursor-pointer mt-8 md:mt-auto pt-8 flex justify-between items-center gap-4">
        <Button
          onClick={prevStep}
          variant="ghost"
          size="lg"
          className="rounded px-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          onClick={nextStep}
          disabled={!isValid}
          size="lg"
          className="flex-1 md:flex-none rounded dark:text-slate-100 px-8"
        >
          Continue <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
