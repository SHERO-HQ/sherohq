"use client";
import { useState } from "react";
import { m, AnimatePresence } from "motion/react";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { SectionBadge } from "@/components/common/SectionBadge";
import Link from "next/link";
import { COMPANY_EMAILS } from "@/constants/emails";

const FAQ = () => {
  const faqs = [
    {
      category: "General",
      items: [
        {
          q: "Do you ship internationally?",
          a: "Currently, we focus on serving businesses across Ghana and the regional market. For large custom or commercial orders, we can discuss specialized logistics arrangements.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept Mobile Money (MTN, Vodafone/Telecel, AT), Visa/Mastercard payments, and direct bank transfers for corporate clients.",
        },
        {
          q: "Where is your physical office located?",
          a: "We are located in Tamale, Northern Region, Ghana. You can find our exact location on the Contact Us page.",
        },
      ],
    },
    {
      category: "Orders & Delivery",
      items: [
        {
          q: "How long does delivery usually take?",
          a: "Delivery within Tamale takes 1-2 business days. National deliveries across Ghana typically take 3-5 business days. Regional deliveries (Nigeria, Ivory Coast) may take 7-14 business days.",
        },
        {
          q: "How can I track my order?",
          a: (
            <>
              Once your order is dispatched, you will receive an email and SMS with a tracking link to monitor your delivery status in real-time. You can also track your order directly on our{" "}
              <Link
                href="/track-order"
                className="text-brand-secondary-600 hover:underline font-medium"
              >
                Track Order
              </Link>{" "}
              page.
            </>
          ),
        },
        {
          q: "What is your return policy?",
          a: "We offer a 7-day return window for defective products. The item must be in its original packaging with all accessories included.",
        },
      ],
    },
    {
      category: "Products & Warranty",
      items: [
        {
          q: "What is the warranty period for laptops?",
          a: "All our products come with a standard warranty. We also offer an optional extended warranty plan depending on the product and your needs.",
        },
        {
          q: "Do you sell refurbished items?",
          a: "Yes we do! We have a specific certified refurbished section which is clearly labeled.",
        },
      ],
    },
    {
      category: "Services",
      items: [
        {
          q: "Do you offer installation services?",
          a: "Yes! For networking equipment, servers, and office setups, our technical team provides full on-site installation and configuration services.",
        },
        {
          q: "Can you develop custom software for my business?",
          a: "Absolutely. Our software development team specializes in building custom ERPs, mobile apps, and web platforms tailored to your specific business needs.",
        },
      ],
    },
    {
      category: "Support & Managed Services",
      items: [
        {
          q: "How do I contact technical support?",
          a: (
            <>
              You can reach our technical support team via the ticketing system on your dashboard, by emailing{" "}
              <a
                href={`mailto:${COMPANY_EMAILS.SUPPORT}`}
                className="text-brand-secondary-600 hover:underline font-medium"
              >
                {COMPANY_EMAILS.SUPPORT}
              </a>
              , or through our dedicated WhatsApp support line.
            </>
          ),
        },
        {
          q: "Do you offer bulk discounts for corporate clients?",
          a: "Yes, we provide specialized B2B pricing, bulk discounts, and dedicated account managers for corporate and educational institutions. Please contact our sales team for a formal quotation.",
        },
      ],
    },
  ];

  return (
    <>
      <div className="pt-8 pb-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <SectionBadge icon={HelpCircle} className="mb-4">
              Help Center
            </SectionBadge>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight transition-colors duration-300">
              Answers to common{" "}
              <span className="text-brand-secondary-600">Questions</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-base leading-relaxed">
              Fast answers on orders, warranty, services, and support so you can
              make decisions confidently.
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
          className={`font-semibold pr-8 ${isOpen ? "text-brand-secondary-600 dark:text-brand-secondary-400" : ""}`}
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
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className={`p-6 px-6 pt-2 leading-relaxed border-t border-slate-100 dark:border-slate-800/50 ${isOpen ? "text-slate-600 dark:text-slate-400" : ""}`}
            >
              {answer}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FAQ;
