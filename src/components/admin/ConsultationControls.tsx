"use client";

import { deleteConsultation, saveConsultationNotes, setConsultationStatus } from "@/app/admin/(app)/consultations/actions";
import { ActionError, DangerButton, NotesForm, StepPicker, useAdminAction } from "@/components/admin/controls";
import { consultationSteps } from "@/lib/admin/consultation-flow";

export function ConsultationStatus({ id, status }: { id: string; status: string }) {
  const { pending, message, run } = useAdminAction();
  return (
    <div className="flex flex-col gap-2">
      <StepPicker
        label="Status"
        steps={consultationSteps}
        value={status}
        disabled={pending}
        onPick={(next) => run(() => setConsultationStatus(id, next))}
      />
      <ActionError message={message} />
    </div>
  );
}

export function ConsultationNotes({ id, notes }: { id: string; notes: string }) {
  return (
    <NotesForm
      id="notes"
      label="Private notes"
      hint="Only you see these: what was agreed, the quote, when to follow up."
      initial={notes}
      save={(value) => saveConsultationNotes(id, value)}
    />
  );
}

export function DeleteConsultation({ id, name }: { id: string; name: string }) {
  return (
    <DangerButton
      label="Delete request"
      confirmText={`Delete ${name}'s request and notes? Do this when they ask for their details to be removed.`}
      action={() => deleteConsultation(id)}
      after="/admin/consultations"
    />
  );
}
