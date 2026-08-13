"use client";

import React from "react";
import { m } from "motion/react";
import { format } from "date-fns";
import {
  CheckCircle2,
  Calendar as CalendarIcon,
  Video,
  PhoneCall,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MEET_URL =
  process.env.NEXT_PUBLIC_CONSULTATION_MEET_URL ||
  "https://meet.google.com/kps-huth-jfd";
const MEET_DIAL_IN =
  process.env.NEXT_PUBLIC_CONSULTATION_MEET_DIAL_IN ||
  "(ZA) +27 10 823 1292 PIN: 183 170 582#";

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
  const endDate = new Date(startDate.getTime() + 45 * 60 * 1000);

  const formatIso = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

  const fullDescription = `${description}\n\nGoogle Meet Link: ${MEET_URL}\nDial-in: ${MEET_DIAL_IN}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `SHERO Consultation: ${title}`,
    details: fullDescription,
    location: MEET_URL,
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
  const endDate = new Date(startDate.getTime() + 45 * 60 * 1000);

  const formatIso = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SHERO Technologies//EN",
    "BEGIN:VEVENT",
    `SUMMARY:SHERO Consultation: ${title}`,
    `DESCRIPTION:${description}\\n\\nGoogle Meet: ${MEET_URL}\\nDial-in: ${MEET_DIAL_IN}`,
    `LOCATION:${MEET_URL}`,
    `URL:${MEET_URL}`,
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
  const [copied, setCopied] = React.useState(false);

  const googleCalUrl = getGoogleCalendarUrl(
    serviceTitle,
    `Consultation with SHERO Technologies for ${formData.firstName} ${formData.lastName}. Contact: ${formData.email}`,
    formData.date,
    formData.time,
  );

  const copyMeetLink = () => {
    navigator.clipboard.writeText(MEET_URL);
    setCopied(true);
    toast.success("Google Meet link copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-xl mx-auto p-6 md:p-10 bg-white dark:bg-slate-900 rounded shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 text-center">
      <m.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 md:w-20 md:h-20 bg-brand-secondary-100 dark:bg-brand-secondary-900/30 rounded-full flex items-center justify-center mx-auto mb-5"
      >
        <CheckCircle2 className="w-9 h-9 md:w-10 md:h-10 text-brand-secondary-600 dark:text-brand-secondary-400" />
      </m.div>

      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Booking Confirmed!
      </h2>

      <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-6 mx-auto leading-relaxed">
        Your{" "}
        <strong className="text-brand-secondary-600 dark:text-brand-secondary-400 font-bold">
          {serviceTitle}
        </strong>{" "}
        consultation is scheduled for:
        <span className="font-bold text-brand-secondary-600 dark:text-brand-secondary-400 block text-lg md:text-xl mt-1">
          {formData.date && format(formData.date, "EEEE, MMMM d, yyyy")} at{" "}
          {formData.time} GMT
        </span>
      </p>

      {/* Google Meet Room Card */}
      <div className="p-4 mb-6 rounded border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-left">
        <div className="flex items-center gap-2 mb-2 text-emerald-900 dark:text-emerald-300 font-bold text-sm">
          <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>SHERO Consultation Room (Google Meet)</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 my-2">
          <a
            href={MEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white font-bold text-xs rounded transition-all shadow-sm"
          >
            <Video className="w-4 h-4" />
            Join Google Meet Call
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          <button
            type="button"
            onClick={copyMeetLink}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-900 dark:text-emerald-200 font-semibold text-xs rounded transition cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>

        <div className="mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <PhoneCall className="w-3 h-3 text-slate-400" />
            <span>Phone dial-in: {MEET_DIAL_IN}</span>
          </div>
          <span className="text-[10px] text-slate-400">
            Link: {MEET_URL}
          </span>
        </div>
      </div>

      {/* Calendar Export Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mb-6">
        <a
          href={googleCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs rounded shadow transition-all"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
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
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          Download .ics (Apple / Outlook)
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-6">
        A confirmation email with meeting details has been sent to{" "}
        <strong className="text-slate-700 dark:text-slate-300">
          {formData.email}
        </strong>
      </p>

      <Button onClick={onReset} variant="outline" className="rounded px-6">
        Book Another Session
      </Button>
    </div>
  );
}
