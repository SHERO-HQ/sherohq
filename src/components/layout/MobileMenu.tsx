"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  Boxes,
  BriefcaseBusiness,
  ChevronRight,
  Info,
  Laptop,
  Layers,
  LifeBuoy,
  Mail,
  Phone,
  X,
  type LucideIcon,
} from "lucide-react";
import { buttonClass, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OpenNow } from "@/components/ui/LiveStatus";
import { Logo } from "@/components/ui/Logo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { business, routes, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/cn";

type Item = { label: string; href: string; icon: LucideIcon; children?: Array<{ label: string; href: string }> };

const items: Item[] = [
  { label: "Services", href: routes.services, icon: Layers },
  { label: "Shop", href: routes.shop, icon: Laptop },
  {
    label: "Products",
    href: routes.products,
    icon: Boxes,
    children: [
      { label: "Merchander", href: routes.merchander },
      { label: "Pharmasyst", href: routes.pharmasyst },
    ],
  },
  { label: "Work", href: routes.work, icon: BriefcaseBusiness },
  { label: "About", href: routes.about, icon: Info },
  { label: "Support", href: routes.support, icon: LifeBuoy },
];

function isCurrent(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The phone menu: a full-screen dialog. Escape closes it, Tab stays inside it,
 * and focus goes back to the menu button when it closes.
 */
export function MobileMenu({
  pathname,
  onClose,
  returnFocusTo,
}: {
  pathname: string;
  onClose: () => void;
  returnFocusTo: React.RefObject<HTMLButtonElement | null>;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = returnFocusTo.current;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;
      const focusable = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, [onClose, returnFocusTo]);

  return (
    <div
      ref={panel}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="animate-menu-in fixed inset-0 z-50 flex flex-col overflow-y-auto bg-page lg:hidden"
    >
      <div className="container-site flex h-16 shrink-0 items-center justify-between border-b border-border">
        <Link href={routes.home} onClick={onClose} aria-label="SHERO home" className="rounded-sm">
          <Logo className="h-6 w-auto" />
        </Link>
        <div className="-mr-3 flex items-center">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            autoFocus
            className="flex size-11 items-center justify-center rounded-sm text-ink"
          >
            <X size={22} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav aria-label="Main" className="container-site pt-4">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const current = isCurrent(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "-mx-3 flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-surface",
                    current && "bg-surface",
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-raised text-primary">
                    <item.icon aria-hidden="true" size={18} strokeWidth={1.5} />
                  </span>
                  <span className={cn("flex-1 text-body-lg font-semibold", current ? "text-primary" : "text-heading")}>
                    {item.label}
                  </span>
                  <ChevronRight aria-hidden="true" size={18} strokeWidth={1.5} className="text-ink-muted" />
                </Link>
                {item.children && (
                  <ul className="mb-1 ml-9 flex flex-col border-l border-border pl-4">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={onClose}
                          aria-current={isCurrent(pathname, child.href) ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-2 py-2 text-body hover:text-primary",
                            isCurrent(pathname, child.href) ? "text-primary" : "text-ink-secondary",
                          )}
                        >
                          {child.label}
                          <StatusBadge status="dev" size="sm" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="container-site flex flex-col gap-3 pt-6">
        <Link href={routes.consultation} onClick={onClose} className={buttonClass({ size: "lg", full: true })}>
          Book a free consultation
        </Link>
        <Link
          href={routes.track}
          onClick={onClose}
          className={buttonClass({ variant: "outline", size: "lg", full: true })}
        >
          Track an order
        </Link>
      </div>

      <div className="container-site mt-auto pt-8 pb-6">
        <Card className="gap-3 p-4">
          <OpenNow fallback={business.hours} className="text-body-sm font-medium text-ink" />
          <div className="flex flex-col gap-1 text-body-sm">
            <a href={`tel:${business.phoneE164}`} className="flex items-center gap-2 py-1 text-ink-secondary hover:text-primary">
              <Phone aria-hidden="true" size={16} strokeWidth={1.5} />
              {business.phoneDisplay}
            </a>
            <a href={`mailto:${business.email}`} className="flex items-center gap-2 py-1 text-ink-secondary hover:text-primary">
              <Mail aria-hidden="true" size={16} strokeWidth={1.5} />
              {business.email}
            </a>
          </div>
          <ButtonLink href={whatsappLink("Hi SHERO")} variant="secondary" external full>
            Chat on WhatsApp
          </ButtonLink>
        </Card>
      </div>
    </div>
  );
}
