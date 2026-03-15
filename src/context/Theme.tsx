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
 const [theme, setTheme] = useState<Theme>(defaultTheme);
 const [isLoaded, setIsLoaded] = useState(false);

 // Load theme from localStorage on client side only
 useEffect(() => {
 const savedTheme = localStorage.getItem(storageKey) as Theme;
 if (savedTheme) {
 queueMicrotask(() => setTheme(savedTheme));
 }
 queueMicrotask(() => setIsLoaded(true));
 }, [storageKey]);

 useEffect(() => {
 if (!isLoaded) return;

 const root = window.document.documentElement;

 const applyTheme = (resolvedTheme: "light" | "dark") => {
 root.classList.remove("light", "dark");
 root.classList.add(resolvedTheme);
 };

 if (theme === "system") {
 const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

 // Apply the current system theme
 applyTheme(mediaQuery.matches ? "dark" : "light");

 // Listen for system theme changes
 const handleChange = (e: MediaQueryListEvent) => {
 applyTheme(e.matches ? "dark" : "light");
 };

 mediaQuery.addEventListener("change", handleChange);

 // Cleanup listener on unmount or theme change
 return () => mediaQuery.removeEventListener("change", handleChange);
 }

 applyTheme(theme);
 }, [theme, isLoaded]);

 const value = {
 theme,
 setTheme: (theme: Theme) => {
 localStorage.setItem(storageKey, theme);
 setTheme(theme);
 },
 };

 return (
 <ThemeProviderContext.Provider {...props} value={value}>
 {children}
 </ThemeProviderContext.Provider>
 );
}
