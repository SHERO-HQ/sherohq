"use client";
import { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { SectionBadge } from "@/components/common/SectionBadge";
import Link from "next/link";
import { COMPANY_EMAILS } from "@/constants/emails";

const FAQ = () => {
  const linkClass = "text-brand-secondary-600 hover:underline font-medium";
  const faqs = [
    {
      category: "General",
      items: [
        {
          q: "Where is your physical office located?",
          a: "We are located in Tamale, Northern Region, Ghana. You can find our exact location on the Contact Us page.",
        },
        {
          q: "What are your working hours?",
          a: "Monday to Friday, 8:00 AM to 6:00 PM.",
        },
      ],
    },
    {
      category: "Services",
      items: [
        {
          q: "Can you develop custom software for my business?",
          a: "Yes. We build custom web and business software around how your team actually works. Book a consultation and tell us what you need.",
        },
        {
          q: "Can you help us get laptops, servers or networking equipment?",
          a: (
            <>
              Yes. Tell us what you need on{" "}
              <a
                href="https://wa.me/233548711582"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                WhatsApp
              </a>{" "}
              or book a{" "}
              <Link href="/consultation?service=hardware" className={linkClass}>
                hardware consultation
              </Link>{" "}
              and we will help you source and set it up.
            </>
          ),
        },
        {
          q: "Do you help with setup and installation?",
          a: "Yes. We can help set up your business tools, workstations and office systems. Tell us what you have and what you need.",
        },
      ],
    },
    {
      category: "Support",
      items: [
        {
          q: "How do I contact technical support?",
          a: (
            <>
              You can reach us by opening a ticket on our{" "}
              <Link href="/support" className={linkClass}>
                Support
              </Link>{" "}
              page, emailing{" "}
              <a href={`mailto:${COMPANY_EMAILS.SUPPORT}`} className={linkClass}>
                {COMPANY_EMAILS.SUPPORT}
              </a>
              , or messaging us on{" "}
              <a
                href="https://wa.me/233548711582"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                WhatsApp
              </a>
              .
            </>
          ),
        },
      ],
    },
  ];

  return (
    <>
      <div className="pt-8 pb-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 ">
            <SectionBadge icon={HelpCircle} className="mb-4">
              Help Center
            </SectionBadge>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight transition-colors ">
              Answers to common{" "}
              <span className="text-brand-secondary-600">Questions</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-base leading-relaxed">
              Answers about our services, hardware requests and support.
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 uppercase">
                  {section.category}
                </h2>
                <div className="space-y-4">
                  {section.items.map((item, i) => (
                    <FAQItem key={i} question={item.q} answer={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer w-full flex items-center justify-between p-4 px-6 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span
          className={`font-semibold pr-8 transition-colors ${isOpen ? "text-brand-secondary-600 dark:text-brand-secondary-400" : ""}`}
        >
          {question}
        </span>
        <span className="text-brand-secondary-600 dark:text-brand-secondary-400 shrink-0">
          {isOpen ? (
            <Minus className="w-5 h-5" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`p-6 px-6 pt-2 leading-relaxed border-t border-slate-100 dark:border-slate-800/50 ${isOpen ? "text-slate-600 dark:text-slate-400" : ""}`}
          >
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
