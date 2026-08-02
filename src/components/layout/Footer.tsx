import NavLink from "@/components/common/NavLink";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Clock} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  TwitterXIcon} from "@/assets/icons/icons";
import { COMPANY_EMAILS } from "@/constants/emails";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { SOCIAL_LINKS } from "@/constants/socials";
import PaymentIcons from "./PaymentIcons";
import FooterNewsletter from "./FooterNewsletter";

// Static Data
const companyLinks = ["Shop", "Solutions", "About Us", "Careers", "Contact Us"];
const resourceLinks = [
  { label: "Consultation", href: "/consultation" },
  { label: "Partners", href: "/partners" },
  { label: "Support", href: "/support" },
  { label: "FAQ", href: "/faq" },
  { label: "Feedback", href: "/feedback" },
  { label: "Track Order", href: "/track" },
];

const socialLinks = [
  {
    name: "X (Twitter)",
    url: SOCIAL_LINKS.TWITTER,
    icon: TwitterXIcon},
  {
    name: "TikTok",
    url: SOCIAL_LINKS.TIKTOK,
    icon: TikTokIcon},
  {
    name: "Facebook",
    url: SOCIAL_LINKS.FACEBOOK,
    icon: FacebookIcon},
  {
    name: "Instagram",
    url: SOCIAL_LINKS.INSTAGRAM,
    icon: InstagramIcon},
];

const Footer = () => {
  return (
    <footer className="w-full bg-background relative overflow-hidden border-t border-slate-200 dark:border-slate-800 md:pb-8 py-10 transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute inset-0 hero-grid-pattern opacity-5 dark:opacity-20 transition-opacity duration-300" />
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/90 to-background/50 pointer-events-none transition duration-300" />

      {/* Glow Effect */}
      <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-200 h-125 bg-brand-secondary-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-10 lg:gap-x-12 lg:mb-12 mb-8">
          
          {/* Branding (Desktop Col 1, Row 1 | Mobile 1st) */}
          <div className="lg:col-span-4 lg:col-start-1 lg:row-start-1 order-1">
            <NavLink href={getAbsoluteUrl("/")} className="inline-block mb-6">
              <img
                src="/assets/logo/shero-light.svg"
                alt="Shero Logo"
                className="h-10 w-auto dark:block hidden"
                suppressHydrationWarning
              />
              <img
                src="/assets/logo/shero-dark.svg"
                alt="Shero Logo"
                className="h-10 w-auto dark:hidden block"
                suppressHydrationWarning
              />
            </NavLink>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-md transition-colors duration-300">
              Engineering the future of technology with focus on clarity, 
              performance, and scalability with long term value to Redefine 
              what is Possible.
            </p>
          </div>

          {/* Navigation Links (Desktop Col 2, Row 1-2 | Mobile 2nd) */}
          <div className="lg:col-span-4 lg:col-start-5 lg:row-start-1 lg:row-span-2 order-2">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-foreground font-bold text-lg mb-4 flex items-center gap-2">
                  Company <Separator className="w-8 bg-border" />
                </h3>
                <ul className="space-y-2.5">
                  {companyLinks.map((link) => (
                    <li key={link}>
                      <NavLink
                        href={getAbsoluteUrl(
                          `/${link.toLowerCase().replace(" ", "-")}`,
                        )}
                        className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors text-sm"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition" />
                        {link}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-foreground font-bold text-lg mb-4 flex items-center gap-2">
                  Resources <Separator className="w-8 bg-border" />
                </h3>
                <ul className="space-y-2.5">
                  {resourceLinks.map((link) => (
                    <li key={link.label}>
                      <NavLink
                        href={getAbsoluteUrl(link.href)}
                        className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors text-sm"
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

            <div className="space-y-4">
              <a
                href={`mailto:${COMPANY_EMAILS.HELLO}`}
                className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors group"
              >
                <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{COMPANY_EMAILS.HELLO}</span>
              </a>

              <a
                href={`tel:${COMPANY_CONTACTS.WHATSAPP}`}
                className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors group"
              >
                <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{COMPANY_CONTACTS.PHONE_DISPLAY}</span>
              </a>

              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 group">
                <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-brand-secondary-500/50 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{COMPANY_CONTACTS.HQ_LOCATION}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 group">
                <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-brand-secondary-500/50 transition-colors">
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
            <div className="flex flex-col gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white group transition-colors duration-300"
                >
                  <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center group-hover:border-brand-secondary-500/50 group-hover:bg-brand-secondary-500/10 transition duration-500 opacity-80 group-hover:opacity-100">
                    <social.icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors" />
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
        <div className="relative pt-6 pb-12 md:pb-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 transition-colors duration-300">
          {/* Copyright & Legal */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 md:text-sm text-xs text-slate-500 order-2 md:order-1">
            <p className="text-center md:text-left" suppressHydrationWarning>
              &copy;{new Date().getFullYear()} Shero Group.
            </p>
            <div className="flex items-center justify-center gap-3 divide-x-2 divide-slate-200 dark:divide-slate-800">
              <NavLink
                href={getAbsoluteUrl("/terms")}
                className="hover:text-slate-900 dark:hover:text-white transition-colors pr-2"
              >
                Terms
              </NavLink>
              <NavLink
                href={getAbsoluteUrl("/privacy")}
                className="hover:text-slate-900 dark:hover:text-white transition-colors pr-2 pl-3"
              >
                Privacy
              </NavLink>
              <NavLink
                href={getAbsoluteUrl("/cookies")}
                className="hover:text-slate-900 dark:hover:text-white transition-colors pl-3"
              >
                Cookies
              </NavLink>
            </div>
          </div>

          <div className="order-1 md:order-2 flex flex-col items-center gap-2">
            <PaymentIcons />
            {/* Meta verification text */}
            <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
              <span className="font-bold">SHERO HQ</span> is a brand of <span className="font-bold">SHERO FINTECH</span>
            </p>
          </div>
        </div>

        {/* MASSIVE TYPOGRAPHY (Background Layer) */}
        <div className="absolute sm:-bottom-10 bottom-10 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.03] dark:opacity-5 transition-opacity duration-300">
          <h1 className="text-[15vw] leading-none font-bold text-slate-900/80 dark:text-white/80 font-logo tracking-wider transition-colors duration-300">
            SHERO
          </h1>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
