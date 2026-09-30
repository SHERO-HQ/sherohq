"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { currentChoice, setThemeChoice, subscribeTheme, type ThemeChoice } from "@/lib/theme";
import { cn } from "@/lib/cn";

const options: Array<{ value: ThemeChoice; label: string; Icon: typeof Sun }> = [
  { value: "system", label: "Match my device", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

/**
 * The theme, in the footer (as Vercel does): follow the device, or always
 * light or dark. Radio buttons, so arrow keys move between them.
 */
export function ThemeSwitch({ className }: { className?: string }) {
  // Null on the server: the choice is only known in the browser, so none shows as picked until then.
  const choice = useSyncExternalStore(subscribeTheme, currentChoice, () => null);
  return (
    <fieldset className={cn("flex items-center rounded-full border border-border-inverse p-0.5", className)}>
      <legend className="sr-only">Theme</legend>
      {options.map(({ value, label, Icon }) => (
        <label
          key={value}
          title={label}
          className={cn(
            "flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-focus",
            choice === value ? "bg-ink-inverse/15 text-ink-inverse" : "text-ink-inverse-muted hover:text-ink-inverse",
          )}
        >
          <input
            type="radio"
            name="theme"
            value={value}
            checked={choice === value}
            onChange={() => setThemeChoice(value)}
            className="sr-only"
          />
          <Icon aria-hidden="true" size={16} strokeWidth={1.5} />
          <span className="sr-only">{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
