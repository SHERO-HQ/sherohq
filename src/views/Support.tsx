"use client";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  FileText,
  Download,
  MessageCircle,
  LifeBuoy,
  Phone,
  Mail,
  ArrowRight,
  Ticket,
  HeadsetIcon,
} from "lucide-react";
import {
  TelegramIcon,
  TwitterXIcon,
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
} from "@/assets/icons/icons";
import SupportTicketForm from "@/components/support/SupportTicketForm";
import Link from "next/link";
import { COMPANY_EMAILS } from "@/constants/emails";

const Support = () => {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const resources = [
    {
      title: "Hardware Support",
      description: "Detailed guides and manuals for all hardware products.",
      icon: FileText,
      link: "/support/hardware",
    },
    {
      title: "Software Support",
      description: "OS updates, driver downloads, and software updates.",
      icon: Download,
      link: "/support/software",
    },
    {
      title: "Community Forum",
      description:
        "Connect with other users, share tips, and find solutions. Join our community on our social media pages to get started.",
      icon: MessageCircle,
      socials: [
        { icon: WhatsAppIcon, url: "https://wa.me/233548711582" },
        { icon: TelegramIcon, url: "https://t.me/sherohq" },
        {
          icon: FacebookIcon,
          url: "https://web.facebook.com/profile.php?id=61583887925479",
        },
        { icon: InstagramIcon, url: "https://instagram.com/sherohq" },
        { icon: TwitterXIcon, url: "https://twitter.com/sherohq" },
      ],
    },
  ];

  return (
    <>
      <div className="pt-8 pb-12 bg-background min-h-screen text-foreground relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-secondary-500/5 dark:bg-brand-secondary-500/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] -z-10" />

        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1 mb-6 text-xs font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-200/20 rounded border border-brand-secondary-200 dark:border-brand-secondary-500/20 uppercase transition-colors duration-300"
            >
              <LifeBuoy className="size-4" />
              <span>Customer Support</span>
            </motion.div>
            <h1 className="text-2xl md:text-5xl font-bold text-foreground mb-6 tracking-tight transition-colors duration-300">
              Get Help in <span className="text-brand-secondary-600">Minutes</span>
            </h1>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto mb-8 leading-relaxed">
              Search guides, download updates, or connect directly with our team
              for fast, reliable assistance.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 px-3 py-1.5 rounded border border-border bg-card/60">
                2hr Response SLA
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 px-3 py-1.5 rounded border border-border bg-card/60">
                Dedicated Support Team
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 px-3 py-1.5 rounded border border-border bg-card/60">
                Human + Self-Service
              </span>
            </div>

            {/* Search */}
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full group">
                <input
                  type="text"
                  placeholder="Search for articles, guides, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-card/40 dark:bg-slate-900/40  border border-border rounded focus:ring-2 focus:ring-brand-secondary-500/50 outline-none transition shadow text-foreground placeholder:text-muted-foreground"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-brand-secondary-500 transition-colors" />
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {resources
              .filter((item) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                  item.title.toLowerCase().includes(q) ||
                  item.description.toLowerCase().includes(q)
                );
              })
              .map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card/40 dark:bg-slate-900/40  p-8 rounded border border-border hover:border-brand-secondary-500/30 hover:bg-card/60 dark:hover:bg-slate-900/60 transition group relative overflow-hidden shadow-sm hover:shadow"
                >
                  <div className="absolute pattern-dots pattern-brand-secondary-500/10 pattern-opacity-100 pattern-size-4 top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 -z-10" />
                  <div className="absolute -top-15 -right-15 w-44 h-44 bg-linear-to-br from-brand-secondary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />

                  <div className="w-14 h-14 bg-brand-secondary-100 dark:bg-brand-secondary-900/40 rounded flex items-center justify-center mb-6 text-brand-secondary-600 dark:text-brand-secondary-400 group-hover:scale-110 group-hover:bg-brand-secondary-500 dark:group-hover:bg-brand-secondary-700/80 group-hover:text-white transition duration-300 shadow shadow-brand-secondary-500/10">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 tracking-tight transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                    {item.description}
                  </p>

                  {item.socials ? (
                    <div className="flex gap-5">
                      {item.socials.map((social, i) => (
                        <a
                          key={i}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded bg-secondary text-muted-foreground hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 hover:bg-brand-secondary-500/10 transition transform hover:-translate-y-1"
                        >
                          <social.icon className="w-5 h-5" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.link!}
                      className="inline-flex items-center gap-2 text-brand-secondary-600 dark:text-brand-secondary-400 font-bold group-hover:gap-3 transition hover:text-brand-secondary-700 dark:hover:text-brand-secondary-300"
                    >
                      <span>Browse Guides</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  )}
                </motion.div>
              ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center justify-between bg-linear-to-br from-card via-card to-brand-secondary-50 dark:from-slate-900 dark:via-slate-900 dark:to-brand-secondary-900/20  rounded p-8 md:p-16 border border-border text-center lg:text-left relative overflow-hidden shadow pattern-dots pattern-brand-secondary-500/10 pattern-opacity-100 pattern-size-4"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-secondary-500/5 dark:bg-brand-secondary-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 w-full">
              <div className="p-6 group shrink-0 flex">
                <HeadsetIcon className="w-24 h-24 md:w-28 md:h-28 text-brand-secondary-600 dark:text-brand-secondary-400 group-hover:rotate-12 transition-transform duration-500" />
              </div>

              <div className="flex-1">
                <span className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-xs font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-200/20 border border-brand-secondary-200 dark:border-brand-secondary-500/20 uppercase rounded transition-colors duration-300">
                  <LifeBuoy className="size-4" />
                  Connect With Support
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight transition-colors duration-300">
                  Still need help?
                </h2>
                <p className="text-muted-foreground text-sm mb-10 max-w-xl">
                  Can't find what you're looking for? Our support team is
                  available Monday through Friday, 9am to 6pm GMT.
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <button
                    onClick={() => setIsTicketModalOpen(true)}
                    className="flex items-center gap-3 px-6 py-2 rounded bg-brand-secondary-600 text-white font-medium text-sm hover:bg-brand-secondary-500 transition shadow shadow-brand-secondary-500/20 hover:scale-[1.02] active:scale-95 w-fit md:w-auto justify-center"
                    aria-label="Submit a Ticket"
                  >
                    <Ticket className="w-5 h-5" />
                    <span>Open Ticket</span>
                  </button>
                  <a
                    href={`mailto:${COMPANY_EMAILS.SUPPORT}`}
                    className="flex items-center gap-3 px-6 py-2 rounded bg-secondary text-foreground font-medium text-sm hover:bg-accent transition  border border-border w-fit md:w-auto justify-center"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Email Us</span>
                  </a>
                  <a
                    href="tel:+233548711582"
                    className="flex items-center gap-3 px-6 py-2 rounded border-2 border-brand-secondary-500/30 text-brand-secondary-600 dark:text-brand-secondary-400 font-medium text-sm hover:bg-brand-secondary-500/10 transition w-fit md:w-auto justify-center"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Support</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <SupportTicketForm
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
    </>
  );
};

export default Support;
