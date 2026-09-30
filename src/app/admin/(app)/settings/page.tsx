import type { Metadata } from "next";
import Link from "next/link";
import { AccountSecurity } from "@/components/admin/AccountSecurity";
import { DataRequests, RunRetention } from "@/components/admin/PrivacyTools";
import { Badge } from "@/components/admin/Badge";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Facts } from "@/components/admin/parts";
import {
  DeliveryRatesForm,
  NotificationsForm,
  settingsCard,
  settingsCardTitle,
  ShopSettingsForm,
} from "@/components/admin/SettingsForms";
import { accountDetails, setupQr } from "@/lib/admin/account";
import { requireAdmin } from "@/lib/admin/auth";
import { deviceName } from "@/lib/admin/device-name";
import { formatGhanaDate, formatGhanaDateTime } from "@/lib/dates";
import { deliveryRateRegions } from "@/lib/ghana";
import { formatCedis } from "@/lib/orders";
import { emailConfigured, notificationSettings } from "@/lib/notify";
import { onlinePayments } from "@/lib/payments";
import { lastRetentionRun } from "@/lib/retention";
import { CONSULTATION_MONTHS, LOGIN_EVENT_MONTHS, ORDER_YEARS, REFERRAL_DAYS, WAITLIST_MONTHS_AFTER_LAUNCH } from "@/lib/retention-rules";
import { business } from "@/lib/site";
import { cn } from "@/lib/cn";
import { getDeliveryRates, getShopSettings } from "@/lib/shop";
import { totpUri } from "@/lib/admin/totp";

export const metadata: Metadata = { title: "Settings" };

const cedisInput = (pesewas: number | null | undefined) =>
  pesewas === null || pesewas === undefined ? "" : String(pesewas / 100);

const outcomeBadge = {
  success: <Badge tone="done">Signed in</Badge>,
  failed: <Badge tone="problem">Failed</Badge>,
  locked: <Badge tone="todo">Locked out</Badge>,
} as Record<string, React.ReactNode>;


