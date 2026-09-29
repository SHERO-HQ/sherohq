"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { currentTheme, setTheme, subscribeTheme } from "@/lib/theme";
import { cn } from "@/lib/cn";

/** Switches between light and dark. Starts from the visitor's system setting. */
export function ThemeToggle({ className }: { className?: string }) {
  // Null on the server: the theme is only known in the browser.
  const theme = useSyncExternalStore(subscribeTheme, currentTheme, () => null);
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn(
        "flex size-11 items-center justify-center rounded-sm text-ink-secondary transition-colors duration-150 hover:text-primary",
        className,
      )}
    >
      {/* Before hydration both icons are hidden, so nothing jumps. */}
      <Sun aria-hidden="true" size={20} strokeWidth={1.5} className={theme === "dark" ? "block" : "hidden"} />
      <Moon aria-hidden="true" size={20} strokeWidth={1.5} className={theme === "light" ? "block" : "hidden"} />
    </button>
  );
}
