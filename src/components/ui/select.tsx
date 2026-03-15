"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
 label?: string;
 error?: string;
 options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
 ({ className, label, error, options, id, ...props }, ref) => {
 const fallbackId = React.useId();
 const selectId = id || fallbackId;

 return (
 <div className="space-y-2 w-full">
 {label && <Label htmlFor={selectId}>{label}</Label>}
 <div className="relative">
 <select
 id={selectId}
 className={cn(
 "flex h-9 w-full rounded border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
 error && "border-destructive focus-visible:ring-destructive",
 className,
 )}
 ref={ref}
 {...props}
 >
 {options.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground transition-colors">
 <ChevronDown className="h-4 w-4" />
 </div>
 </div>
 {error && (
 <p className="text-xs font-medium text-red-500 mt-1 animate-in fade-in slide-in-from-top-1">
 {error}
 </p>
 )}
 </div>
 );
 },
);
Select.displayName = "Select";

export { Select };
