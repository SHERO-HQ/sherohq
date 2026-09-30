"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, MessageCircle } from "lucide-react";
import { TextArea } from "@/components/forms/fields";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// Controls the admin sections share. Each action returns { ok } or a message.

export type ActionResult = { ok: true } | { ok: false; message: string };

export function useAdminAction() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const run = (action: () => Promise<ActionResult>, then?: () => void) =>
    start(async () => {
      const result = await action();
      setMessage(result.ok ? null : result.message);
      if (result.ok) then?.();
    });
  return { pending, message, run };
}

export function ActionError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-body-sm text-danger">
      {message}
    </p>
  );
}

/** Copies text and says so; if the browser refuses, says to copy by hand. */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState<boolean | null>(null);
  return (
    <span className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
        className={buttonClass({ variant: "outline" })}
      >
        {copied ? <Check aria-hidden="true" size={16} strokeWidth={1.5} /> : <Copy aria-hidden="true" size={16} strokeWidth={1.5} />}
        {copied ? "Copied" : label}
      </button>
      <span role="status" className="text-body-sm text-ink-secondary">
        {copied === false ? "Couldn't copy here; select it and copy by hand." : ""}
      </span>
    </span>
  );
}

/** A message ready to send by hand from the WhatsApp Business app (Phase 1: no API). */
export function WhatsAppMessage({ title, text, link }: { title: string; text: string; link: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-body-sm text-ink-secondary">{title}</span>
      <p className="rounded-sm border border-border bg-surface px-3.5 py-3 text-body-sm text-ink">{text}</p>
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton text={text} />
        <a href={link} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "secondary" })}>
          <MessageCircle aria-hidden="true" size={16} strokeWidth={1.5} />
          Open WhatsApp
        </a>
      </div>
    </div>
  );
}

/** One row of steps; the current one is pressed. Choosing one saves it. */
export function StepPicker({
  label,
  steps,
  value,
  onPick,
  disabled,
}: {
  label: string;
  steps: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onPick: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {steps.map((step) => {
        const current = step.value === value;
        return (
          <button
            key={step.value}
            type="button"
            aria-pressed={current}
            disabled={disabled}
            onClick={() => !current && onPick(step.value)}
            className={cn(
              "h-9 rounded-sm border px-3 text-body-sm",
              current ? "border-primary-fill bg-primary-fill text-on-primary-fill" : "border-border-strong text-ink hover:border-primary",
            )}
          >
            {step.label}
          </button>
        );
      })}
    </div>
  );
}

export function NotesForm({
  id,
  label,
  hint,
  initial,
  save,
}: {
  id: string;
  label: string;
  hint?: string;
  initial: string;
  save: (notes: string) => Promise<ActionResult>;
}) {
  const { pending, message, run } = useAdminAction();
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);
  return (
    <form
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        run(
          () => save(value),
          () => setSaved(true),
        );
      }}
      className="flex flex-col gap-3"
    >
      <TextArea
        id={id}
        label={label}
        hint={hint}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setSaved(false);
        }}
      />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending || value === initial} className={buttonClass({ variant: "outline" })}>
          {pending ? "Saving…" : "Save notes"}
        </button>
        <span role="status" className="text-body-sm text-secondary">
          {saved ? "Saved" : ""}
        </span>
      </div>
      <ActionError message={message} />
    </form>
  );
}

/** A destructive action behind a confirm; goes to `after` when done. */
export function DangerButton({
  label,
  confirmText,
  action,
  after,
}: {
  label: string;
  confirmText: string;
  action: () => Promise<ActionResult>;
  after?: string;
}) {
  const { pending, message, run } = useAdminAction();
  const router = useRouter();
  return (
    <span className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm(confirmText)) run(action, () => after && router.push(after));
        }}
        className={buttonClass({ variant: "danger" })}
      >
        {label}
      </button>
      <ActionError message={message} />
    </span>
  );
}
