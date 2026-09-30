// Waitlist steps (docs/admin-scope.md, section 5). Shared by the page and its controls.
export const waitlistStepOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "invited", label: "Invited to pilot" },
  { value: "piloting", label: "Piloting" },
] as const;

export type WaitlistStatus = (typeof waitlistStepOptions)[number]["value"];

export const isWaitlistStatus = (value: string): value is WaitlistStatus =>
  waitlistStepOptions.some((s) => s.value === value);
