import Link from "next/link";
import { footerNav, legalNav } from "@/content/navigation";
import { site, whatsappLink } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { ThemeToggle } from "./ThemeToggle";

const linkClass =
  "inline-flex min-h-10 items-center text-sm text-ink-inverse hover:underline underline-offset-4";

export function Footer() {
  return (
    <footer className="bg-surface-inverse text-ink-inverse">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed logo artwork */}
          <img src="/brand/shero-light.svg" alt="SHERO" width={93} height={36} />
          <p className="mt-4 max-w-xs text-sm text-ink-inverse-muted">
            Technology that opens doors, not adds complexity. {site.motto}
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-4">
            {site.socials.map((s) => (
              <li key={s.name}>
                <a href={s.href} className={linkClass} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="font-mono text-xs text-ink-inverse-muted">{group.title}</p>
            <ul className="mt-4 space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <p className="font-mono text-xs text-ink-inverse-muted">Contact</p>
          <ul className="mt-4 space-y-1">
            <li>
              <a href={`mailto:${site.email}`} className={linkClass}>
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink()}
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {site.whatsapp.display}
              </a>
            </li>
            <li>
              <a
                href={site.mapLink}
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                {site.location}
              </a>
            </li>
            <li className="pt-1 text-sm text-ink-inverse-muted">
              {site.hours.days}, {site.hours.open}–{site.hours.close}
            </li>
          </ul>
        </div>
      </Container>
      <Container className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-ink-inverse-muted">
        <p>{site.legalLine}</p>
        <div className="flex flex-wrap items-center gap-4">
          <ThemeToggle className="-ml-3 text-xs text-ink-inverse-muted hover:bg-white/10 hover:text-ink-inverse" />
          <nav aria-label="Legal">
            <ul className="flex gap-4">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-10 items-center hover:text-ink-inverse hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
