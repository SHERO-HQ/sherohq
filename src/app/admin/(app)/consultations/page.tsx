import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Badge, type BadgeTone } from "@/components/admin/Badge";
import { ConsultationNotes, ConsultationStatus, DeleteConsultation } from "@/components/admin/ConsultationControls";
import { WhatsAppMessage } from "@/components/admin/controls";
import { AdminTabs, adminCard, adminCardTitle, Facts } from "@/components/admin/parts";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { buttonClass } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin/auth";
import {
  consultationReply,
  consultationTabs,
  contactLabel,
  needLabel,
  stepLabel,
  type ConsultationStatus as Status,
} from "@/lib/admin/consultation-flow";
import { adminConsultation, adminConsultations, consultationCounts } from "@/lib/admin/consultations";
import { formatGhanaDateTime } from "@/lib/dates";
import { customerChatLink } from "@/lib/order-flow";
import { displayPhone } from "@/lib/phone";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Consultations" };

const tone: Record<Status, BadgeTone> = {
  new: "todo",
  contacted: "info",
  call_held: "info",
  quoted: "info",
  won: "done",
  closed: "none",
};

type Props = { searchParams: Promise<{ tab?: string; id?: string }> };

export default async function ConsultationsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const tab = consultationTabs.find((t) => t.value === params.tab)?.value ?? "open";
  const [rows, counts, selected] = await Promise.all([
    adminConsultations(tab),
    consultationCounts(),
    params.id ? adminConsultation(params.id) : null,
  ]);
  const hrefFor = (id: string) => `/admin/consultations?${tab === "open" ? "" : `tab=${tab}&`}id=${id}`;
  const fresh = rows.filter((r) => r.status === "new").length;

  return (
    <>
      <AdminHeader title="Consultations" meta={fresh > 0 ? `${fresh} new` : undefined} />
      <div className="flex flex-col gap-6 px-gutter py-6">
        <AdminTabs
          label="Filter consultations"
          tabs={consultationTabs.map((t) => ({
            href: t.value === "open" ? "/admin/consultations" : `/admin/consultations?tab=${t.value}`,
            label: t.label,
            count: counts[t.value],
            current: t.value === tab,
          }))}
        />
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <div className={cn(selected && "hidden lg:block")}>
            {rows.length === 0 ? (
              <p className="py-8 text-body text-ink-secondary">
                {tab === "open" ? "No open requests. New ones arrive from the consultation form." : "None yet."}
              </p>
            ) : (
              <ul className="flex flex-col overflow-hidden rounded-md border border-border">
                {rows.map((row) => (
                  <li key={row.id} className="border-t border-border first:border-t-0">
                    <Link
                      href={hrefFor(row.id)}
                      aria-current={row.id === selected?.id ? "page" : undefined}
                      className={cn(
                        "flex flex-col gap-1 px-4 py-3 hover:bg-surface",
                        row.id === selected?.id && "bg-surface",
                      )}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-body-sm font-medium text-heading">{row.name}</span>
                        <Badge tone={tone[row.status]}>{stepLabel(row.status)}</Badge>
                      </span>
                      <span className="text-body-sm text-ink-secondary">{needLabel(row.need)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selected ? (
            <section aria-labelledby="request-title" className={adminCard}>
              <Link href={tab === "open" ? "/admin/consultations" : `/admin/consultations?tab=${tab}`} className="text-label text-primary hover:underline lg:hidden">
                <InlineArrow direction="left" /> All requests
              </Link>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 id="request-title" className={adminCardTitle}>
                  {selected.name}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <a href={`tel:${selected.phone}`} className={buttonClass({ variant: "outline" })}>
                    <Phone aria-hidden="true" size={16} strokeWidth={1.5} /> Call
                  </a>
                  {selected.email && (
                    <a href={`mailto:${selected.email}`} className={buttonClass({ variant: "outline" })}>
                      <Mail aria-hidden="true" size={16} strokeWidth={1.5} /> Email
                    </a>
                  )}
                </div>
              </div>
              <Facts
                rows={[
                  ["needs", needLabel(selected.need)],
                  ["business", selected.business ?? "–"],
                  ["phone", displayPhone(selected.phone)],
                  ...(selected.email ? ([["email", selected.email]] as Array<[string, string]>) : []),
                  ["reach by", contactLabel(selected.contactMethod)],
                  ["received", formatGhanaDateTime(selected.createdAt)],
                  ...(selected.lastContactAt
                    ? ([["last contact", formatGhanaDateTime(selected.lastContactAt)]] as Array<[string, string]>)
                    : []),
                ]}
              />
              {selected.message && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-label text-ink">Their message</h3>
                  <p className="text-body whitespace-pre-line text-ink">{selected.message}</p>
                </div>
              )}
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <h3 className="text-label text-ink">Status</h3>
                <ConsultationStatus id={selected.id} status={selected.status} />
              </div>
              <div className="border-t border-border pt-4">
                <WhatsAppMessage
                  title="First reply on WhatsApp"
                  text={consultationReply(selected)}
                  link={customerChatLink(selected.phone, consultationReply(selected))}
                />
              </div>
              <div className="border-t border-border pt-4">
                <ConsultationNotes id={selected.id} notes={selected.notes ?? ""} />
              </div>
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <p className="text-body-sm text-ink-secondary">
                  Kept 12 months after the last contact unless the work goes ahead (Won), then deleted automatically.
                </p>
                <DeleteConsultation id={selected.id} name={selected.name} />
              </div>
            </section>
          ) : (
            rows.length > 0 && (
              <p className="hidden rounded-md border border-dashed border-border-strong px-5 py-8 text-body-sm text-ink-secondary lg:block">
                Choose a request to see it.
              </p>
            )
          )}
        </div>
      </div>
    </>
  );
}
