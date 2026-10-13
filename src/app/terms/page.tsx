import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Terms of use" };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="legal" title="Terms of use" />
      <Container className="max-w-measure py-14 sm:py-20">
        <p className="text-ink-secondary">[Terms of use text, from SHERO]</p>
        <p className="mt-6 text-ink-secondary">
          Questions? Email{" "}
          <a href={`mailto:${site.email}`} className="text-primary underline underline-offset-4">
            {site.email}
          </a>
          .
        </p>
      </Container>
    </>
  );
}
