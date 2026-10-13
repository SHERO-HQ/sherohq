import type { Metadata } from "next";
import { ContactOptions } from "@/components/site/ContactOptions";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help from SHERO with software, IT or hardware we've provided.",
};

const include = [
  "Your name and business",
  "What you were trying to do",
  "What happened instead, with a screenshot or photo if you can",
  "How urgent it is",
];

export default function SupportPage() {
  return (
    <>
      <PageHeader
        title="Get help"
        intro={`Something not working with software, IT or hardware from SHERO? Message us and a real person will help, ${site.hours.long}.`}
      />
      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1.6fr]">
        <section aria-labelledby="include">
          <h2 id="include" className="text-2xl">To help us help you faster, include</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-secondary marker:text-accent">
            {include.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </section>
        <ContactOptions message="Hi SHERO, I need support with:" subject="Support request" />
      </Container>
    </>
  );
}
