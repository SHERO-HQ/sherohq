import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { WorkList } from "@/components/ui/WorkList";
import { work } from "@/content/work";

export function WorkPreview() {
  return (
    <Section
      id="work"
      eyebrow="work"
      title="Live, with real clients"
      action={<TextLink href="/work">All work</TextLink>}
    >
      <WorkList items={work} />
    </Section>
  );
}
