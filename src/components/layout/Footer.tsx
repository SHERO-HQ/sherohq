"use client";
import { useState } from "react";
import NavLink from "@/components/common/NavLink";
import {
  ArrowRight,
  BadgeCheck,
  Mail,
  Phone,
  Send,
  MapPin,
  Clock,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  TwitterXIcon,
} from "@/assets/icons/icons";
import { COMPANY_EMAILS } from "@/constants/emails";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { subscribeToNewsletter } from "@/services/api";
import PaymentIcons from "./PaymentIcons";

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const companyLinks = ["Shop", "Solutions", "About Us", "Contact Us"];
  const resourceLinks = [
    { label: "Consultation", href: "/consultation" },
    { label: "Partners", href: "/partners" },
    { label: "Support", href: "/support" },
    { label: "FAQ", href: "/faq" },
    { label: "Track Order", href: "/track" },
  ];

  const socialLinks = [
    {
      name: "X (Twitter)",
      url: "https://x.com/sherohq",
      icon: TwitterXIcon,
    },
    {
      name: "TikTok",
      url: "https://tiktok.com/@sherohq",
      icon: TikTokIcon,
    },
    {
      name: "Facebook",
      url: "https://web.facebook.com/profile.php?id=61583887925479",
      icon: FacebookIcon,
    },
    {
      name: "Instagram",
      url: "https://instagram.com/sherohq",
      icon: InstagramIcon,
    },
  ];

  const handleNewsletterSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const trimmedEmail = newsletterEmail.trim();
    if (!trimmedEmail) return;

    setNewsletterStatus("submitting");
    try {
      await subscribeToNewsletter({
        email: trimmedEmail,
        source: "footer",
      });
      setNewsletterStatus("success");
      setNewsletterEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setNewsletterStatus("error");
    }
  };

  return (
    <footer className="w-full bg-background relative overflow-hidden border-t border-slate-200 dark:border-slate-800 md:pb-8 py-10 transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute inset-0 hero-grid-pattern opacity-5 dark:opacity-20 transition-opacity duration-300" />
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/90 to-background/50 pointer-events-none transition duration-300" />

      {/* Glow Effect */}
      <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-200 h-125 bg-brand-secondary-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 lg:grid-flow-row-dense items-start gap-10 lg:gap-x-20 lg:mb-8 mb-4">
          {/* Item 1: Branding (Desktop Top-Left, Mobile First) */}
          <div className="lg:col-span-5 order-1 space-y-4">
            <div>
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
          </div>

          {/* Item 2: Navigation & Social (Desktop Top-Right, Mobile Middle) */}
          <div className="lg:col-span-7 lg:row-span-2 order-2 flex flex-col justify-start">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {/* Company Link Column */}
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

              {/* Resources Link Column */}
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

              {/* Socials Column */}
              <div>
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
                      <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-brand-secondary-500/50 group-hover:bg-brand-secondary-500/10 transition duration-500 saturate-[0.1] opacity-30 group-hover:saturate-100 group-hover:opacity-100">
                        <social.icon className="w-5 h-5 group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Item 3: Contact Card (Desktop Bottom-Left, Mobile Third) */}
          <div className="lg:col-span-5 order-3 space-y-4">
            <div className="rounded overflow-hidden mb-4">
              <div className="p-0 space-y-6">
                {/* Contact Details Section */}
                <div>
                  <h4 className="text-foreground font-bold mb-4 flex items-center gap-2">
                    Contact Details <Separator className="w-10 bg-brand-secondary-500/50" />
                  </h4>

                  <div className="space-y-4">
                    <a
                      href={`mailto:${COMPANY_EMAILS.INFO}`}
                      className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors group"
                    >
                      <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{COMPANY_EMAILS.INFO}</span>
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

                {/* Newsletter Section (Nested back inside the card) */}
                <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Stay Updated</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get the latest deals, product drops, and tech news.</p>
                  </div>
                  <form onSubmit={handleNewsletterSubmit} className="relative">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => {
                        setNewsletterEmail(e.target.value);
                        if (newsletterStatus !== "idle") setNewsletterStatus("idle");
                      }}
                      placeholder="Enter your email"
                      className="w-full pr-32 pl-4 py-3 text-sm bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={newsletterStatus === "submitting"}
                      className="absolute right-1.5 top-1.5 bottom-1.5 inline-flex items-center gap-2 px-4 bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold rounded transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      {newsletterStatus === "submitting" ? "..." : "Subscribe"}
                    </button>
                  </form>
                  {newsletterStatus === "success" && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" /> Successfully subscribed!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: Massive Text & Copyright */}
        <div className="relative pt-4 pb-8 sm:pb-0 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-300">
          {/* Copyright & Legal */}
          <div className="flex flex-row items-center gap-6 md:text-sm text-xs text-slate-500">
            <p className="" suppressHydrationWarning>
              &copy;{new Date().getFullYear()} Shero Group.
            </p>
            <div className="flex items-center gap-3 divide-x-2 divide-slate-200 dark:divide-slate-800">
              <NavLink
                href={getAbsoluteUrl("/terms")}
                className="hover:text-slate-900 dark:hover:text-white transition-colors pr-2"
              >
                Terms
              </NavLink>
              <NavLink
                href={getAbsoluteUrl("/privacy")}
                className="hover:text-slate-900 dark:hover:text-white transition-colors pr-2"
              >
                Privacy
              </NavLink>
              <NavLink
                href={getAbsoluteUrl("/cookies")}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cookies
              </NavLink>
            </div>
          </div>
          <PaymentIcons />
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
