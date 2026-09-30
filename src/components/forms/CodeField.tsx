"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * A 6-digit code shown as six boxes. Underneath it is one ordinary input, so
 * paste, the phone's code autofill, screen readers and password managers all
 * work as with any field; the boxes only draw what's typed.
 */
export function CodeField({
  id,
  label,
  error,
  hint,
  value,
  onChange,
  onComplete,
  disabled,
  length = 6,
}: {
  id: string;
  label: string;
  error?: string | null;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  /** Called once all the digits are in, e.g. to submit. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  length?: number;
}) {
  const [focused, setFocused] = useState(false);
  const described = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const active = Math.min(value.length, length - 1);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          value={value}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").slice(0, length);
            onChange(digits);
            if (digits.length === length && digits !== value) onComplete?.(digits);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={length}
          // Read-only rather than disabled while checking, so focus stays in the field.
          readOnly={disabled}
          autoFocus
          aria-invalid={error ? true : undefined}
          aria-describedby={described}
          className="absolute inset-0 z-10 size-full cursor-text opacity-0"
        />
        <div aria-hidden="true" className="grid grid-cols-6 gap-2">
          {Array.from({ length }, (_, i) => {
            const current = focused && i === active && !disabled;
            return (
              <span
                key={i}
                className={cn(
                  "flex h-12 items-center justify-center rounded-sm border bg-surface-raised font-mono text-h3 text-ink",
                  error ? "border-danger" : current ? "border-primary outline-2 outline-offset-1 outline-focus" : "border-border-strong",
                )}
              >
                {value[i] ?? (current ? <span className="h-6 w-px bg-ink" /> : null)}
              </span>
            );
          })}
        </div>
      </div>
      {error ? (
        <span id={`${id}-error`} role="alert" className="text-body-sm text-danger">
          {error}
        </span>
      ) : (
        hint && (
          <span id={`${id}-hint`} className="text-body-sm text-ink-muted">
            {hint}
          </span>
        )
      )}
    </div>
  );
}
