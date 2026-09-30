"use client";

import { useState } from "react";
import { deleteReferrer, keepReferrer, markAsked, markThanked } from "@/app/admin/(app)/referrals/actions";
import { ActionError, useAdminAction } from "@/components/admin/controls";
import { buttonClass } from "@/components/ui/Button";

const small = "h-9 rounded-sm border border-border-strong bg-surface-raised px-2.5 text-body-sm text-ink placeholder:text-ink-muted";

export function ReferralActions({ id, status, chatLink }: { id: string; status: string; chatLink: string | null }) {
  const { pending, message, run } = useAdminAction();
  const [thanking, setThanking] = useState(false);

  return (
    <div className="flex flex-col items-start gap-2">
      {status === "ready_to_thank" && !thanking && (
        <div className="flex flex-wrap gap-2">
          {chatLink && (
            <a href={chatLink} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "secondary" })}>
              Open WhatsApp
            </a>
          )}
          <button type="button" onClick={() => setThanking(true)} className={buttonClass()}>
            Mark thanked
          </button>
        </div>
      )}
      {thanking && (
        <form
          method="post"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            run(() => markThanked(id, data), () => setThanking(false));
          }}
          className="flex flex-wrap items-end gap-2"
        >
          <label className="flex flex-col gap-1 text-body-sm text-ink">
            What you gave
            <input name="tokenType" placeholder="MoMo, airtime…" className={`${small} w-36`} />
          </label>
          <label className="flex flex-col gap-1 text-body-sm text-ink">
            GHS (optional)
            <input name="amount" inputMode="decimal" placeholder="50" className={`${small} w-24`} />
          </label>
          <button type="submit" disabled={pending} className={buttonClass()}>
            Save
          </button>
          <button type="button" onClick={() => setThanking(false)} className="h-9 px-2 text-body-sm text-ink-secondary">
            Cancel
          </button>
        </form>
      )}
      {status === "thanked" && (
        <button type="button" disabled={pending} onClick={() => run(() => markAsked(id))} className={buttonClass({ variant: "outline" })}>
          Asked to stay in touch
        </button>
      )}
      {!thanking && status !== "waiting_for_delivery" && status !== "deleted" && (
        <div className="flex flex-wrap gap-2">
          {(status === "asked_to_stay" || status === "thanked") && (
            <button type="button" disabled={pending} onClick={() => run(() => keepReferrer(id))} className={buttonClass({ variant: "outline" })}>
              Keep
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => confirm("Delete this number? Only the count stays.") && run(() => deleteReferrer(id))}
            className={status === "kept" ? "h-9 text-body-sm text-ink-secondary hover:text-danger hover:underline" : buttonClass({ variant: "danger" })}
          >
            {status === "kept" ? "Delete number" : "Delete"}
          </button>
        </div>
      )}
      <ActionError message={message} />
    </div>
  );
}
