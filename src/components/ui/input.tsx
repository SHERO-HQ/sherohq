import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Label } from "./label";

const inputVariants = cva(
    "flex w-full rounded border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            size: {
                default: "h-9 px-3 py-2 text-sm",
                sm: "h-8 px-2 py-1 text-xs",
                lg: "h-10 px-4 py-2 text-sm",
                xl: "h-12 px-5 py-3 text-base",
            },
            hasError: {
                true: "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
                false: "",
            },
        },
        defaultVariants: {
            size: "default",
            hasError: false,
        },
    },
);

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">, VariantProps<typeof inputVariants> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, label, error, leftIcon, rightIcon, id, size, ...props }, ref) => {
    const fallbackId = React.useId();
    const inputId = id || fallbackId;

    return (
        <div className="space-y-2 w-full">
            {label && <Label htmlFor={inputId}>{label}</Label>}
            <div className="relative group">
                {leftIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">{leftIcon}</div>}
                <input
                    type={type}
                    id={inputId}
                    className={cn(inputVariants({ size, hasError: !!error, className }), leftIcon && "pl-10", rightIcon && "pr-10")}
                    ref={ref}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    {...props}
                />
                {rightIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{rightIcon}</div>}
            </div>
            {error && (
                <p id={`${inputId}-error`} className="text-xs font-medium text-destructive mt-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
});
Input.displayName = "Input";

export { Input };
