"use client";

import React, { useState } from "react";
import { format, addDays, isSameDay } from "date-fns";
import {
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const morningSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "11:30 AM"];
const afternoonSlots = ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
const eveningSlots = ["05:00 PM", "06:00 PM", "07:00 PM"];

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
  const [customTimeInput, setCustomTimeInput] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const isPastDate = (d: Date) => {
    const now = new Date();
    const todayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const targetMidnight = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
    ).getTime();
    return targetMidnight < todayMidnight;
  };

  const quickPresets = [
    {
      label: "Today",
      date: new Date(),
    },
    {
      label: "Tomorrow",
      date: addDays(new Date(), 1),
    },
    {
      label: "Next Mon",
      date: (() => {
        const d = new Date();
        const day = d.getDay();
        const diff = day === 0 ? 1 : 8 - day;
        d.setDate(d.getDate() + diff);
        return d;
      })(),
    },
  ];

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTimeInput.trim()) {
      onSelectTime(customTimeInput.trim());
      setIsCustomMode(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Choose Date & Time
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Select your preferred consultation window. Times are in GMT.
          </p>
        </div>

        {/* Quick Date Presets */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded">
          {quickPresets.map((preset) => {
            const isSelected = date ? isSameDay(date, preset.date) : false;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onSelectDate(preset.date)}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded transition cursor-pointer",
                  isSelected
                    ? "bg-brand-secondary-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Left Column: Calendar & Manual Date input */}
        <div className="flex-1 mx-auto max-w-87.5 xl:max-w-none flex flex-col gap-3">
          <div className="border border-slate-200 dark:border-slate-800 rounded p-1 sm:p-3 bg-slate-50/50 dark:bg-slate-900/50">
            <Calendar
              mode="single"
              selected={date}
              required
              onSelect={(d) => {
                if (d) {
                  onSelectDate(d);
                }
              }}
              disabled={isPastDate}
              className="rounded mx-auto"
            />
          </div>

          {/* Quick Date Selector Input Fallback */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <label
              htmlFor="native-date"
              className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-brand-secondary-500" />
              Or type exact date:
            </label>
            <input
              id="native-date"
              type="date"
              min={format(new Date(), "yyyy-MM-dd")}
              value={date ? format(date, "yyyy-MM-dd") : ""}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m, d] = e.target.value.split("-").map(Number);
                  onSelectDate(new Date(y, m - 1, d));
                }
              }}
              className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-brand-secondary-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: Time Slots & Custom Time */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
              Available Times
            </label>
            <span className="text-xs text-brand-secondary-600 dark:text-brand-secondary-400 font-medium">
              {date ? format(date, "EEEE, MMMM d") : "Select a date"}
            </span>
          </div>

          {!date ? (
            <div className="h-48 xl:h-64 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded text-slate-400 text-sm bg-slate-50/50 dark:bg-slate-900/50 p-6 text-center">
              <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-medium text-slate-600 dark:text-slate-300">
                Choose a date on the calendar
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Times will populate based on your selected date.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 flex-1 flex flex-col">
              {/* Morning Slots */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Morning
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {morningSlots.map((slot) => {
                    const isSelected = time === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          onSelectTime(slot);
                          setIsCustomMode(false);
                        }}
                        className={cn(
                          "px-2.5 py-2 rounded text-xs font-semibold transition text-center border cursor-pointer flex items-center justify-center",
                          isSelected
                            ? "bg-brand-secondary-600 text-white border-brand-secondary-600 shadow shadow-brand-secondary-500/20 scale-[1.02]"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-secondary-500 hover:text-brand-secondary-500",
                        )}
                      >
                        {isSelected}
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Afternoon Slots */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                  <Sunset className="w-3.5 h-3.5 text-orange-500" /> Afternoon
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {afternoonSlots.map((slot) => {
                    const isSelected = time === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          onSelectTime(slot);
                          setIsCustomMode(false);
                        }}
                        className={cn(
                          "px-2.5 py-2 rounded text-xs font-semibold transition text-center border cursor-pointer flex items-center justify-center gap-1",
                          isSelected
                            ? "bg-brand-secondary-600 text-white border-brand-secondary-600 shadow shadow-brand-secondary-500/20 scale-[1.02]"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-secondary-500 hover:text-brand-secondary-500",
                        )}
                      >
                        {isSelected}
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Evening / Extended Slots */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" /> Evening / After
                  Hours
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {eveningSlots.map((slot) => {
                    const isSelected = time === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          onSelectTime(slot);
                          setIsCustomMode(false);
                        }}
                        className={cn(
                          "px-2.5 py-2 rounded text-xs font-semibold transition text-center border cursor-pointer flex items-center justify-center gap-1",
                          isSelected
                            ? "bg-brand-secondary-600 text-white border-brand-secondary-600 shadow shadow-brand-secondary-500/20 scale-[1.02]"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-secondary-500 hover:text-brand-secondary-500",
                        )}
                      >
                        {isSelected}
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom / Specific Time Option */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                {!isCustomMode ? (
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(true)}
                    className="text-xs font-medium text-brand-secondary-600 dark:text-brand-secondary-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Need a different time or custom window?
                  </button>
                ) : (
                  <form
                    onSubmit={handleCustomTimeSubmit}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="e.g. 02:30 PM or Anytime Morning"
                      value={customTimeInput}
                      onChange={(e) => setCustomTimeInput(e.target.value)}
                      autoFocus
                      className="flex-1 px-3 py-1.5 text-xs rounded border border-brand-secondary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="h-7 text-xs px-3 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white rounded"
                    >
                      Set Time
                    </Button>
                    <button
                      type="button"
                      onClick={() => setIsCustomMode(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>

              {/* Active Selection Feedback Banner */}
              {time && (
                <div className="mt-auto p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Selected:{" "}
                    <strong>
                      {format(date, "EEE, MMM d")} at {time} GMT
                    </strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="cursor-pointer mt-8 md:mt-auto pt-6 flex justify-between items-center gap-4 border-t border-slate-100 dark:border-slate-800">
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
          className={cn(
            "flex-1 md:flex-none rounded px-8 transition-all",
            isValid
              ? "bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white shadow shadow-brand-secondary-500/20"
              : "opacity-50 !cursor-not-allowed",
          )}
        >
          Continue <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
