"use client";

import { startTransition, useActionState } from "react";
import { saveRole, type SaveRoleState } from "@/app/admin/(app)/careers/actions";
import { adminCard } from "@/components/admin/parts";
import { TextArea, TextField } from "@/components/forms/fields";
import { buttonClass } from "@/components/ui/Button";

export function RoleEditor({
  id,
  initial,
  saved,
}: {
  id: string | null;
  initial: { title: string; description: string; howToApply: string; open: boolean };
  saved: boolean;
}) {
  const [state, action, pending] = useActionState<SaveRoleState, FormData>(saveRole.bind(null, id), { errors: {}, message: null });
  const e = state.errors;
  return (
    <form
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
      noValidate
      className={`${adminCard} max-w-3xl`}
    >
      {saved && !state.message && (
        <p role="status" className="rounded-sm bg-secondary-subtle px-4 py-3 text-body-sm text-secondary">
          Saved. The Careers page shows the change now.
        </p>
      )}
      {state.message && (
        <p role="alert" className="rounded-sm bg-danger-subtle px-4 py-3 text-body-sm text-danger">
          {state.message}
        </p>
      )}
      <TextField id="title" label="Role" defaultValue={initial.title} error={e.title} placeholder="Hardware technician" />
      <TextArea
        id="description"
        label="What the work is"
        defaultValue={initial.description}
        error={e.description}
        hint="A few plain sentences: what they'd do day to day, and what they need to know already."
      />
      <TextField
        id="howToApply"
        label="How to apply"
        defaultValue={initial.howToApply}
        error={e.howToApply}
        placeholder="Email your CV to hello@sherohq.com with the role in the subject."
      />
      <label className="flex items-center gap-2.5 text-body-sm text-ink">
        <input type="checkbox" name="open" defaultChecked={initial.open} className="size-4 accent-primary" />
        Open: listed on the Careers page
      </label>
      <button type="submit" disabled={pending} className={buttonClass({ className: "self-start" })}>
        {pending ? "Saving…" : "Save role"}
      </button>
    </form>
  );
}
