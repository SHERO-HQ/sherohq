"use client";
import { useState } from "react";
import { m } from "motion/react";
import {
  Search,
  LifeBuoy,
  Phone,
  Mail,
  ArrowRight,
  Ticket,
  HeadsetIcon,
  Meh,
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
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { useGuides } from "@/hooks/queries/useGuides";
import AppImage from "@/components/common/AppImage";
import { format } from "date-fns";

const Support = () => {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: guides = [], isLoading } = useGuides();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const event = new CustomEvent("shero-ai-open", {
        detail: { message: searchQuery, open: true },
      });
      window.dispatchEvent(event);
      setSearchQuery("");
    }
  };

  const filteredGuides = guides.filter((guide) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      guide.title.toLowerCase().includes(q) ||
      guide.summary?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="pt-8 pb-12 bg-background min-h-screen text-foreground relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-secondary-500/5 dark:bg-brand-secondary-500/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] -z-10" />

        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16 relative">
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1 mb-6 text-xs font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-200/20 rounded border border-brand-secondary-200 dark:border-brand-secondary-500/20 uppercase transition-colors duration-300"
            >
              <LifeBuoy className="size-4" />
              <span>Customer Support</span>
            </m.div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-6 tracking-tight transition-colors duration-300">
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
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full group">
                <input
                  type="text"
                  placeholder="Search articles or ask a question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-16 py-4 bg-card/40 dark:bg-slate-900/40 border border-border rounded focus:ring-2 focus:ring-brand-secondary-500/50 outline-none transition shadow text-foreground placeholder:text-muted-foreground"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-brand-secondary-500 transition-colors" />
                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded bg-linear-to-r from-brand-secondary-600 to-brand-primary-600 text-white hover:from-brand-secondary-500 hover:to-brand-primary-500 transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Search or Ask AI"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Content Rendering */}
          {(() => {
            if (isLoading) {
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 md:mb-24">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="bg-card/40 dark:bg-slate-900/40 rounded border border-border p-6 animate-pulse"
                    >
                      <div className="h-40 bg-secondary/50 rounded mb-6 shadow-inner" />
                      <div className="h-6 bg-secondary/50 rounded w-3/4 mb-3" />
                      <div className="h-4 bg-secondary/50 rounded w-full mb-6" />
                      <div className="h-4 bg-secondary/50 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              );
            }

            if (filteredGuides.length === 0) {
              return (
                <m.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-24 max-w-2xl mx-auto bg-card/60 dark:bg-slate-900/60 p-8 rounded border border-border text-center shadow-lg relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-brand-secondary-500/5 to-brand-primary-500/5 animate-pulse" />
                  <Meh className="w-14 h-14 mx-auto mb-4 opacity-80 text-muted-foreground" />
                  <h3 className="text-xl font-bold text-foreground mb-2">No guides found</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    But our AI Expert can help you with that! Press <strong className="text-foreground">Enter</strong> or click the arrow button in the search bar to ask a question.
                  </p>
                </m.div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 md:mb-24">
                {filteredGuides.map((guide) => (
                  <div key={guide.id}>
                    <Link
                      href={`/support/${guide.category}/${guide.slug}`}
                      className="block bg-card dark:bg-slate-900/40 rounded border border-border hover:border-brand-secondary-500/30 hover:shadow hover:shadow-brand-secondary-500/10 transition duration-300 overflow-hidden group h-full relative"
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-brand-secondary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {guide.coverImage && (
                        <div className="h-48 overflow-hidden bg-secondary relative">
                          <AppImage
                            src={guide.coverImage}
                            alt={guide.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 to-transparent" />
                        </div>
                      )}
                      <div className="p-7 relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-brand-secondary-600 dark:text-brand-secondary-400">
                            {guide.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors line-clamp-2 leading-snug">
                          {guide.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6 line-clamp-3 leading-relaxed mt-2">
                          {guide.summary}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="px-2.5 py-1 rounded bg-secondary border border-border">
                              {format(new Date(guide.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-brand-secondary-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition duration-300" />
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Contact Section */}
          <m.div
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

                <div className="flex flex-col gap-6 w-full items-center lg:items-start">
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => setIsTicketModalOpen(true)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded bg-brand-secondary-600 text-white font-medium text-sm hover:bg-brand-secondary-500 transition shadow-md shadow-brand-secondary-500/20 hover:-translate-y-0.5 active:scale-95 w-full sm:w-auto justify-center"
                      aria-label="Submit a Ticket"
                    >
                      <Ticket className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Open Ticket</span>
                    </button>
                    <a
                      href={`https://wa.me/${COMPANY_CONTACTS.WHATSAPP}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-2.5 rounded border-2 border-brand-secondary-500/30 text-brand-secondary-600 dark:text-brand-secondary-400 font-medium text-sm hover:bg-brand-secondary-500/10 transition hover:-translate-y-0.5 active:scale-95 w-full sm:w-auto justify-center"
                    >
                      <WhatsAppIcon className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground w-full sm:w-auto justify-center lg:justify-start">
                    <span className="text-xs uppercase tracking-wider font-semibold">Other options:</span>
                    <a
                      href={`tel:${COMPANY_CONTACTS.WHATSAPP}`}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="underline decoration-border underline-offset-4 hover:decoration-foreground">Call Us</span>
                    </a>
                    <span className="text-border text-xs">•</span>
                    <a
                      href={`mailto:${COMPANY_EMAILS.SUPPORT}`}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span className="underline decoration-border underline-offset-4 hover:decoration-foreground">Email Us</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </m.div>

          {/* Social / Community Section */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center max-w-2xl mx-auto"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Connect with our Community</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: WhatsAppIcon, url: `https://chat.whatsapp.com/L3JweRUmQDBLBaxmNjIqUp` },
                { icon: TelegramIcon, url: "https://t.me/sherohq" },
                { icon: FacebookIcon, url: "https://web.facebook.com/sherohq1" },
                { icon: InstagramIcon, url: "https://instagram.com/sherohq" },
                { icon: TwitterXIcon, url: "https://twitter.com/sherohq" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-secondary text-muted-foreground hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 hover:bg-brand-secondary-500/10 border border-border transition transform hover:-translate-y-1 shadow-sm hover:shadow"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </m.div>
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
