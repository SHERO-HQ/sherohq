import Link from "next/link";
import { footerNav } from "@/content/navigation";
import { site, whatsappLink } from "@/content/site";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="bg-surface-inverse text-ink-inverse">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed logo artwork */}
          <img src="/brand/shero-ondark.svg" alt="SHERO" width={93} height={36} />
          <p className="mt-4 max-w-xs text-sm text-ink-inverse-muted">
            {site.location}. {site.hours.days}, {site.hours.open}–{site.hours.close}.
          </p>
          <p className="mt-2 text-sm">
            <a href={whatsappLink()} className="text-ink-inverse underline underline-offset-4 hover:no-underline">
              WhatsApp {site.whatsapp.display}
            </a>
          </p>
          <p className="mt-1 text-sm">
            <a href={`mailto:${site.email}`} className="text-ink-inverse underline underline-offset-4 hover:no-underline">
              {site.email}
            </a>
          </p>
        </div>
        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="font-mono text-xs text-ink-inverse-muted">{group.title}</p>
            <ul className="mt-4 space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex min-h-10 items-center text-sm text-ink-inverse hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <Container className="flex flex-wrap justify-between gap-4 border-t border-white/10 py-6 text-xs text-ink-inverse-muted">
        <p>{site.legalLine}</p>
        <p>
          © {new Date().getFullYear()} SHERO · {site.motto}
        </p>
      </Container>
    </footer>
  );
}
