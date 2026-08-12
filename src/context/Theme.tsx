"use client";
import { useEffect, useState } from "react";
import { ThemeProviderContext } from "./ThemeContext";

import type { Theme } from "@/types/theme";

type ThemeProviderProps = {
 children: React.ReactNode;
 defaultTheme?: Theme;
 storageKey?: string;
};

export function ThemeProvider({
 children,
 defaultTheme = "system",
 storageKey = "shero-ui-theme",
 ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey) as Theme;
      if (saved) return saved;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (resolvedTheme: "light" | "dark") => {
      if (resolvedTheme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
    };

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mediaQuery.matches ? "dark" : "light");

      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    applyTheme(theme);
  }, [theme, storageKey]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      // Add transition class to root during theme toggling
      const root = window.document.documentElement;
      root.classList.add("theme-transitioning");

      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);

      // Cleanup class after transition is complete (300ms)
      setTimeout(() => {
        root.classList.remove("theme-transitioning");
      }, 300);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
