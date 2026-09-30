"use client";

import { useState, useTransition } from "react";
import { Download, Search } from "lucide-react";
import {
  erasePhoneRecords,
  exportPhoneRecords,
  findRecords,
  runRetentionNow,
  type Found,
} from "@/app/admin/(app)/settings/privacy-actions";
import { TextField } from "@/components/forms/fields";
import { buttonClass } from "@/components/ui/Button";

const phoneForm = (phone: string) => {
  const form = new FormData();
  form.set("phone", phone);
  return form;
};

/** Find, export or remove everything held against a phone number. */
export function DataRequests() {
  const [phone, setPhone] = useState("");
  const [found, setFound] = useState<Found | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const find = () =>
    start(async () => {
      setMessage(null);
      const result = await findRecords(phoneForm(phone));
      if (result.ok) setFound(result.found);
      else {
        setFound(null);
        setMessage({ ok: false, text: result.message });
      }
    });

  return (
    <div className="flex flex-col gap-4">
      <form
        method="post"
        data-clarity-mask="True"
        onSubmit={(event) => {
          event.preventDefault();
          find();
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <TextField
          id="request-phone"
          label="Their phone number"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="w-64"
        />
        <button type="submit" disabled={pending} className={buttonClass({ size: "lg", variant: "outline" })}>
          <Search aria-hidden="true" size={16} strokeWidth={1.5} /> Find
        </button>
      </form>

      {found && (
        <div className="flex flex-col gap-3 rounded-sm border border-border p-4" data-clarity-mask="True">
          {found.total === 0 ? (
            <p className="text-body-sm text-ink">Nothing is held against {found.phone}.</p>
          ) : (
            <>
              <p className="text-body-sm text-ink">Held against {found.phone}:</p>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-body-sm text-ink">
                {found.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const result = await exportPhoneRecords(phoneForm(found.phone));
                      if (!result.ok) return setMessage({ ok: false, text: result.message });
                      const url = URL.createObjectURL(new Blob([result.json], { type: "application/json" }));
                      const a = Object.assign(document.createElement("a"), { href: url, download: "shero-your-data.json" });
                      a.click();
                      URL.revokeObjectURL(url);
                    })
                  }
                  className={buttonClass({ variant: "outline" })}
                >
                  <Download aria-hidden="true" size={16} strokeWidth={1.5} /> Export for them
                </button>
                <button
                  type="button"
                  disabled={pending || found.openOrders.length > 0}
                  onClick={() => {
                    if (!confirm(`Remove everything held against ${found.phone}? This can't be undone.`)) return;
                    start(async () => {
                      const result = await erasePhoneRecords(phoneForm(found.phone));
                      setMessage({ ok: result.ok, text: result.message });
                      if (result.ok) setFound(null);
                    });
                  }}
                  className={buttonClass({ variant: "danger" })}
                >
                  Remove their details
                </button>
              </div>
              {found.openOrders.length > 0 && (
                <p className="text-body-sm text-ink-secondary">
                  {found.openOrders.join(", ")} is still open. Deliver or cancel it before removing their details.
                </p>
              )}
              <p className="text-body-sm text-ink-secondary">
                Removing deletes their requests, waitlist places and testimonials, and erases referrer numbers. Orders
                stay for tax records with the name, phone, email and address removed.
              </p>
            </>
          )}
        </div>
      )}
      {message && (
        <p role={message.ok ? "status" : "alert"} className={message.ok ? "text-body-sm text-secondary" : "text-body-sm text-danger"}>
          {message.text}
        </p>
      )}
    </div>
  );
}

export function RunRetention() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  return (
    <span className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await runRetentionNow();
            setMessage(result.message);
          })
        }
        className={buttonClass({ variant: "outline" })}
      >
        {pending ? "Running…" : "Run it now"}
      </button>
      <span role="status" className="text-body-sm text-ink-secondary">
        {message ?? ""}
      </span>
    </span>
  );
}
