import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Cookie policy" };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="legal" title="Cookie policy" />
      <Container className="max-w-measure py-14 sm:py-20">
        <p className="text-ink-secondary">[Cookie policy text, from SHERO]</p>
        <p className="mt-6 text-ink-secondary">
          Questions? Email{" "}
          <a href={`mailto:${site.email}`} className="text-link underline underline-offset-4">
            {site.email}
          </a>
          .
        </p>
      </Container>
    </>
  );
}
