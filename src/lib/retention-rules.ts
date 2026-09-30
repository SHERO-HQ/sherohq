// How long SHERO keeps personal details (docs/admin-scope.md, "Retention
// periods (agreed)", and the Privacy page). Pure cut-off dates, tested; the
// daily job in retention.ts applies them.

const DAY = 24 * 60 * 60 * 1000;

// TODO(owner): the accountant to confirm the 6 years (also on the Privacy page).
export const ORDER_YEARS = 6;
export const CONSULTATION_MONTHS = 12;
export const WAITLIST_MONTHS_AFTER_LAUNCH = 6;
export const REFERRAL_DAYS = 30;
/** Sign-in attempts hold IP addresses; kept a year for the login history. */
export const LOGIN_EVENT_MONTHS = 12;

const monthsBefore = (now: Date, months: number) => {
  const d = new Date(now);
  d.setUTCMonth(d.getUTCMonth() - months);
  return d;
};

export function cutoffs(now: Date) {
  return {
    /** Orders placed before this are anonymised: name, phone, email and address removed, amounts kept. */
    orders: monthsBefore(now, ORDER_YEARS * 12),
    /** Requests last contacted (or received) before this are deleted, unless the work went ahead. */
    consultations: monthsBefore(now, CONSULTATION_MONTHS),
    /** Waitlists of products launched before this are deleted. */
    waitlistLaunch: monthsBefore(now, WAITLIST_MONTHS_AFTER_LAUNCH),
    /** Referrer numbers for orders that arrived before this are erased, unless kept. */
    referralArrival: new Date(now.getTime() - REFERRAL_DAYS * DAY),
    loginEvents: monthsBefore(now, LOGIN_EVENT_MONTHS),
  };
}
