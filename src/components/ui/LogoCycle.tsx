"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

const reducedMotion = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(reducedMotion);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * A fixed number of spots that each swap to another name, one spot at a time
 * (Clerk's partner row). Spot i shows items i, i + slots, i + 2·slots, …, so
 * every name gets its turn. With no more items than spots it stays still.
 */
function Slots({ items, slots, className }: { items: string[]; slots: number; className?: string }) {
  const still = useSyncExternalStore(subscribeMotion, () => window.matchMedia(reducedMotion).matches, () => false);
  const cycles = items.length > slots && !still;
  // How far each spot has moved through its own list of names.
  const [turns, setTurns] = useState<number[]>(() => Array(slots).fill(0));

  useEffect(() => {
    if (!cycles) return;
    let spot = 0;
    const id = setInterval(() => {
      const target = spot; // read before advancing: the update runs later
      setTurns((current) => current.map((turn, i) => (i === target ? turn + 1 : turn)));
      spot = (spot + 1) % slots;
    }, 2500);
    return () => clearInterval(id);
  }, [cycles, slots]);

  // With motion off (or nothing to swap), every name shows, wrapping as needed.
  const shown = cycles
    ? Array.from({ length: slots }, (_, i) => {
        const own = items.filter((_, index) => index % slots === i);
        return own[turns[i] % own.length];
      })
    : items;

  return (
    <ul aria-hidden="true" className={className}>
      {shown.map((item, i) => (
        <li key={`${i}-${item}`} className="flex h-12 items-center justify-center">
          {/* Only a name that has just swapped in animates; the first names are simply there. */}
          <span
            className={cn(
              "font-display text-h3 whitespace-nowrap text-ink-secondary",
              cycles && turns[i] > 0 && "animate-logo-in",
            )}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Two spots on phones, four in a row on large screens; screen readers get the list once. */
export function LogoCycle({ items }: { items: string[] }) {
  return (
    <div className="min-w-0 flex-1">
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Slots items={items} slots={2} className="grid grid-cols-2 gap-x-4 gap-y-2 lg:hidden" />
      <Slots items={items} slots={4} className="hidden grid-cols-4 gap-x-6 lg:grid" />
    </div>
  );
}
