"use client";

import React, { useState, useEffect } from "react";
import { format, addDays, isSameDay } from "date-fns";
import {
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  getAccraToday,
  isAccraPastDate,
  isAccraTimeSlotPassed,
  getUserTimezoneInfo,
  formatLocalEquivalent,
  BUSINESS_TIMEZONE_LABEL,
} from "@/lib/consultation-time";

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
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [userTz, setUserTz] = useState(() => getUserTimezoneInfo());

  useEffect(() => {
    setUserTz(getUserTimezoneInfo());
  }, []);

  // Fetch already booked slots for the selected date
  useEffect(() => {
    if (!date) {
      setBookedTimes([]);
      return;
    }
    let isMounted = true;
    setIsLoadingAvailability(true);

    const dateStr = format(date, "yyyy-MM-dd");
    fetch(`/api/consultations/availability?date=${dateStr}`)
      .then((res) => res.json())
      .then((resData) => {
        const times = resData?.bookedTimes || resData?.data?.bookedTimes;
        if (isMounted && resData?.success && Array.isArray(times)) {
          setBookedTimes(times);
        } else if (isMounted) {
          setBookedTimes([]);
        }
      })
      .catch(() => {
        if (isMounted) setBookedTimes([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingAvailability(false);
      });

    return () => {
      isMounted = false;
    };
  }, [date]);

  const allStandardSlots = [
    ...morningSlots,
    ...afternoonSlots,
    ...eveningSlots,
  ];

  const accraToday = getAccraToday();
  const isTodaySelected = date ? isSameDay(date, accraToday) : false;
  const allSlotsPassedToday =
    isTodaySelected &&
    allStandardSlots.every((slot) => isAccraTimeSlotPassed(slot, date));

  const quickPresets = [
    {
      label: "Today",
      date: accraToday,
    },
    {
      label: "Tomorrow",
      date: addDays(accraToday, 1),
    },
    {
      label: "Next Mon",
      date: (() => {
        const d = new Date(accraToday);
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

  const renderSlotButton = (slot: string) => {
    const isPassed = isAccraTimeSlotPassed(slot, date);
    const isBooked = bookedTimes.includes(slot);
    const isDisabled = isPassed || isBooked;
    const isSelected = time === slot;
    const localEq = !userTz.isGmt ? formatLocalEquivalent(slot, date) : null;

    return (
      <div key={slot} className="relative group">
        <button
          type="button"
          disabled={isDisabled}
          title={localEq ? `${slot} GMT (${localEq})` : `${slot} GMT`}
          onClick={() => {
            if (!isDisabled) {
              onSelectTime(slot);
              setIsCustomMode(false);
            }
          }}
          className={cn(
            "w-full px-2 py-2.5 rounded text-xs font-semibold transition text-center border flex flex-col items-center justify-center gap-0.5 relative",
            isBooked && !isPassed
              ? "bg-rose-50/50 dark:bg-rose-950/20 text-slate-400 dark:text-slate-500 border-rose-200/80 dark:border-rose-900/40 !cursor-not-allowed line-through shadow-2xs"
              : isPassed
                ? "bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 opacity-40 !cursor-not-allowed line-through"
                : isSelected
                  ? "bg-brand-secondary-600 text-white border-brand-secondary-600 shadow shadow-brand-secondary-500/20 scale-[1.02] cursor-pointer ring-2 ring-brand-secondary-500/30"
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-brand-secondary-500 hover:text-brand-secondary-500 dark:hover:text-brand-secondary-400 hover:shadow-xs cursor-pointer",
          )}
        >
          <span className="font-bold">{slot}</span>
          {localEq && !isDisabled && (
            <span
              className={cn(
                "text-[10px] font-medium leading-tight",
                isSelected
                  ? "text-brand-secondary-100"
                  : "text-slate-500 dark:text-slate-300",
              )}
            >
              {localEq}
            </span>
          )}
        </button>

        {/* Floating Notification-Style Booked Badge */}
        {isBooked && !isPassed && (
          <span className="absolute -top-2 -right-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-rose-500 text-white dark:bg-rose-600 rounded shadow-xs border border-white dark:border-slate-900 pointer-events-none z-10 flex items-center gap-0.5 animate-in zoom-in-75 duration-150">
            Booked
          </span>
        )}
      </div>
    );
  };

  const selectedLocalEquivalent = time ? formatLocalEquivalent(time, date) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Choose Date & Time
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            Select your preferred consultation window. <br />
             Official times are in{" "}
            <strong className="text-brand-secondary-600 dark:text-brand-secondary-400 font-semibold">
              {BUSINESS_TIMEZONE_LABEL}
            </strong>
            .
          </p>
        </div>

        {/* Quick Date Presets */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded self-start sm:self-auto">
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

      {/* Timezone Helper Banner (Optimized for High-Contrast Dark & Light Mode) */}
      <div className="mb-5 p-3 rounded bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
          <div className="p-1.5 rounded bg-brand-secondary-500/10 dark:bg-brand-secondary-500/20 text-brand-secondary-600 dark:text-brand-secondary-400 shrink-0">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-300">Reference Standard: </span>
            <strong className="text-slate-950 dark:text-white font-bold">
              Accra / GMT+0 (UTC)
            </strong>
          </div>
        </div>

        {!userTz.isGmt ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-medium shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-brand-secondary-600 dark:text-brand-secondary-400 shrink-0" />
            <span>
              Your local timezone:{" "}
              <strong className="text-brand-secondary-600 dark:text-brand-secondary-400 font-bold">
                {userTz.shortLabel}
              </strong>{" "}
              ({userTz.locationLabel || userTz.formattedOffset})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Your local clock matches GMT</span>
          </div>
        )}
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
              disabled={isAccraPastDate}
              className="rounded mx-auto"
            />
          </div>

          {/* Quick Date Selector Input Fallback */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 px-1">
            <label
              htmlFor="native-date"
              className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-brand-secondary-500" />
              Or type exact date:
            </label>
            <input
              id="native-date"
              type="date"
              min={format(accraToday, "yyyy-MM-dd")}
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
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>Available Times</span>
              {isLoadingAvailability && (
                <Loader2 className="w-3 h-3 animate-spin text-brand-secondary-500" />
              )}
            </label>
            <span className="text-xs text-brand-secondary-600 dark:text-brand-secondary-400 font-medium">
              {date ? format(date, "EEEE, MMMM d") : "Select a date"}
            </span>
          </div>

          {!date ? (
            <div className="h-48 xl:h-64 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded text-slate-400 text-sm bg-slate-50/50 dark:bg-slate-900/50 p-6 text-center">
              <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-medium text-slate-700 dark:text-slate-300">
                Choose a date on the calendar
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Times will populate based on your selected date.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 flex-1 flex flex-col">
              {/* Notice if all slots for today have passed */}
              {allSlotsPassedToday && (
                <div className="p-3 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-950 dark:text-amber-100">
                      All scheduled slots for today in {userTz.city} have concluded.
                    </p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                      Please select <strong>Tomorrow</strong> or an upcoming date on the calendar.
                    </p>
                  </div>
                </div>
              )}

              {/* Morning Slots */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Morning (GMT)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {morningSlots.map((slot) => renderSlotButton(slot))}
                </div>
              </div>

              {/* Afternoon Slots */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                  <Sunset className="w-3.5 h-3.5 text-orange-500" /> Afternoon (GMT)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {afternoonSlots.map((slot) => renderSlotButton(slot))}
                </div>
              </div>

              {/* Evening / Extended Slots */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" /> Evening / After Hours (GMT)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {eveningSlots.map((slot) => renderSlotButton(slot))}
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
                    Need a custom time window (GMT)?
                  </button>
                ) : (
                  <form
                    onSubmit={handleCustomTimeSubmit}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="e.g. 02:30 PM GMT"
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
                <div className="mt-auto p-3 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700/60 flex flex-col gap-1 text-xs text-emerald-900 dark:text-emerald-100 animate-in fade-in duration-200 shadow-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      Selected: {format(date, "EEEE, MMMM d")} at {time} GMT+0
                    </span>
                  </div>
                  {selectedLocalEquivalent && (
                    <div className="mt-1 text-[11px] flex items-center text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Matches <strong className="text-emerald-950 dark:text-emerald-100">{selectedLocalEquivalent}</strong> on your local clock
                    </div>
                  )}
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
