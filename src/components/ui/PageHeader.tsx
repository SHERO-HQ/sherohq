import type { ReactNode } from "react";
import { Container } from "./Container";
import { Eyebrow } from "./Eyebrow";

export function PageHeader({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: ReactNode; children?: ReactNode }) {
  return (
    <header className="border-b border-border py-14 sm:py-20">
      <Container>
        <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
        <h1 className="max-w-3xl text-4xl leading-[1.08] tracking-[-0.025em] sm:text-5xl">{title}</h1>
        {intro && <div className="mt-5 max-w-measure text-lg text-ink-secondary">{intro}</div>}
        {children}
      </Container>
    </header>
  );
}
