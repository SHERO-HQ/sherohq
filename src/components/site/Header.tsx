import { mainNav, talkToUs } from "@/content/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-page">
      <Container className="relative flex h-16 items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden md:absolute md:left-1/2 md:block md:-translate-x-1/2">
          <NavLinks items={mainNav} />
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink href={talkToUs.href} className="hidden md:inline-flex">
            {talkToUs.label}
          </ButtonLink>
          <MobileMenu items={mainNav} cta={talkToUs} />
        </div>
      </Container>
    </header>
  );
}
