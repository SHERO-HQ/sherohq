import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteTestimonial } from "../actions";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Badge } from "@/components/admin/Badge";
import { DangerButton, WhatsAppMessage } from "@/components/admin/controls";
import { adminCard } from "@/components/admin/parts";
import { TestimonialEditor } from "@/components/admin/TestimonialEditor";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { requireAdmin } from "@/lib/admin/auth";
import { consentRequest } from "@/lib/admin/testimonial-form";
import { adminTestimonial, projectChoices } from "@/lib/admin/testimonials";
import { customerChatLink } from "@/lib/order-flow";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export const metadata: Metadata = { title: "Testimonial" };

export default async function TestimonialPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const [row, projects, { saved }] = await Promise.all([adminTestimonial(id), projectChoices(), searchParams]);
  if (!row) notFound();
  const { testimonial: t, orderNumber, orderPhone } = row;
  const ask = consentRequest(t.quote, t.attribution);

  return (
    <>
      <AdminHeader
        title={t.attribution}
        badge={<Badge tone={t.published ? "info" : "none"}>{t.published ? "Published" : "Not published"}</Badge>}
      />
      <div className="flex flex-col gap-5 px-gutter py-6">
        <Link href="/admin/testimonials" className="self-start text-label text-primary hover:underline">
          <InlineArrow direction="left" /> All testimonials
        </Link>
        {!t.consentGivenAt && (
          <div className={adminCard}>
            <WhatsAppMessage
              title={orderPhone ? "Ask their permission on WhatsApp" : "Ask their permission (copy and send it to them)"}
              text={ask}
              // Without a number, WhatsApp asks who to send it to.
              link={orderPhone ? customerChatLink(orderPhone, ask) : `https://wa.me/?text=${encodeURIComponent(ask)}`}
            />
          </div>
        )}
        <TestimonialEditor
          id={t.id}
          saved={saved === "1"}
          projects={projects}
          initial={{
            quote: t.quote,
            attribution: t.attribution,
            business: t.business ?? "",
            source: t.source,
            projectId: t.projectId ?? "",
            orderNumber: orderNumber ?? "",
            consent: Boolean(t.consentGivenAt),
            consentDate: t.consentGivenAt ? t.consentGivenAt.toISOString().slice(0, 10) : "",
            consentMethod: t.consentMethod ?? "",
            published: t.published,
          }}
        />
        <div className="border-t border-border pt-5">
          <DangerButton
            label="Delete testimonial"
            confirmText="Delete this testimonial? Do this if they withdraw consent."
            action={deleteTestimonial.bind(null, t.id)}
            after="/admin/testimonials"
          />
        </div>
      </div>
    </>
  );
}