const tabs = [
  { id: "shop", label: "Shop" },
  { id: "delivery", label: "Delivery fees" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy" },
  { id: "account", label: "Account" },
  { id: "history", label: "Login history" },
  { id: "payments", label: "Payments" },
  { id: "business", label: "Business" },
] as const;

type Tab = (typeof tabs)[number]["id"];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await requireAdmin();
  const requested = (await searchParams).tab;
  const tab: Tab = tabs.find((t) => t.id === requested)?.id ?? "shop";
  const [shop, rates, account, notify] = await Promise.all([
    getShopSettings(),
    getDeliveryRates(),
    accountDetails(session.id),
    notificationSettings(),
  ]);
  const { admin, sessionCount, history } = account;
  const online = onlinePayments();
  const setup =
    tab === "account" && admin.pendingTotpSecret
      ? {
          qrSvg: await setupQr(totpUri(admin.pendingTotpSecret, admin.email)),
          key: admin.pendingTotpSecret.match(/.{1,4}/g)!.join(" "),
        }
      : null;

  return (
    <>
      <AdminHeader title="Settings" />
      <div className="flex flex-col gap-6 px-gutter py-6">
        <nav aria-label="Settings" className="-mx-gutter overflow-x-auto border-b border-border px-gutter">
          <ul className="flex gap-1">
            {tabs.map((t) => (
              <li key={t.id}>
                <Link
                  href={t.id === "shop" ? "/admin/settings" : `/admin/settings?tab=${t.id}`}
                  aria-current={t.id === tab ? "page" : undefined}
                  className={cn(
                    "-mb-px flex h-11 items-center border-b-2 px-3 text-body-sm whitespace-nowrap",
                    t.id === tab
                      ? "border-primary font-medium text-heading"
                      : "border-transparent text-ink-secondary hover:text-ink",
                  )}
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="max-w-3xl">
          {tab === "shop" && (
            <>
              <ShopSettingsForm
                threshold={cedisInput(shop.freeDeliveryThresholdPesewas)}
                minBattery={shop.minBatteryHealth}
                categories={shop.categories}
              />
            </>
          )}
          {tab === "delivery" && (
            <>
              <DeliveryRatesForm
                regions={[...deliveryRateRegions]}
                rates={deliveryRateRegions.map((region) => cedisInput(rates[region]))}
                freeOver={formatCedis(shop.freeDeliveryThresholdPesewas)}
              />
            </>
          )}
          {tab === "notifications" && (
            <NotificationsForm
              accountEmail={admin.email}
              notifyEmail={notify.custom}
              on={{ orders: notify.orders, consultations: notify.consultations, waitlists: notify.waitlists }}
              connected={emailConfigured()}
            />
          )}
          {tab === "privacy" && <PrivacyTab />}
          {tab === "account" && (
            <>
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
            </>
          )}
          {tab === "history" && (
            <>
              <section aria-labelledby="history-title" className={settingsCard}>
                <div className="flex flex-col gap-1.5">
                  <h2 id="history-title" className={settingsCardTitle}>
                    Login history
                  </h2>
                  <p className="text-body-sm text-ink-secondary">
                    Recent attempts, including failed ones. Five failures from one address within 15 minutes, or 20 in
                    all, pause sign-in.
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
                            <td className="px-3 py-3 sm:px-4 text-body-sm text-ink">
                              {formatGhanaDateTime(event.createdAt)}
                            </td>
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
            </>
          )}
          {tab === "payments" && (
            <>
              <section aria-labelledby="payments-title" className={settingsCard}>
                <div className="flex flex-col gap-1.5">
                  <h2 id="payments-title" className={settingsCardTitle}>
                    Payments
                  </h2>
                  <p className="text-body-sm text-ink-secondary">
                    Checkout and every page that mentions payment offer only what&rsquo;s on. Online payments switch on
                    once each provider&rsquo;s account is connected.
                  </p>
                </div>
                <Facts
                  rows={[
                    [
                      "MoMo",
                      <PaymentState key="momo" on={online.momo} detail="MTN MoMo and Telecel Cash, through Hubtel" />,
                    ],
                    [
                      "Card",
                      <PaymentState key="card" on={online.card} detail="Visa and Mastercard, through Paystack" />,
                    ],
                    ["On delivery", <PaymentState key="cod" on detail="Cash on delivery" />],
                    ["At pickup", <PaymentState key="pickup" on detail="Pay at the store when collecting" />],
                  ]}
                />
              </section>
            </>
          )}
          {tab === "business" && (
            <>
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
                    [
                      "WhatsApp",
                      `+${business.whatsappNumber}` === business.phoneE164
                        ? business.phoneDisplay
                        : `+${business.whatsappNumber}`,
                    ],
                    ["Location", business.city],
                    ["Hours", business.hours],
                    ["Legal line", business.legalLine],
                  ]}
                />
              </section>
            </>
          )}
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

const removedLabels: Record<string, string> = {
  referrerNumbers: "referrer numbers",
  consultations: "consultation requests",
  waitlistSignups: "waitlist signups",
  ordersAnonymised: "orders anonymised",
  loginEvents: "old sign-in records",
};

async function PrivacyTab() {
  const last = await lastRetentionRun();
  const removed = last ? Object.entries(last.removed).filter(([, n]) => n > 0) : [];
  return (
    <>
      <section aria-labelledby="retention-title" className={settingsCard}>
        <div className="flex flex-col gap-1.5">
          <h2 id="retention-title" className={settingsCardTitle}>
            Automatic deletion
          </h2>
          <p className="text-body-sm text-ink-secondary">
            Every night, what the Privacy page says we don&rsquo;t keep is deleted or anonymised.
          </p>
        </div>
        <Facts
          rows={[
            ["Referrers", `Number erased ${REFERRAL_DAYS} days after delivery, unless they agreed to stay in touch`],
            ["Consultations", `Deleted ${CONSULTATION_MONTHS} months after the last contact, unless Won`],
            ["Waitlists", `Deleted ${WAITLIST_MONTHS_AFTER_LAUNCH} months after the product goes Live`],
            ["Orders", `Name, phone, email and address removed after ${ORDER_YEARS} years (to confirm with the accountant)`],
            ["Sign-ins", `Kept ${LOGIN_EVENT_MONTHS} months for the login history`],
            ["CVs", "By email: delete from the inbox after 12 months"],
          ]}
        />
        <p className="text-body-sm text-ink-secondary">
          {last
            ? `Last run ${formatGhanaDateTime(last.ranAt)}: ${
                removed.length ? removed.map(([key, n]) => `${n} ${removedLabels[key] ?? key}`).join(", ") : "nothing was due"
              }.`
            : "Not run yet. It runs nightly once CRON_SECRET is set on the hosting."}
        </p>
        <RunRetention />
      </section>
      <section aria-labelledby="requests-title" className={settingsCard}>
        <div className="flex flex-col gap-1.5">
          <h2 id="requests-title" className={settingsCardTitle}>
            Requests about someone&rsquo;s details
          </h2>
          <p className="text-body-sm text-ink-secondary">
            When someone asks what we hold about them, or asks us to delete it (the Privacy page&rsquo;s &ldquo;Your
            rights&rdquo;), find them by phone number.
          </p>
        </div>
        <DataRequests />
      </section>
    </>
  );
}
