"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Day, dayToDate, formatDay, monthGrid } from "@/lib/booking";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  today: Day;
  /** Last month people may page to. */
  lastDay: Day;
  selected: Day | null;
  isAvailable: (day: Day) => boolean;
  onSelect: (day: Day) => void;
};

/** A month of days as buttons. Unavailable days are disabled, never hidden. */
export function Calendar({ today, lastDay, selected, isAvailable, onSelect }: Props) {
  const start = dayToDate(selected ?? today);
  const [view, setView] = useState({ year: start.getUTCFullYear(), month: start.getUTCMonth() });
  const first = dayToDate(today);
  const last = dayToDate(lastDay);
  const canPrev = view.year * 12 + view.month > first.getUTCFullYear() * 12 + first.getUTCMonth();
  const canNext = view.year * 12 + view.month < last.getUTCFullYear() * 12 + last.getUTCMonth();
  const shift = (n: number) =>
    setView(({ year, month }) => {
      const d = new Date(Date.UTC(year, month + n, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });
  const title = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", month: "long", year: "numeric" }).format(
    new Date(Date.UTC(view.year, view.month, 1)),
  );

  const navButton = "inline-flex size-9 items-center justify-center rounded-control text-ink-secondary hover:bg-surface disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="rounded-card border border-border p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" className={navButton} onClick={() => shift(-1)} disabled={!canPrev} aria-label="Previous month">
          <ChevronLeft aria-hidden="true" size={18} />
        </button>
        <h3 className="text-base font-semibold text-ink" aria-live="polite">
          {title}
        </h3>
        <button type="button" className={navButton} onClick={() => shift(1)} disabled={!canNext} aria-label="Next month">
          <ChevronRight aria-hidden="true" size={18} />
        </button>
      </div>
      <table className="w-full table-fixed border-collapse text-center text-sm">
        <caption className="sr-only">Choose a day in {title}. Weekdays only.</caption>
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th key={d} scope="col" className="pb-2 text-xs font-medium text-ink-muted">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthGrid(view.year, view.month).map((week, i) => (
            <tr key={i}>
              {week.map((day, j) => (
                <td key={day ?? `empty-${i}-${j}`} className="p-0.5">
                  {day && (
                    <button
                      type="button"
                      disabled={!isAvailable(day)}
                      aria-pressed={selected === day}
                      aria-label={formatDay(day)}
                      onClick={() => onSelect(day)}
                      className={cn(
                        "mx-auto flex size-9 items-center justify-center rounded-control tabular-nums transition-colors",
                        "disabled:cursor-not-allowed disabled:text-ink-muted/50",
                        selected === day
                          ? "bg-primary font-semibold text-on-primary"
                          : "text-ink enabled:hover:bg-surface",
                        day === today && selected !== day && "font-semibold text-link underline underline-offset-4",
                      )}
                    >
                      {Number(day.slice(8))}
                    </button>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
