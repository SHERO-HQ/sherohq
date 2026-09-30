import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminShell";
import { TestimonialEditor } from "@/components/admin/TestimonialEditor";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { requireAdmin } from "@/lib/admin/auth";
import { projectChoices } from "@/lib/admin/testimonials";

export const metadata: Metadata = { title: "New testimonial" };

export default async function NewTestimonialPage() {
  await requireAdmin();
  const projects = await projectChoices();
  return (
    <>
      <AdminHeader title="New testimonial" />
      <div className="flex flex-col gap-5 px-gutter py-6">
        <Link href="/admin/testimonials" className="self-start text-label text-primary hover:underline">
          <InlineArrow direction="left" /> All testimonials
        </Link>
        <TestimonialEditor
          id={null}
          saved={false}
          projects={projects}
          initial={{
            quote: "",
            attribution: "",
            business: "",
            source: "project",
            projectId: "",
            orderNumber: "",
            consent: false,
            consentDate: "",
            consentMethod: "",
            published: false,
          }}
        />
      </div>
    </>
  );
}
