import type { Metadata } from "next";
import { AccountSecurity } from "@/components/admin/AccountSecurity";
import { Badge } from "@/components/admin/Badge";
import { AdminHeader } from "@/components/admin/AdminShell";
import { DeliveryRatesForm, settingsCard, settingsCardTitle, ShopSettingsForm } from "@/components/admin/SettingsForms";
import { accountDetails, setupQr } from "@/lib/admin/account";
import { requireAdmin } from "@/lib/admin/auth";
import { deviceName } from "@/lib/admin/device-name";
import { formatGhanaDate, formatGhanaDateTime } from "@/lib/dates";
import { deliveryRateRegions } from "@/lib/ghana";
import { formatCedis } from "@/lib/orders";
import { onlinePayments } from "@/lib/payments";
import { business } from "@/lib/site";
import { getDeliveryRates, getShopSettings } from "@/lib/shop";
import { totpUri } from "@/lib/admin/totp";

export const metadata: Metadata = { title: "Settings" };

const cedisInput = (pesewas: number | null | undefined) => (pesewas === null || pesewas === undefined ? "" : String(pesewas / 100));

const outcomeBadge = {
  success: <Badge tone="done">Signed in</Badge>,
  failed: <Badge tone="problem">Failed</Badge>,
  locked: <Badge tone="todo">Locked out</Badge>,
} as Record<string, React.ReactNode>;

function Facts({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="flex flex-col">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[7rem_1fr] gap-3 border-t border-border py-2.5">
          <dt className="font-mono text-meta text-ink-muted">{label}</dt>
          <dd className="text-body-sm break-words text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function SettingsPage() {
  const session = await requireAdmin();
  const [shop, rates, account] = await Promise.all([getShopSettings(), getDeliveryRates(), accountDetails(session.id)]);
  const { admin, sessionCount, history } = account;
  const online = onlinePayments();
  const setup = admin.pendingTotpSecret
    ? { qrSvg: await setupQr(totpUri(admin.pendingTotpSecret, admin.email)), key: admin.pendingTotpSecret.match(/.{1,4}/g)!.join(" ") }
    : null;

  return (
    <>
      <AdminHeader title="Settings" />
      <div className="grid items-start gap-6 px-gutter py-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="flex min-w-0 flex-col gap-6">
          <ShopSettingsForm
            threshold={cedisInput(shop.freeDeliveryThresholdPesewas)}
            minBattery={shop.minBatteryHealth}
            categories={shop.categories}
          />
          <DeliveryRatesForm
            regions={[...deliveryRateRegions]}
            rates={deliveryRateRegions.map((region) => cedisInput(rates[region]))}
            freeOver={formatCedis(shop.freeDeliveryThresholdPesewas)}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="account-title" className={settingsCard}>
            <h2 id="account-title" className={settingsCardTitle}>
              Account
            </h2>
            <AccountSecurity
              email={admin.email}
              twoFactorSince={admin.totpEnabledAt ? formatGhanaDate(admin.totpEnabledAt) : null}
              setup={setup}
              passwordChanged={
                admin.passwordChangedAt
                  ? `Changed ${formatGhanaDate(admin.passwordChangedAt)}`
                  : `Set ${formatGhanaDate(admin.createdAt)}, with the account`
              }
              recoveryLeft={admin.recoveryCodes.length}
              otherSessions={Math.max(0, sessionCount - 1)}
            />
          </section>

          <section aria-labelledby="history-title" className={settingsCard}>
            <div className="flex flex-col gap-1.5">
              <h2 id="history-title" className={settingsCardTitle}>
                Login history
              </h2>
              <p className="text-body-sm text-ink-secondary">
                Recent attempts, including failed ones. Five failures from one address within 15
                minutes, or 20 in all, pause sign-in.
              </p>
            </div>
            {history.length === 0 ? (
              <p className="text-body-sm text-ink-secondary">No sign-ins yet.</p>
            ) : (
              <div className="rounded-sm border border-border">
                <table className="w-full text-left">
                  <thead className="bg-surface font-mono text-meta text-ink-muted">
                    <tr>
                      <th scope="col" className="px-3 py-3 sm:px-4 font-normal">
                        when
                      </th>
                      <th scope="col" className="px-3 py-3 sm:px-4 font-normal">
                        device
                      </th>
                      <th scope="col" className="px-3 py-3 sm:px-4 font-normal">
                        result
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((event) => (
                      <tr key={event.id} className="border-t border-border align-top">
                        <td className="px-3 py-3 sm:px-4 text-body-sm text-ink">{formatGhanaDateTime(event.createdAt)}</td>
                        <td className="px-3 py-3 sm:px-4 text-body-sm text-ink">
                          {deviceName(event.userAgent)}
                          {event.ip && <span className="block font-mono text-meta text-ink-muted">{event.ip}</span>}
                        </td>
                        <td className="px-3 py-3 sm:px-4">{outcomeBadge[event.outcome] ?? event.outcome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section aria-labelledby="payments-title" className={settingsCard}>
            <div className="flex flex-col gap-1.5">
              <h2 id="payments-title" className={settingsCardTitle}>
                Payments
              </h2>
              <p className="text-body-sm text-ink-secondary">
                Checkout and every page that mentions payment offer only what&rsquo;s on. Online payments switch on once
                each provider&rsquo;s account is connected.
              </p>
            </div>
            <Facts
              rows={[
                ["MoMo", <PaymentState key="momo" on={online.momo} detail="MTN MoMo and Telecel Cash, through Hubtel" />],
                ["Card", <PaymentState key="card" on={online.card} detail="Visa and Mastercard, through Paystack" />],
                ["On delivery", <PaymentState key="cod" on detail="Cash on delivery" />],
                ["At pickup", <PaymentState key="pickup" on detail="Pay at the store when collecting" />],
              ]}
            />
          </section>

          <section aria-labelledby="business-title" className={settingsCard}>
            <div className="flex flex-col gap-1.5">
              <h2 id="business-title" className={settingsCardTitle}>
                Business
              </h2>
              <p className="text-body-sm text-ink-secondary">
                Shown on every page and in search results. Set in the site&rsquo;s code for now (src/lib/site.ts).
              </p>
            </div>
            <Facts
              rows={[
                ["Name", business.name],
                ["Email", business.email],
                ["Phone", business.phoneDisplay],
                ["WhatsApp", `+${business.whatsappNumber}` === business.phoneE164 ? business.phoneDisplay : `+${business.whatsappNumber}`],
                ["Location", business.city],
                ["Hours", business.hours],
                ["Legal line", business.legalLine],
              ]}
            />
          </section>
        </div>
      </div>
    </>
  );
}

function PaymentState({ on, detail }: { on: boolean; detail: string }) {
  return (
    <span className="flex items-start justify-between gap-3">
      <span className="min-w-0">{detail}</span>
      <Badge tone={on ? "done" : "none"}>{on ? "On" : "Not connected"}</Badge>
    </span>
  );
}
