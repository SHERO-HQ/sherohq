import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Badge } from "@/components/admin/Badge";
import { buttonClass } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin/auth";
import { adminTestimonials } from "@/lib/admin/testimonials";
import { MIN_TESTIMONIALS } from "@/lib/testimonials";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  await requireAdmin();
  const rows = await adminTestimonials();
  const published = rows.filter((r) => r.testimonial.published).length;
  const needConsent = rows.filter((r) => !r.testimonial.consentGivenAt).length;

  return (
    <>
      <AdminHeader title="Testimonials" meta={needConsent > 0 ? `${needConsent} ${needConsent === 1 ? "needs" : "need"} consent` : undefined}>
        <Link href="/admin/testimonials/new" className={buttonClass()}>
          <Plus aria-hidden="true" size={18} strokeWidth={1.5} /> Add testimonial
        </Link>
      </AdminHeader>
      <div className="flex flex-col gap-5 px-gutter py-6">
        <p className="max-w-measure text-body-sm text-ink-secondary">
          {published >= MIN_TESTIMONIALS
            ? `${published} published: Home shows the newest three, and each case study shows its client's.`
            : `${published} of ${MIN_TESTIMONIALS} published. The site shows testimonials once ${MIN_TESTIMONIALS} are published.`}
        </p>
        {rows.length === 0 ? (
          <p className="py-8 text-body text-ink-secondary">None yet. Add one when a client or buyer says something you&rsquo;d like to share, then ask their permission.</p>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {rows.map(({ testimonial: t, projectName, orderNumber }) => (
              <li key={t.id}>
                <Link
                  href={`/admin/testimonials/${t.id}`}
                  className="flex h-full flex-col gap-4 rounded-md border border-border bg-surface-raised p-5 hover:border-border-strong"
                >
                  <p className="text-body text-ink">&ldquo;{t.quote}&rdquo;</p>
                  <span className="text-body-sm text-ink-secondary">
                    <span className="font-medium text-ink">{t.attribution}</span>
                    {t.business && `, ${t.business}`}
                    <span className="block">{t.source === "order" ? `Shop order ${orderNumber ?? ""}` : `Client project · ${projectName ?? "–"}`}</span>
                  </span>
                  <span className="mt-auto flex flex-wrap gap-2">
                    <Badge tone={t.consentGivenAt ? "done" : "todo"}>{t.consentGivenAt ? "Consent given" : "No consent yet"}</Badge>
                    <Badge tone={t.published ? "info" : "none"}>{t.published ? "Published" : "Not published"}</Badge>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
