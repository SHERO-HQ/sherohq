"use client";

import { removeSignup, setSignupStatus } from "@/app/admin/(app)/waitlists/actions";
import { ActionError, useAdminAction } from "@/components/admin/controls";
import { waitlistStepOptions } from "@/lib/admin/waitlist-steps";

/** Each signup's step, saved as soon as it changes. */
export function SignupStatus({ id, status, name }: { id: string; status: string; name: string }) {
  const { pending, message, run } = useAdminAction();
  return (
    <span className="flex flex-col gap-1">
      <select
        aria-label={`Status for ${name}`}
        defaultValue={status}
        disabled={pending}
        onChange={(event) => run(() => setSignupStatus(id, event.target.value))}
        className="h-9 rounded-sm border border-border-strong bg-surface-raised px-2.5 text-body-sm text-ink"
      >
        {waitlistStepOptions.map((step) => (
          <option key={step.value} value={step.value}>
            {step.label}
          </option>
        ))}
      </select>
      <ActionError message={message} />
    </span>
  );
}

export function RemoveSignup({ id, name }: { id: string; name: string }) {
  const { pending, message, run } = useAdminAction();
  return (
    <span className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => confirm(`Remove ${name} from the list? Do this when they ask to leave.`) && run(() => removeSignup(id))}
        className="text-body-sm text-ink-secondary hover:text-danger hover:underline"
      >
        Remove
      </button>
      <ActionError message={message} />
    </span>
  );
}
