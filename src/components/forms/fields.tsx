import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/Button";
import { dialCodes } from "@/lib/phone";

// The look of every field, without its width (a phone number's country code is narrower).
const controlLook =
  "rounded-sm border border-border-strong bg-surface-raised px-3.5 text-body text-ink placeholder:text-ink-muted aria-invalid:border-danger";
const control = `w-full ${controlLook}`;

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
};

function Field({ id, label, hint, error, className, children }: FieldProps & { children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-label text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <span id={`${id}-error`} className="text-body-sm text-danger">
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

const describedBy = (id: string, hint?: string, error?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

export function TextField({
  id,
  label,
  hint,
  error,
  className,
  ...input
}: FieldProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id">) {
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(control, "h-10")}
        {...input}
      />
    </Field>
  );
}

export function TextArea({
  id,
  label,
  hint,
  error,
  className,
  ...input
}: FieldProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id">) {
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        name={id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(control, "min-h-30 resize-y py-3")}
        {...input}
      />
    </Field>
  );
}

export function SelectField({
  id,
  label,
  hint,
  error,
  className,
  options,
  ...select
}: FieldProps & { options: Array<{ value: string; label: string }> } & Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "id"
  >) {
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <select
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(control, "h-10")}
        {...select}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function RadioCards({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2.5 text-label text-ink">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-center gap-3 rounded-sm border border-border-strong bg-surface-raised px-4 py-3.5 text-body font-medium text-ink has-checked:border-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="size-4 accent-primary focus-visible:outline-none"
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

export function SubmitButton({ children, pending }: { children: React.ReactNode; pending?: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClass({ size: "lg", full: true })}
    >
      {children}
    </button>
  );
}

/**
 * A phone number with its country code, for forms that take clients anywhere
 * (consultations, waitlists). Ghana is chosen first; a number typed with its
 * own + code wins. Submits `phoneCountry` and `phone` (see phoneFromParts).
 */
export function PhoneField({ id, error, className }: { id: string; error?: string; className?: string }) {
  return (
    <fieldset className={cn("flex flex-col gap-1.5", className)} aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="mb-1.5 text-label text-ink">Phone number</legend>
      <div className="flex gap-2">
        <label htmlFor={`${id}-country`} className="sr-only">
          Country code
        </label>
        <select
          id={`${id}-country`}
          name="phoneCountry"
          defaultValue="233"
          autoComplete="tel-country-code"
          className={cn(controlLook, "h-10 w-32 shrink-0 px-2.5")}
        >
          {dialCodes.map((d) => (
            <option key={d.code} value={d.code}>
              {d.label}
            </option>
          ))}
        </select>
        <label htmlFor={id} className="sr-only">
          Number
        </label>
        <input
          id={id}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="024 412 3456"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
          className={cn(controlLook, "h-10 min-w-0 flex-1")}
        />
      </div>
      {error ? (
        <span id={`${id}-error`} className="text-body-sm text-danger">
          {error}
        </span>
      ) : (
        <span id={`${id}-hint`} className="text-body-sm text-ink-muted">
          Another country? Choose its code, or type the number with +.
        </span>
      )}
    </fieldset>
  );
}
