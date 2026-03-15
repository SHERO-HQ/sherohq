"use client";
import NavLink from "@/components/common/NavLink";
import { ArrowRight, BadgeCheck, Mail, Phone, CreditCard, Wallet, Banknote, Send } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  TwitterXIcon,
} from "@/assets/icons/icons";
import { COMPANY_EMAILS } from "@/constants/emails";
import { getAbsoluteUrl } from "@/utils/subdomain";

const Footer = () => {
  const companyLinks = ["Shop", "Solutions", "About Us", "Contact Us"];
  const resourceLinks = ["Consultation", "Partners", "Support", "FAQ"];

  const socialLinks = [
    {
      name: "X (Twitter)",
      url: "https://twitter.com/@sherohq",
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

  return (
    <footer className="w-full bg-background relative overflow-hidden border-t border-slate-200 dark:border-slate-800 pt-24 md:pb-12 pb-24 transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute inset-0 hero-grid-pattern opacity-5 dark:opacity-20 transition-opacity duration-300" />
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/90 to-background/50 pointer-events-none transition duration-300" />

      {/* Glow Effect */}
      <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-200 h-125 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 lg:mb-32 mb-4">
          {/* LEFT: Branding & Contact */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <NavLink href={getAbsoluteUrl("/")} className="inline-block mb-3">
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

            {/* Newsletter Signup */}
            <div className="space-y-3">
              <h4 className="text-sm font-sora font-semibold text-slate-900 dark:text-white">
                Stay Updated
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Get the latest deals, product drops, and tech news.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex gap-2 relative"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-emerald-500/50 outline-none transition"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Subscribe
                </button>
              </form>
            </div>

            {/* Contact Card */}
            <div className="p-1 rounded border border-slate-200 dark:border-slate-800 ring-2 ring-emerald-500/20 ring-offset-2 ring-offset-background backdrop-blur-sm transition duration-300">
              <div className="bg-background rounded p-6 transition-colors duration-300">
                <h4 className="text-slate-900 dark:text-white font-sora font-semibold mb-6 flex items-center gap-2 transition-colors duration-300">
                  Contact Details{" "}
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </h4>

                <div className="space-y-4">
                  <a
                    href={`mailto:${COMPANY_EMAILS.INFO}`}
                    className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                  >
                    <div className="p-2 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-emerald-500/50 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">
                      {COMPANY_EMAILS.INFO}
                    </span>
                  </a>

                  <a
                    href="tel:+233548711582"
                    className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                  >
                    <div className="p-2 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-emerald-500/50 transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">
                      +233 (54) 871-1582
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* System Status */}
            {/* <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-500/20 transition-colors duration-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold tracking-wider uppercase transition-colors duration-300">
                All Systems Operational
              </span>
            </div> */}
          </div>

          {/* RIGHT: Navigation & Social */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {/* Company Link Column */}
              <div>
                <h3 className="text-foreground font-sora font-bold text-lg mb-6 flex items-center gap-2">
                  Company <Separator className="w-8 bg-border" />
                </h3>
                <ul className="space-y-4">
                  {companyLinks.map((link) => (
                    <li key={link}>
                      <NavLink
                        href={getAbsoluteUrl(`/${link.toLowerCase().replace(" ", "-")}`)}
                        className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm"
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
                <h3 className="text-foreground font-sora font-bold text-lg mb-6 flex items-center gap-2">
                  Resources <Separator className="w-8 bg-border" />
                </h3>
                <ul className="space-y-4">
                  {resourceLinks.map((link) => (
                    <li key={link}>
                      <NavLink
                        href={getAbsoluteUrl(`/${link.toLowerCase().replace(" ", "-")}`)}
                        className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition" />
                        {link}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Socials Column */}
              <div>
                <h3 className="text-foreground font-sora font-bold text-lg mb-6 flex items-center gap-2">
                  Connect <Separator className="w-12 bg-emerald-500/50" />
                </h3>
                <div className="flex flex-col gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white group transition-colors duration-300"
                    >
                      <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition duration-300">
                        <social.icon className="w-5 h-5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="hidden lg:block w-full bg-linear-to-r from-transparent via-border to-transparent mt-12" />
          </div>
        </div>

        {/* BOTTOM: Massive Text & Copyright */}
        <div className="relative pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-300">
          {/* Copyright & Legal */}
          <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-slate-500">
            <p className="font-sora" suppressHydrationWarning>
              &copy;{new Date().getFullYear()} Shero Group.
            </p>
            <div className="flex items-center gap-6">
              <NavLink
                href={getAbsoluteUrl("/terms")}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Terms
              </NavLink>
              <NavLink
                href={getAbsoluteUrl("/privacy")}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
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

          {/* Certificate/Badge (Decorative) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded bg-emerald-100/30 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 opacity-40 hover:opacity-100 transition">
              <BadgeCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-colors">
                Certified
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">We Accept</span>
            <div className="flex items-center gap-2">
              {[
                { name: "Visa", icon: CreditCard },
                { name: "Mastercard", icon: CreditCard },
                { name: "MoMo", icon: Wallet },
                { name: "Cash", icon: Banknote },
              ].map((method) => (
                <div
                  key={method.name}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                >
                  <method.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold">{method.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MASSIVE TYPOGRAPHY (Background Layer) */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.03] dark:opacity-5 transition-opacity duration-300">
          <h1 className="text-[15vw] leading-none font-bold text-slate-900/80 dark:text-white/80 font-logo tracking-wider transition-colors duration-300">
            SHERO
          </h1>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
