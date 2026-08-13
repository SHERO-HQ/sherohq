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

// Custom DayButton for guaranteed styling across states
function CalendarDayButton({
  day: _day,
  modifiers,
  className,
  ...buttonProps
}: any) {
  return (
    <button
      {...buttonProps}
      className={cn(
        "h-9 w-9 p-0 font-normal rounded cursor-pointer transition-colors flex items-center justify-center text-sm m-0",
        modifiers?.selected &&
          "!bg-brand-secondary-600 !text-white font-bold hover:!bg-brand-secondary-700 shadow ring-1 ring-brand-secondary-400",
        modifiers?.today &&
          !modifiers?.selected &&
          "bg-slate-100 text-slate-900 dark:bg-slate-800/80 dark:text-slate-100 font-semibold border border-slate-200 dark:border-slate-700",
        !modifiers?.selected &&
          !modifiers?.today &&
          !modifiers?.disabled &&
          "text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
        modifiers?.outside &&
          !modifiers?.selected &&
          "text-slate-400 dark:text-slate-600 opacity-60 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800",
        modifiers?.disabled &&
          "text-slate-300 dark:text-slate-700 opacity-20 !cursor-not-allowed pointer-events-none hover:bg-transparent",
        className,
      )}
    />
  );
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
        month_caption:
          "flex justify-center pt-1 relative items-center mb-2 px-1",
        caption_label: "text-sm font-bold text-slate-800 dark:text-slate-100",

        // Navigation Styles
        nav: "flex items-center gap-1 absolute right-1 top-0 z-20",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 text-slate-900 hover:text-slate-900 dark:text-slate-200 dark:hover:text-slate-100 transition-colors cursor-pointer rounded",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 text-slate-900 hover:text-slate-900 dark:text-slate-200 dark:hover:text-slate-100 transition-colors cursor-pointer rounded",
        ),

        // Grid / Table Styles
        month_grid: "w-full border-collapse space-y-1 block",
        weekdays: "flex w-full justify-between mb-2",
        weekday:
          "text-slate-500 rounded w-9 font-normal text-[0.8rem] dark:text-slate-400 block text-center tracking-wide",
        weeks: "w-full space-y-1 block",
        week: "flex w-full mt-1 justify-between",
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 block",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer text-slate-900 dark:text-slate-200 transition-colors flex items-center justify-center m-0",
        ),

        // Backward compatibility for deprecated v8 names
        caption: "flex justify-center pt-1 relative items-center mb-2 px-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 text-slate-900 hover:text-slate-900 dark:text-slate-200 dark:hover:text-slate-100 transition-colors cursor-pointer rounded",
        ),
        nav_button_previous: "static",
        nav_button_next: "static",
        table: "w-full border-collapse space-y-1 block",
        head_row: "flex w-full justify-between",
        head_cell:
          "text-slate-500 rounded w-9 font-normal text-[0.8rem] dark:text-slate-400 block text-center",
        row: "flex w-full mt-1 justify-between",
        cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 block",

        ...classNames,
      }}
      modifiersClassNames={{
        selected:
          "[&>button]:bg-brand-secondary-600 [&>button]:!text-white [&>button]:hover:bg-brand-secondary-700 [&>button]:hover:!text-white [&>button]:focus:bg-brand-secondary-700 [&>button]:focus:!text-white dark:[&>button]:bg-brand-secondary-600 dark:[&>button]:!text-white [&>button]:shadow [&>button]:ring-1 [&>button]:ring-brand-secondary-400 [&>button]:font-bold",
        today:
          "[&>button]:bg-slate-100 [&>button]:text-slate-900 dark:[&>button]:bg-slate-800/80 dark:[&>button]:text-slate-100 [&>button]:font-semibold [&>button]:border [&>button]:border-slate-200 dark:[&>button]:border-slate-700",
        outside:
          "[&>button]:text-slate-400 [&>button]:opacity-40 dark:[&>button]:text-slate-600 [&>button]:pointer-events-none",
        disabled:
          "[&>button]:text-slate-300 [&>button]:opacity-30 dark:[&>button]:text-slate-700 [&>button]:!cursor-not-allowed [&>button]:pointer-events-none [&>button]:hover:bg-transparent",
        range_start:
          "[&>button]:bg-brand-secondary-600 [&>button]:!text-white [&>button]:rounded-l",
        range_end:
          "[&>button]:bg-brand-secondary-600 [&>button]:!text-white [&>button]:rounded-r",
        range_middle:
          "[&>button]:bg-slate-100 dark:[&>button]:bg-slate-800 [&>button]:text-slate-900 dark:[&>button]:text-slate-100 [&>button]:rounded-none",
        hidden: "invisible",
      }}
      components={{
        Chevron: CalendarChevron,
        DayButton: CalendarDayButton,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
