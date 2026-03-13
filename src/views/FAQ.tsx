"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      category: "General",
      items: [
        {
          q: "Do you ship internationally?",
          a: "Currently, we focus on serving the West African market (Ghana, Nigeria, Ivory Coast). However, for large enterprise orders, we can discuss international logistics arrangements.",
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
  ];

  return (
    <>
      <div className="pt-24 pb-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-semibold text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 rounded-full border border-emerald-500/20 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span className="text-emerald-600 dark:text-emerald-400">
                Help Center
              </span>
            </div>
            <h1 className="text-3xl md:text-6xl font-sora font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Answers to common{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-blue-600 dark:to-blue-400">
                product questions
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-base leading-relaxed">
              Fast answers on orders, warranty, services, and support so you can
              make decisions confidently.
            </p>
          </div>

          <div className="space-y-12">
            {faqs.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-xl font-sora font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-800 pb-2 uppercase">
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
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span
          className={`font-semibold pr-8 ${isOpen ? "text-emerald-600 dark:text-emerald-400" : ""}`}
        >
          {question}
        </span>
        <span className="text-emerald-600 dark:text-emerald-400 shrink-0">
          {isOpen ? (
            <Minus className="w-5 h-5" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className={`p-6 pt-2 leading-relaxed border-t border-slate-100 dark:border-slate-800/50 ${isOpen ? "text-slate-600 dark:text-slate-400" : ""}`}
            >
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FAQ;
