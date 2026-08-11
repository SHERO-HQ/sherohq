"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

export function SheroToaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system"}
      position="top-right"
      expand={true}
      richColors
      closeButton
      icons={{
        success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
        error: <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
        info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast glass-surface border border-border/60 shadow-xl rounded-xl font-sora p-4 text-foreground text-sm flex gap-3 items-start transition-all duration-300",
          title: "font-semibold text-sm text-foreground leading-tight",
          description: "text-xs text-muted-foreground leading-relaxed mt-1",
          actionButton:
            "bg-brand-primary-700 hover:bg-brand-primary-800 text-white font-medium rounded-md px-3 py-1.5 text-xs transition-colors shadow-sm",
          cancelButton:
            "bg-muted hover:bg-muted/80 text-muted-foreground font-medium rounded-md px-3 py-1.5 text-xs transition-colors",
          closeButton:
            "text-muted-foreground hover:text-foreground bg-transparent border-none hover:bg-muted/50 rounded-full transition-colors",
          success:
            "!bg-emerald-500/10 dark:!bg-emerald-950/40 !border-emerald-500/30 !text-foreground",
          error:
            "!bg-red-500/10 dark:!bg-red-950/40 !border-red-500/30 !text-foreground",
          warning:
            "!bg-amber-500/10 dark:!bg-amber-950/40 !border-amber-500/30 !text-foreground",
          info:
            "!bg-blue-500/10 dark:!bg-blue-950/40 !border-blue-500/30 !text-foreground",
        },
      }}
    />
  );
}
