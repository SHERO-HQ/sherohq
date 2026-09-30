"use client";

import { useState, useTransition } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { advanceOrder, cancelOrder, markPaid, setDeliveryFee } from "@/app/admin/(app)/orders/actions";
import { TextField } from "@/components/forms/fields";
import { buttonClass } from "@/components/ui/Button";

type Result = { ok: true } | { ok: false; message: string };

function useAction() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const run = (action: () => Promise<Result>) =>
    start(async () => {
      const result = await action();
      setMessage(result.ok ? null : result.message);
    });
  return { pending, message, run };
}

/** The Next step card: the one action that moves the order on, and the message to send. */
export function NextStep({
  orderId,
  status,
  hint,
  advance,
  feeToAgree,
  whatsapp,
}: {
  orderId: string;
  status: string;
  hint: string;
  /** The button label, or null when there's no next step. */
  advance: string | null;
  /** The region, when a delivery fee must be agreed before dispatch. */
  feeToAgree: string | null;
  whatsapp: { text: string; link: string } | null;
}) {
  const { pending, message, run } = useAction();
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-ink-secondary">{hint}</p>
      {feeToAgree && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            run(() => setDeliveryFee(orderId, data));
          }}
          className="flex items-end gap-3"
        >
          <TextField id="fee" label={`Delivery fee to ${feeToAgree} (GHS)`} inputMode="decimal" placeholder="60" className="flex-1" />
          <button type="submit" disabled={pending} className={buttonClass({ size: "lg", variant: "outline" })}>
            Save fee
          </button>
        </form>
      )}
      {advance && !feeToAgree && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => advanceOrder(orderId, status))}
          className={buttonClass({ size: "lg", full: true })}
        >
          {pending ? "Saving…" : advance}
        </button>
      )}
      {message && (
        <p role="alert" className="text-body-sm text-danger">
          {message}
        </p>
      )}
      {whatsapp && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <span className="text-body-sm text-ink-secondary">WhatsApp message for this step</span>
          <p className="rounded-sm border border-border bg-surface px-3.5 py-3 text-body-sm text-ink">{whatsapp.text}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(whatsapp.text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className={buttonClass({ variant: "outline" })}
            >
              {copied ? <Check aria-hidden="true" size={16} strokeWidth={1.5} /> : <Copy aria-hidden="true" size={16} strokeWidth={1.5} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <a href={whatsapp.link} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "secondary" })}>
              <MessageCircle aria-hidden="true" size={16} strokeWidth={1.5} />
              Open WhatsApp
            </a>
          </div>
          <span aria-live="polite" className="sr-only">
            {copied ? "Message copied" : ""}
          </span>
          <span className="font-mono text-meta text-ink-muted">sent by hand from the business app</span>
        </div>
      )}
    </div>
  );
}

export function MarkPaidButton({ orderId, label }: { orderId: string; label: string }) {
  const { pending, message, run } = useAction();
  return (
    <span className="flex flex-col items-start gap-1">
      <button type="button" disabled={pending} onClick={() => run(() => markPaid(orderId))} className={buttonClass({ variant: "outline" })}>
        {label}
      </button>
      {message && <span className="text-body-sm text-danger">{message}</span>}
    </span>
  );
}

export function CancelOrderButton({ orderId, number }: { orderId: string; number: string }) {
  const { pending, message, run } = useAction();
  return (
    <span className="flex items-center gap-3">
      {message && (
        <span role="alert" className="text-body-sm text-danger">
          {message}
        </span>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm(`Cancel ${number}? Its devices go back in stock.`)) run(() => cancelOrder(orderId));
        }}
        className={buttonClass({ variant: "danger" })}
      >
        Cancel order
      </button>
    </span>
  );
}
