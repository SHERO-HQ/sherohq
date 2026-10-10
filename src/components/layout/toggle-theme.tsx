"use client";
import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { useIsMounted } from "@/hooks/useIsMounted";

export interface ToggleThemeProps {
  variant?: "dropdown" | "3-button";
  showLabels?: boolean;
  className?: string;
}

export const ToggleTheme = ({
  variant = "dropdown",
  showLabels = false,
  className = "",
}: ToggleThemeProps) => {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();

  if (variant === "3-button") {
    const options = [
      { value: "light" as const, label: "Light", icon: Sun },
      { value: "system" as const, label: "System", icon: Monitor },
      { value: "dark" as const, label: "Dark", icon: Moon },
    ];

    return (
      <div
        role="radiogroup"
        aria-label="Select color theme"
        className={`inline-flex items-center p-1 rounded-full border border-border bg-muted/60 dark:bg-muted/40 backdrop-blur-xs text-muted-foreground shadow-2xs ${className}`}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = mounted && theme === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`${opt.label} theme`}
              title={`${opt.label} theme`}
              onClick={() => setTheme(opt.value)}
              className={`cursor-pointer inline-flex items-center justify-center transition-all select-none ${
                showLabels
                  ? "gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md"
                  : "w-8 h-8 rounded-full"
              } ${
                isActive
                  ? "bg-background text-foreground shadow-xs border border-border/60 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40 border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {showLabels ? (
                <span className="text-xs">{opt.label}</span>
              ) : (
                <span className="sr-only">{opt.label}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer hover:bg-muted/70 rounded h-9 w-9 border-none bg-transparent"
        >
          <Sun className="h-5 w-5 scale-100 rotate-0 transition dark:scale-0 dark:-rotate-90 text-muted-foreground" />
          <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition dark:scale-100 dark:rotate-0 text-muted-foreground" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer"
        >
          <Sun className="h-4 w-4 mr-2" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer"
        >
          <Moon className="h-4 w-4 mr-2" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer"
        >
          <Monitor className="h-4 w-4 mr-2" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ThemeToggle3Button = (props: Omit<ToggleThemeProps, "variant">) => (
  <ToggleTheme variant="3-button" {...props} />
);
