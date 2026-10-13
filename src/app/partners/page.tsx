import type { Metadata } from "next";
import { ContactOptions } from "@/components/site/ContactOptions";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Partners" };

export default function Page() {
  return (
    <>
      <PageHeader title="Partner with SHERO" intro="[How SHERO works with partners, from SHERO]" />
      <Container className="py-14 sm:py-20">
        <ContactOptions message="Hi SHERO, I'd like to talk about a partnership." subject="Partners" />
      </Container>
    </>
  );
}
