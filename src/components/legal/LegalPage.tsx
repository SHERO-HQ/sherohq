import Link from "next/link";
import { Fill } from "@/components/ui/Fill";
import { type Content } from "@/lib/content";
import { routes } from "@/lib/site";
import { cn } from "@/lib/cn";

export type LegalSection = { id: string; title: string; body: React.ReactNode };

const tabs = [
  { label: "Terms", href: routes.terms },
  { label: "Privacy", href: routes.privacy },
  { label: "Cookies", href: routes.cookies },
];

const pad = (n: number) => String(n).padStart(2, "0");

/** Shared layout for Terms, Privacy and Cookies. */
export function LegalPage({
  title,
  current,
  updated,
  intro,
  sections,
}: {
  title: string;
  current: string;
  updated: Content;
  intro: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <>
      <section className="container-site flex flex-col gap-4 pt-8 lg:gap-5 lg:pt-20">
        <h1 className="font-display text-[40px]/[42px] font-bold tracking-[-0.03em] text-heading lg:text-[64px]/[66px] lg:tracking-[-0.035em]">
          {title}
        </h1>
        <span className="font-mono text-[13px]/[17px] text-ink-secondary">
          last updated <Fill value={updated} scale={1} /> · [review with a lawyer before publishing]
        </span>
        <nav aria-label="Legal pages" className="mt-2 flex gap-8 border-b border-border lg:mt-4">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={tab.href === current ? "page" : undefined}
              className={cn(
                "-mb-px py-3 text-[15px]/5 font-medium",
                tab.href === current ? "border-b-2 border-accent text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </section>

      <section className="container-site grid gap-8 pt-8 pb-16 lg:grid-cols-[260px_1fr] lg:gap-20 lg:pt-12 lg:pb-[104px]">
        <nav aria-label="On this page" className="hidden self-start lg:sticky lg:top-28 lg:flex lg:flex-col">
          <span className="mb-2.5 font-mono text-xs/4 font-medium text-ink-secondary">on this page</span>
          {sections.map((section, i) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex gap-3 py-[9px] text-sm/5 text-ink-secondary hover:text-primary"
            >
              <span className="font-mono text-xs/5 text-ink-muted">{pad(i + 1)}</span>
              {section.title}
            </a>
          ))}
        </nav>

        <div className="flex flex-col">
          <div className="max-w-[720px] pb-6 text-lg/7 text-ink lg:text-xl/[31px]">{intro}</div>
          {sections.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="flex scroll-mt-24 flex-col gap-3 border-t border-border py-7 lg:py-8"
            >
              <h2 id={`${section.id}-title`} className="font-display text-[21px]/7 font-semibold text-heading lg:text-2xl/[30px]">
                <span className="mr-3.5 font-mono text-sm/[30px] font-normal text-ink-muted">{pad(i + 1)}</span>
                {section.title}
              </h2>
              <div className="flex max-w-[680px] flex-col gap-3 text-base/[26px] text-ink lg:text-[17px]/7">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
