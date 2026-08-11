"use client";

import React from "react";
import { m } from "motion/react";
import { format } from "date-fns";
import { CheckCircle2, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function getGoogleCalendarUrl(
  title: string,
  description: string,
  date?: Date,
  timeStr?: string,
) {
  if (!date) return "#";
  const [time, period] = (timeStr || "09:00 AM").split(" ");
  const [hoursStr, minsStr] = time.split(":");
  let hours = parseInt(hoursStr, 10);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const startDate = new Date(date);
  startDate.setHours(hours, parseInt(minsStr || "0", 10), 0);
  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

  const formatIso = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `SHERO Consultation: ${title}`,
    details: description,
    location: "Online / SHERO Technologies Headquarters, Accra",
    dates: `${formatIso(startDate)}/${formatIso(endDate)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadIcsFile(
  title: string,
  description: string,
  date?: Date,
  timeStr?: string,
) {
  if (!date) return;
  const [time, period] = (timeStr || "09:00 AM").split(" ");
  const [hoursStr, minsStr] = time.split(":");
  let hours = parseInt(hoursStr, 10);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const startDate = new Date(date);
  startDate.setHours(hours, parseInt(minsStr || "0", 10), 0);
  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

  const formatIso = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SHERO Technologies//EN",
    "BEGIN:VEVENT",
    `SUMMARY:SHERO Consultation: ${title}`,
    `DESCRIPTION:${description}`,
    "LOCATION:Online / SHERO Technologies Headquarters",
    `DTSTART:${formatIso(startDate)}`,
    `DTEND:${formatIso(endDate)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute(
    "download",
    `shero-consultation-${startDate.toISOString().split("T")[0]}.ics`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

interface SchedulerSuccessProps {
  serviceTitle: string;
  formData: {
    date?: Date;
    time: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  onReset: () => void;
}

export function SchedulerSuccess({
  serviceTitle,
  formData,
  onReset,
}: SchedulerSuccessProps) {
  const googleCalUrl = getGoogleCalendarUrl(
    serviceTitle,
    `Consultation with SHERO Technologies for ${formData.firstName} ${formData.lastName}. Contact: ${formData.email}`,
    formData.date,
    formData.time,
  );

  return (
    <div className="max-w-xl mx-auto p-8 md:p-10 bg-white dark:bg-slate-900 rounded shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 text-center">
      <m.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-20 h-20 bg-brand-secondary-100 dark:bg-brand-secondary-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle2 className="w-10 h-10 text-brand-secondary-600 dark:text-brand-secondary-400" />
      </m.div>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        Booking Confirmed!
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6 mx-auto leading-relaxed">
        Your{" "}
        <strong className="text-brand-secondary-600 dark:text-brand-secondary-400 font-bold">
          {serviceTitle}
        </strong>
        <br />
        is scheduled for <br />
        <span className="font-semibold text-emerald-500 block text-lg mt-1">
          {formData.date && format(formData.date, "MMMM do, yyyy")} at{" "}
          {formData.time} GMT
        </span>
      </p>

      {/* Add to Calendar Actions */}
      <div className="flex flex-col items-center justify-center gap-3 mb-8 p-4 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
        <a
          href={googleCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded shadow transition-all"
        >
          <CalendarIcon className="w-4 h-4" />
          Add to Google Calendar
        </a>
        <button
          onClick={() =>
            downloadIcsFile(
              serviceTitle,
              `Consultation with SHERO Technologies for ${formData.firstName} ${formData.lastName}`,
              formData.date,
              formData.time,
            )
          }
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded transition-colors cursor-pointer"
        >
          Download .ics (Apple / Outlook)
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-6">
        A confirmation email has been sent to {formData.email}
      </p>
      <Button onClick={onReset} variant="outline" className="rounded px-6">
        Book Another Session
      </Button>
    </div>
  );
}
