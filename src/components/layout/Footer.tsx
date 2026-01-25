import { NavLink, Link } from "react-router-dom";
import SheroLight from "@/assets/logo/shero-light.svg";
import {
  Twitter,
  Linkedin,
  Facebook,
  Send,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const Footer = () => {
  const companyLinks = ["Products", "Solutions", "About Us", "Contact Us"];
  const resourceLinks = ["Consultation", "Partners", "Support", "FAQ"];

  const socialLinks = [
    {
      name: "Twitter",
      url: "https://twitter.com",
      icon: Twitter,
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com",
      icon: Linkedin,
    },
    {
      name: "Facebook",
      url: "https://facebook.com",
      icon: Facebook,
    },
  ];

  return (
    <footer className="w-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden border-t border-slate-200 dark:border-white/5 pt-24 md:pb-12 pb-24 transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0))] opacity-5 dark:opacity-20 transition-opacity duration-300" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-slate-100/90 to-slate-100/50 dark:from-slate-950 dark:via-slate-950/90 dark:to-slate-950/50 pointer-events-none transition-all duration-300" />

      {/* Glow Effect */}
      <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 mb-24">
          {/* LEFT: Branding & Newsletter */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <NavLink to="/" className="inline-block mb-6">
                <img
                  src={SheroLight}
                  alt="Shero Logo"
                  className="h-10 w-auto dark:block hidden"
                />
                <img
                  src={SheroLight} // Using light logo for both as it usually works on dark footer, but footer is now white in light mode
                  alt="Shero Logo"
                  className="h-10 w-auto dark:hidden block brightness-0"
                />
              </NavLink>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-md transition-colors duration-300">
                Engineering the future of enterprise technology. We build the
                systems that power tomorrow's leaders.
              </p>
            </div>

            {/* Newsletter Card */}
            <div className="p-1 rounded bg-gradient-to-br from-slate-200 to-slate-100 dark:from-white/10 dark:to-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-sm transition-all duration-300">
              <div className="bg-white dark:bg-slate-950/80 rounded p-6 transition-colors duration-300">
                <h4 className="text-slate-900 dark:text-white font-sora font-semibold mb-2 flex items-center gap-2 transition-colors duration-300">
                  Stay in the Loop{" "}
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 transition-colors duration-300">
                  Get the latest tech trends and updates.
                </p>
                <form className="relative flex items-center">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded pl-4 pr-12 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="cursor-pointer absolute right-2 p-2 bg-emerald-600 rounded text-white hover:bg-emerald-500 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* System Status */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-500/20 transition-colors duration-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold tracking-wider uppercase transition-colors duration-300">
                All Systems Operational
              </span>
            </div>
          </div>

          {/* RIGHT: Navigation & Social */}
          <div className="lg:col-span-12 xl:col-span-7 flex flex-col justify-between">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {/* Company Link Column */}
              <div>
                <h3 className="text-slate-900 dark:text-white font-sora font-bold text-lg mb-6 flex items-center gap-2 transition-colors duration-300">
                  Company{" "}
                  <div className="h-px w-8 bg-slate-200 dark:bg-slate-800 transition-colors duration-300" />
                </h3>
                <ul className="space-y-4">
                  {companyLinks.map((link) => (
                    <li key={link}>
                      <NavLink
                        to={`/${link.toLowerCase().replace(" ", "-")}`}
                        className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        {link}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources Link Column */}
              <div>
                <h3 className="text-slate-900 dark:text-white font-sora font-bold text-lg mb-6 flex items-center gap-2 transition-colors duration-300">
                  Resources{" "}
                  <div className="h-px w-8 bg-slate-200 dark:bg-slate-800 transition-colors duration-300" />
                </h3>
                <ul className="space-y-4">
                  {resourceLinks.map((link) => (
                    <li key={link}>
                      <NavLink
                        to={`/${link.toLowerCase().replace(" ", "-")}`}
                        className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        {link}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Socials Column */}
              <div>
                <h3 className="text-slate-900 dark:text-white font-sora font-bold text-lg mb-6 flex items-center gap-2 transition-colors duration-300">
                  Connect{" "}
                  <div className="h-px w-12 bg-emerald-500/50 transition-colors duration-300" />
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
                      <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-all duration-300">
                        <social.icon className="w-5 h-5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:block h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent mt-12 transition-colors duration-300" />
          </div>
        </div>

        {/* BOTTOM: Massive Text & Copyright */}
        <div className="relative pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-300">
          {/* Copyright & Legal */}
          <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Shero Group.</p>
            <div className="flex items-center gap-6">
              <Link
                to="/terms"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/cookies"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>

          {/* Certificate/Badge (Decorative) */}
          <div className="flex items-center gap-2 px-4 py-2 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors">
              ISO 27001 Certified
            </span>
          </div>
        </div>

        {/* MASSIVE TYPOGRAPHY (Background Layer) */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.03] dark:opacity-5 transition-opacity duration-300">
          <h1 className="text-[15vw] leading-none font-bold text-slate-900 dark:text-white font-sora tracking-tighter transition-colors duration-300">
            SHERO
          </h1>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
