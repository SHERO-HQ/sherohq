// Referrals (docs/admin-scope.md, section 6). A referrer's number is kept only
// until they're thanked and asked to stay in touch: at most 30 days after the
// order arrives, unless they agree. Pure, so it's tested.
import { formatCedis } from "@/lib/orders";
import { REFERRAL_DAYS } from "@/lib/retention-rules";

export { REFERRAL_DAYS };
const DAY = 24 * 60 * 60 * 1000;

export const referralSteps = {
  waiting_for_delivery: "Waiting",
  ready_to_thank: "Ready to thank",
  thanked: "Thanked",
  asked_to_stay: "Asked to stay in touch",
  kept: "Kept",
  deleted: "Deleted",
} as const;

export type ReferralStatus = keyof typeof referralSteps;

/** When the number is erased if they haven't agreed to stay: 30 days after arrival. */
export function referralDeletesOn(arrivedAt: Date | null): Date | null {
  return arrivedAt ? new Date(arrivedAt.getTime() + REFERRAL_DAYS * DAY) : null;
}

export function daysLeft(deletesOn: Date, now: Date): number {
  return Math.max(0, Math.ceil((deletesOn.getTime() - now.getTime()) / DAY));
}

/** The thank-you, which also asks whether to keep their number. Never names the buyer. */
export function referrerMessage(): string {
  return (
    "Hello, this is SHERO. Someone you told about us has bought from us and received their order. Thank you for " +
    "recommending us! We'd like to keep your number to let you know about new stock now and then. Is that okay? " +
    "If you'd rather not, just say so and we'll delete it."
  );
}

/** "Thanked · GHS 50 MoMo", "Thanked · airtime". */
export function thankedSummary(tokenType: string | null, amountPesewas: number | null): string {
  const parts = [amountPesewas ? formatCedis(amountPesewas) : null, tokenType].filter(Boolean);
  return parts.length ? `Thanked · ${parts.join(" ")}` : "Thanked";
}
