import React from "react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
  sticky?: boolean;
}

export const AdminPageHeader = ({
  title,
  description,
  icon: Icon,
  className,
  children,
  sticky = true,
}: AdminPageHeaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-5 sm:mt-0 transition-all",
        sticky &&
          "sticky top-20 z-20 bg-background/95 backdrop-blur-md py-3 -mx-3 px-3 md:-mx-6 md:px-6 border-b border-border/50 shadow-xs rounded-b",
        className,
      )}
    >
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-3">
          {Icon && <Icon className="w-7 h-7 text-brand-secondary-400 shrink-0" />}
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-1">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {children}
        </div>
      )}
    </div>
  );
};
