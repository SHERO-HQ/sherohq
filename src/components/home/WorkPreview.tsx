import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { WorkGrid } from "@/components/work/WorkGrid";
import { work } from "@/content/work";

export function WorkPreview() {
  return (
    <Section id="work" title="Live, with real clients" action={<TextLink href="/work">All work</TextLink>}>
      <WorkGrid items={work} />
    </Section>
  );
}
