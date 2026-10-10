import NavLink from "@/components/common/NavLink";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Clock
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  TwitterXIcon
} from "@/assets/icons/icons";
import { COMPANY_EMAILS } from "@/constants/emails";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { SOCIAL_LINKS } from "@/constants/socials";
import PaymentIcons from "./PaymentIcons";
import FooterNewsletter from "./FooterNewsletter";
import { HiringBadge } from "@/components/common/HiringBadge";
import { SHOP_ENABLED } from "@/constants/features";
import { ThemeToggle3Button } from "./toggle-theme";

// Static Data
const companyLinks = SHOP_ENABLED
  ? ["Shop", "About Us", "Careers", "Contact Us"]
  : ["Solutions", "About Us", "Careers", "Contact Us"];

const allResourceLinks = [
  { label: "Consultation", href: "/consultation" },
  { label: "Partners", href: "/partners" },
  { label: "Support", href: "/support" },
  { label: "FAQ", href: "/faq" },
  { label: "Feedback", href: "/feedback" },
  { label: "Track Order", href: "/track" },
];

const resourceLinks = SHOP_ENABLED
  ? allResourceLinks
  : allResourceLinks.filter((link) => link.href !== "/track");

const socialLinks = [
  {
    name: "X (Twitter)",
    url: SOCIAL_LINKS.TWITTER,
    icon: TwitterXIcon
  },
  {
    name: "TikTok",
    url: SOCIAL_LINKS.TIKTOK,
    icon: TikTokIcon
  },
  {
    name: "Facebook",
    url: SOCIAL_LINKS.FACEBOOK,
    icon: FacebookIcon
  },
  {
    name: "Instagram",
    url: SOCIAL_LINKS.INSTAGRAM,
    icon: InstagramIcon
  },
];

