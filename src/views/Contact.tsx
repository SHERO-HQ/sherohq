"use client";
import ContactForm from "@/components/common/ContactForm";
import {
  Mail,
  MapPin,
  MessagesSquare,
  Phone,
  Globe2,
} from "lucide-react";
import { COMPANY_EMAILS } from "@/constants/emails";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { Particles } from "@/components/ui/particles";
import { SectionBadge } from "@/components/common/SectionBadge";

const Contact = () => {
  return (
    <>
      <div className="relative pt-8 pb-12 lg:pt-12 lg:pb-16 overflow-hidden dark:bg-slate-950 bg-slate-50 min-h-screen">
        {/* Particle and Dot Pattern Background */}
        <div className="absolute inset-0 pattern-dots opacity-40 dark:opacity-20 pointer-events-none" />
        <Particles count={40} color="100, 116, 139" className="opacity-40" />

        {/* Single Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-125 bg-brand-secondary-500/5 dark:bg-brand-secondary-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Page Header (always at top) */}
          <div
            className="text-center max-w-3xl mx-auto mb-10 lg:mb-14 animate-in fade-in slide-in-from-top-4 duration-500"
          >
            <SectionBadge icon={MessagesSquare} className="mb-4">
              Get In Touch
            </SectionBadge>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Let&apos;s Redefine What&apos;s Possible
            </h1>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Have a question, a project in mind, or need specialized enterprise tech support? Reach out and our team will get back to you promptly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Contact Channels & Context */}
            <div
              className="lg:col-span-5 space-y-6 animate-in fade-in slide-in-from-left-8 duration-700"
            >
              <div className="space-y-3">
                <ContactItem
                  icon={
                    <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
                  }
                  label="Email Us"
                  value={COMPANY_EMAILS.HELLO}
                  href={`mailto:${COMPANY_EMAILS.HELLO}`}
                  delay={0.2}
                />
                <ContactItem
                  icon={
                    <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" />
                  }
                  label="Call Us"
                  value={COMPANY_CONTACTS.PHONE_DISPLAY}
                  href={`tel:+${COMPANY_CONTACTS.WHATSAPP}`}
                  delay={0.3}
                />
                <ContactItem
                  icon={
                    <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" />
                  }
                  label="Visit Us"
                  value="Tamale, Northern Region, Ghana"
                  href={COMPANY_CONTACTS.MAP_LINK}
                  delay={0.4}
                />
              </div>

              {/* Office Details Card */}
              <div
                style={{ animationDelay: '0.5s' }}
                className="p-6 bg-slate-900/5 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500 animate-in fade-in zoom-in-95 fill-mode-both"
              >
                <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pattern-isometric pointer-events-none" />
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <Globe2 className="w-16 h-16 text-emerald-500" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Regional Operations & Support
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Headquartered in Tamale, Ghana, we serve local businesses and regional hubs with specialized logistics and on-site technical deployment teams.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Glass Form */}
            <div
              style={{ animationDelay: '0.2s' }}
              className="lg:col-span-7 relative animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
            >
              <ContactForm />
            </div>
          </div>

          {/* Quick FAQ Section */}
          <div
            className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <div className="text-center mb-10">
              <SectionBadge icon={MessagesSquare} className="mb-4">
                Quick Answers
              </SectionBadge>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4 transition-colors duration-300">
                Frequently Asked
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                Common questions before starting a conversation with our team.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  className="relative p-6 rounded bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                >
                  <span className="absolute -bottom-4 -right-4 text-[120px] font-black text-slate-900/5 dark:text-white/5 pointer-events-none select-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
                    {idx + 1}
                  </span>
                  <div className="relative z-10 space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const faqs = [
  {
    question: "How quickly do you ship hardware?",
    answer:
      "In-stock hardware typically dispatches within 24-48hrs. Custom configurations or bulk orders may take 5-7 business days.",
  },
  {
    question: "Do you provide on-site support?",
    answer:
      "Yes, we offer on-site deployment and maintenance services across various regions in Ghana. Remote support is available for digital solutions and software.",
  },
  {
    question: "Do you offer wholesale pricing?",
    answer:
      "Absolutely. Our Solution Partners and bulk purchasers access tiered wholesale rates that scale with volume.",
  },
];

const ContactItem = ({
  icon,
  label,
  value,
  href,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  delay: number;
}) => {
  const content = (
    <>
      <div className="w-12 h-12 rounded text-slate-900 dark:text-white bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-white/80 dark:group-hover:bg-white/10 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-300">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 group-hover:text-emerald-600/80 dark:group-hover:text-emerald-400/80 transition-colors">
          {label}
        </p>
        <p className="dark:text-slate-200 text-slate-900/90 font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {value}
        </p>
      </div>
    </>
  );

  return (
    <div
      style={{ animationDelay: `${delay}s` }}
      className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
    >
      {href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="flex items-center gap-4 group cursor-pointer"
        >
          {content}
        </a>
      ) : (
        <div className="flex items-center gap-4 group">{content}</div>
      )}
    </div>
  );
};

export default Contact;
