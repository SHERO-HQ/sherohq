export const STATUS_LABELS: Record<string, string> = {
  live: "Live",
  in_development: "In development",
  in_validation: "In validation",
  paused: "Paused",
};

export function statusLabel(status: string | null | undefined): string {
  return STATUS_LABELS[status ?? "live"] ?? "Live";
}
