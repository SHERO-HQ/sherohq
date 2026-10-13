import type { Metadata } from "next";
import { ContactOptions } from "@/components/site/ContactOptions";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Careers" };

export default function Page() {
  return (
    <>
      <PageHeader title="Work with SHERO" intro="[Open roles and how to apply, from SHERO]" />
      <Container className="py-14 sm:py-20">
        <ContactOptions message="Hi SHERO, I'd like to ask about working with you." subject="Careers" />
      </Container>
    </>
  );
}