const Footer = () => {
  return (
    <footer className="w-full bg-background relative overflow-hidden border-t border-border md:pb-8 py-10 transition-colors ">
      {/* Background Ambience */}
      <div className="absolute inset-0 hero-grid-pattern opacity-5 dark:opacity-20 transition-opacity " />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-10 lg:gap-x-12 lg:mb-12 mb-8">

          {/* Branding (Desktop Col 1, Row 1 | Mobile 1st) */}
          <div className="lg:col-span-4 lg:col-start-1 lg:row-start-1 order-1">
            <NavLink href={getAbsoluteUrl("/")} className="inline-block mb-3 shrink-0">
              <img
                src="/assets/logo/shero-light.svg"
                alt="Shero Logo"
                width={163}
                height={57}
                className="h-10 w-auto object-contain shrink-0 dark:block hidden"
                suppressHydrationWarning
              />
              <img
                src="/assets/logo/shero-dark.svg"
                alt="Shero Logo"
                width={163}
                height={57}
                className="h-10 w-auto object-contain shrink-0 dark:hidden block"
                suppressHydrationWarning
              />
            </NavLink>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md transition-colors ">
              Purposeful technology solutions built with clarity, reliability,
              and long-term value to redefine what&apos;s possible.
            </p>
          </div>

          {/* Navigation Links (Desktop Col 2, Row 1-2 | Mobile 2nd) */}
          <div className="lg:col-span-4 lg:col-start-5 lg:row-start-1 lg:row-span-2 order-2">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-foreground font-bold text-lg mb-4 flex items-center gap-2">
                  Company <Separator className="w-8 bg-border" />
                </h3>
                <ul className="space-y-1.5">
                  {companyLinks.map((link) => (
                    <li key={link}>
                      <NavLink
                        href={getAbsoluteUrl(
                          `/${link.toLowerCase().replace(" ", "-")}`,
                        )}
                        className="group flex items-center gap-2 text-muted-foreground hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors text-sm py-1"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition" />
                        {link}
                        {link === "Careers" && <HiringBadge />}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-foreground font-bold text-lg mb-4 flex items-center gap-2">
                  Resources <Separator className="w-8 bg-border" />
                </h3>
                <ul className="space-y-1.5">
                  {resourceLinks.map((link) => (
                    <li key={link.label}>
                      <NavLink
                        href={getAbsoluteUrl(link.href)}
                        className="group flex items-center gap-2 text-muted-foreground hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors text-sm py-1"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition" />
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Details (Desktop Col 1, Row 2 | Mobile 3rd) */}
          <div className="lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:mt-10 order-3">
            <h4 className="text-foreground font-bold mb-4 flex items-center gap-2">
              Contact Details <Separator className="w-10 bg-brand-secondary-500/50" />
            </h4>

            <div className="space-y-2.5">
              <a
                href={`mailto:${COMPANY_EMAILS.INFO}`}
                className="flex items-center gap-3 text-muted-foreground hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors group py-1"
              >
                <div className="p-1 rounded bg-muted border border-border group-hover:border-brand-secondary-500/50 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{COMPANY_EMAILS.INFO}</span>
              </a>

              <a
                href={`tel:${COMPANY_CONTACTS.WHATSAPP}`}
                className="flex items-center gap-3 text-muted-foreground hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors group py-1"
              >
                <div className="p-1 rounded bg-muted border border-border group-hover:border-brand-secondary-500/50 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{COMPANY_CONTACTS.PHONE_DISPLAY}</span>
              </a>

              <a
                href={COMPANY_CONTACTS.MAP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors group py-1"
              >
                <div className="p-1 rounded bg-muted border border-border group-hover:border-brand-secondary-500/50 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{COMPANY_CONTACTS.HQ_LOCATION}</span>
              </a>

              <div className="flex items-center gap-3 text-muted-foreground group py-1">
                <div className="p-1 rounded bg-muted border border-border group-hover:border-brand-secondary-500/50 transition-colors">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{COMPANY_CONTACTS.WORKING_HOURS}</span>
              </div>
            </div>
          </div>

          {/* Socials / Connect (Desktop Col 3, Row 1 | Mobile 4th) */}
          <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1 order-4">
            <h3 className="text-foreground font-bold text-lg mb-4 flex items-center gap-2">
              Connect <Separator className="w-12 bg-brand-secondary-500/50" />
            </h3>
            <div className="flex flex-col gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground group transition-colors py-0.5"
                >
                  <div className="w-8 h-8 rounded bg-muted border border-border flex items-center justify-center group-hover:border-brand-secondary-500/50 group-hover:bg-brand-secondary-500/10 transition opacity-80 group-hover:opacity-100">
                    <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors" />
                  </div>
                  <span className="text-sm font-medium">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter (Desktop Col 3, Row 2 | Mobile 5th) */}
          <div className="lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:mt-10 order-5">
            <FooterNewsletter />
          </div>
        </div>

        {/* BOTTOM: Massive Text & Copyright */}
        <div className="relative pt-8 pb-12 md:pb-6 border-t border-border grid grid-cols-1 md:grid-cols-3 items-center gap-6 transition-colors">
          {/* Copyright & Legal */}
          <div className="order-3 md:order-1 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 text-xs text-muted-foreground">
            <p className="text-center md:text-left" suppressHydrationWarning>
              &copy;{new Date().getFullYear()} SHERO.
            </p>
            <div className="flex items-center justify-center gap-3">
              <NavLink
                href={getAbsoluteUrl("/terms")}
                className="hover:text-foreground transition-colors py-1 flex items-center"
              >
                Terms
              </NavLink>
              <span className="text-border select-none" aria-hidden="true">·</span>
              <NavLink
                href={getAbsoluteUrl("/privacy")}
                className="hover:text-foreground transition-colors py-1 flex items-center"
              >
                Privacy
              </NavLink>
              <span className="text-border select-none" aria-hidden="true">·</span>
              <NavLink
                href={getAbsoluteUrl("/cookies")}
                className="hover:text-foreground transition-colors py-1 flex items-center"
              >
                Cookies
              </NavLink>
            </div>
          </div>

          {/* Theme Toggle (3-Button) */}
          <div className="order-1 md:order-2 flex items-center justify-center">
            <ThemeToggle3Button />
          </div>

          {/* Meta & Verification */}
          <div className="order-2 md:order-3 flex flex-col items-center md:items-end justify-center gap-2">
            {SHOP_ENABLED && <PaymentIcons />}
            {/* Meta verification text */}
            <p className="text-[11px] text-muted-foreground text-center md:text-right">
              <span className="font-semibold text-foreground/80">SHERO HQ</span> is a brand of <span className="font-semibold text-foreground/80">SHERO FINTECH</span>
            </p>
          </div>
        </div>

        {/* MASSIVE TYPOGRAPHY (Background Layer) */}
        <div className="absolute sm:-bottom-10 bottom-10 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.03] dark:opacity-5 transition-opacity ">
          <p aria-hidden="true" className="text-[15vw] leading-none font-bold text-foreground/80 font-logo tracking-wider transition-colors ">
            SHERO
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
