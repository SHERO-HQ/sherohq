import { mainNav } from "@/content/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-page">
      <Container className="relative flex h-16 items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden md:block">
          <NavLinks items={mainNav} />
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ButtonLink href="/contact" className="hidden md:inline-flex">
            Book a free consultation
          </ButtonLink>
          <MobileMenu items={mainNav} />
        </div>
      </Container>
    </header>
  );
}
