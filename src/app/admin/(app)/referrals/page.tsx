import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Badge, type BadgeTone } from "@/components/admin/Badge";
import { tableHead, td, th } from "@/components/admin/parts";
import { ReferralActions } from "@/components/admin/ReferralControls";
import { requireAdmin } from "@/lib/admin/auth";
import {
  daysLeft,
  REFERRAL_DAYS,
  referralDeletesOn,
  referralSteps,
  referrerMessage,
  thankedSummary,
  type ReferralStatus,
} from "@/lib/admin/referral-flow";
import { adminReferrals } from "@/lib/admin/referrals";
import { formatGhanaDate } from "@/lib/dates";
import { customerChatLink, maskPhone } from "@/lib/order-flow";

export const metadata: Metadata = { title: "Referrals" };

const tone: Record<ReferralStatus, BadgeTone> = {
  waiting_for_delivery: "none",
  ready_to_thank: "todo",
  thanked: "info",
  asked_to_stay: "info",
  kept: "done",
  deleted: "none",
};

export default async function ReferralsPage() {
  await requireAdmin();
  const rows = await adminReferrals();
  const now = new Date();
  const toThank = rows.filter((r) => r.referral.status === "ready_to_thank").length;
  const soonest = rows
    .filter((r) => ["ready_to_thank", "thanked", "asked_to_stay"].includes(r.referral.status) && r.arrivedAt)
    .map((r) => daysLeft(referralDeletesOn(r.arrivedAt)!, now))
    .sort((a, b) => a - b)[0];

  return (
    <>
      <AdminHeader title="Referrals" meta={toThank > 0 ? `${toThank} to thank` : undefined} />
      <div className="flex flex-col gap-5 px-gutter py-6">
        <p className="max-w-measure text-body-sm text-ink-secondary">
          Numbers are deleted automatically {REFERRAL_DAYS} days after delivery unless the referrer agrees to stay in touch.
          {soonest !== undefined && ` The next is deleted in ${soonest} ${soonest === 1 ? "day" : "days"}.`} The
          thank-you message never names the buyer or promises a reward.
        </p>
        {rows.length === 0 ? (
          <p className="py-8 text-body text-ink-secondary">No referrals yet. They appear when a buyer gives a referrer&rsquo;s number at checkout.</p>
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-left">
              <thead className={tableHead}>
                <tr>
                  <th scope="col" className={th}>referrer</th>
                  <th scope="col" className={`${th} hidden sm:table-cell`}>order</th>
                  <th scope="col" className={`${th} hidden md:table-cell`}>what happened</th>
                  <th scope="col" className={th}>step</th>
                  <th scope="col" className={th}>action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ referral, orderId, number, arrivedAt, orderStatus }) => {
                  const status = referral.status as ReferralStatus;
                  const deletesOn = referralDeletesOn(arrivedAt);
                  const happened =
                    status === "waiting_for_delivery"
                      ? orderStatus === "cancelled"
                        ? "Order cancelled"
                        : "Order not delivered yet"
                      : status === "ready_to_thank"
                        ? `Delivered ${formatGhanaDate(arrivedAt!)}`
                        : status === "kept"
                          ? `${thankedSummary(referral.tokenType, referral.tokenAmountPesewas)} · agreed ${formatGhanaDate(referral.resolvedAt!)}`
                          : status === "deleted"
                            ? "Number deleted, count kept"
                            : thankedSummary(referral.tokenType, referral.tokenAmountPesewas);
                  return (
                    <tr key={referral.id} className="border-t border-border align-top">
                      <td className={`${td} font-mono whitespace-nowrap`}>
                        {referral.referrerPhone ? maskPhone(referral.referrerPhone) : "deleted"}
                      </td>
                      <td className={`${td} hidden sm:table-cell`}>
                        <Link href={`/admin/orders/${orderId}`} className="font-mono text-heading hover:underline">
                          {number}
                        </Link>
                      </td>
                      <td className={`${td} hidden md:table-cell`}>
                        {happened}
                        {deletesOn && ["ready_to_thank", "thanked", "asked_to_stay"].includes(status) && (
                          <span className="block text-meta text-ink-muted">
                            deleted in {daysLeft(deletesOn, now)} days unless kept
                          </span>
                        )}
                      </td>
                      <td className={td}>
                        <Badge tone={tone[status]}>{referralSteps[status]}</Badge>
                      </td>
                      <td className={td}>
                        {status === "waiting_for_delivery" || status === "deleted" ? (
                          <span className="text-ink-muted">–</span>
                        ) : (
                          <ReferralActions
                            id={referral.id}
                            status={status}
                            chatLink={referral.referrerPhone ? customerChatLink(referral.referrerPhone, referrerMessage()) : null}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
