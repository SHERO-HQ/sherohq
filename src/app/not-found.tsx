import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export default function NotFound() {
  return (
    <Container className="py-24 sm:py-32">
      <Eyebrow className="mb-4">404</Eyebrow>
      <h1 className="text-4xl tracking-[-0.025em] sm:text-5xl">This page doesn&apos;t exist.</h1>
      <p className="mt-4 max-w-measure text-lg text-ink-secondary">It may have moved when we rebuilt the site.</p>
      <ButtonLink href="/" className="mt-8">
        Back to the homepage
      </ButtonLink>
    </Container>
  );
}
