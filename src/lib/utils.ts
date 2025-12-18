import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function navLinkClass(isActive: boolean) {
  return cn(
    "px-2 py-1 hover:outline hover:bg-accent/90 transition-all duration-500 ease-in-out rounded",
    isActive
      ? "bg-primary hover:bg-primary text-gray-100 font-medium"
      : "text-slate-700 dark:text-slate-200 hover:bg-muted hover:text-foreground"
  );
}
