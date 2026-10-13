import type { Metadata } from "next";
import { ClosingCta } from "@/components/site/ClosingCta";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { WorkList } from "@/components/ui/WorkList";
import { work } from "@/content/work";

export const metadata: Metadata = {
  title: "Work",
  description: "Production work SHERO has delivered for clients, shown with their permission.",
};

export default function WorkPage() {
  return (
    <>
      <PageHeader
        eyebrow="work"
        title="Work in production"
        intro="Projects that are live and in use today, shown with our clients' permission."
      />
      <Container className="py-14 sm:py-20">
        <WorkList items={work} />
      </Container>
      <ClosingCta />
    </>
  );
}
