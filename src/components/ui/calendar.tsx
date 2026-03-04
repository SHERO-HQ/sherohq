"use client";
import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { DayPicker, type ChevronProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/buttonVariants";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// Helper component for V9 Chevron
function CalendarChevron({ orientation, className, ...props }: ChevronProps) {
  let Icon = ChevronDown;
  if (orientation === "left") Icon = ChevronLeft;
  else if (orientation === "right") Icon = ChevronRight;
  else if (orientation === "up") Icon = ChevronUp;

  return <Icon className={cn("h-4 w-4", className)} {...props} />;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1 md:p-3 relative", className)}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 relative",
        month: "space-y-4 w-full",
        caption: "flex justify-start pt-1 relative items-center px-1 mb-2",
        caption_label: "text-sm font-bold text-slate-800 dark:text-slate-100",

        // Navigation Styles
        nav: "flex items-center gap-1 absolute right-2 top-0 z-20 rounded cursor-pointer",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 text-slate-900 hover:text-slate-900 dark:text-slate-200 dark:hover:text-slate-100 transition-colors cursor-pointer rounded",
        ),
        nav_button_previous: "static",
        nav_button_next: "static",

        // Table Styles
        table: "w-full border-collapse space-y-1 block",
        head_row: "flex w-full justify-between",
        head_cell:
          "text-slate-500 rounded w-9 font-normal text-[0.8rem] dark:text-slate-400 block text-center",
        row: "flex w-full mt-2 justify-between",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r [&:has([aria-selected].day-outside)]:bg-slate-100 [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l last:[&:has([aria-selected])]:rounded-r focus-within:relative focus-within:z-20 dark:[&:has([aria-selected].day-outside)]:bg-slate-800 dark:[&:has([aria-selected])]:bg-slate-800 block",

        // Day Styles
        weekdays: "flex w-full justify-between mb-2",
        weekday:
          "text-slate-500 rounded w-9 font-normal text-[0.8rem] dark:text-slate-400 block text-center tracking-wide",
        week: "flex w-full mt-1 justify-between",

        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "md:h-9 md:w-9 h-8 w-8 p-0 font-normal hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer text-slate-900 dark:text-slate-200 md:m-1 m-0",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "md:h-9 md:w-9 h-8 w-8 p-0 font-normal hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer text-slate-900 dark:text-slate-200 md:m-1 m-0",
        ),

        ...classNames,
      }}
      modifiersClassNames={{
        selected:
          "bg-emerald-600 !text-white hover:bg-emerald-700 hover:!text-white focus:bg-emerald-700 focus:!text-white dark:bg-emerald-600 dark:!text-white shadow-md ring-1 ring-emerald-400 font-bold",
        today:
          "bg-slate-100 text-slate-900 dark:bg-slate-800/80 dark:text-slate-100 font-semibold border border-slate-200 dark:border-slate-700",
        outside:
          "text-slate-400 aria-selected:bg-slate-100 aria-selected:text-slate-500 dark:text-slate-600 dark:aria-selected:bg-slate-800",
        disabled:
          "text-slate-300 opacity-30 dark:text-slate-700 !cursor-not-allowed hover:bg-transparent",
        range_middle:
          "aria-selected:bg-slate-100 aria-selected:text-slate-900 dark:aria-selected:bg-slate-800 dark:aria-selected:text-slate-50",
        hidden: "invisible",
      }}
      components={{
        Chevron: CalendarChevron,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
