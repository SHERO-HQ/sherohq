"use client";
import { motion } from "motion/react";
import {
  Quote,
  UserCheck,
  MessageSquarePlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import FeedbackModal from "@/components/common/FeedbackModal";
import { useTestimonials } from "@/hooks/queries/useTestimonials";
import ProductImage from "@/components/common/ProductImage";

// Helper to get initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const AboutTestimonials = () => {
  const { data: testimonials = [], isLoading } = useTestimonials();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const nextSlide = useCallback(() => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevSlide = useCallback(() => {
    if (testimonials.length === 0) return;
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  }, [testimonials.length]);

  // Auto-slide effect
  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, testimonials.length]);

  if (!isLoading && testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden relative border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-emerald-500/20 to-transparent" />

      {/* Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none transition-colors duration-300" />

      <div className="container px-4 md:px-6 relative z-10 w-full mx-auto md:w-10/12">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded uppercase transition-colors duration-300">
            <UserCheck className="w-4 h-4" />
            Client Voices
          </span>
          <h2 className="text-3xl md:text-5xl font-sora font-bold text-slate-900 dark:text-white mt-2 mb-4 transition-colors duration-300">
            Trusted by Leaders
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto mb-20">
          {/* Desktop/Side Controls */}
          <button
            onClick={prevSlide}
            className="cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-emerald-600 dark:hover:text-white hover:border-emerald-500 transition-colors z-20 hidden md:block shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-emerald-600 dark:hover:text-white hover:border-emerald-500 transition-colors z-20 hidden md:block shadow-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="overflow-hidden relative min-h-[400px]">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-full max-w-2xl bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-md p-8 md:p-12 rounded border border-slate-200 dark:border-white/5 animate-pulse">
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded mb-10" />
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div>
                      <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {testimonials.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                    <Quote className="size-12 mb-4 opacity-20" />
                    <p>No testimonials to display</p>
                  </div>
                ) : (
                  <motion.div
                    initial={false}
                    animate={{ x: `-${currentIndex * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex"
                  >
                    {testimonials.map((item) => (
                      <div
                        key={item.id || item.author}
                        className="w-full shrink-0 sm:px-4"
                      >
                        <div className="h-full bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-md sm:p-8 p-6 md:p-12 rounded border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 transition-all duration-300 flex flex-col relative group">
                          <div className="absolute lg:top-8 top-3 right-3 p-3 transition-colors duration-300">
                            <Quote className="size-10 text-emerald-500/40 -z-10" />
                          </div>

                          <blockquote className="text-slate-700 dark:text-slate-300 italic mb-10 relative z-10 leading-relaxed font-light transition-colors duration-300">
                            "{item.quote}"
                          </blockquote>

                          <div className="mt-auto flex items-center gap-4">
                            {/* Avatar with Fallback */}
                            <div className="relative w-14 h-14 rounded shadow border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 transition-colors duration-300">
                              {item.image ? (
                                <ProductImage
                                  src={item.image}
                                  alt={item.author}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-linear-to-br from-blue-600 to-emerald-600 flex items-center justify-center text-white font-bold text-sm tracking-wider">
                                  {getInitials(item.author)}
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="font-bold font-sora text-slate-900 dark:text-white text-base transition-colors duration-300">
                                {item.author}
                              </h4>
                              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                {item.role}
                                {item.company ? `, ${item.company}` : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Dots and Mobile Controls */}
          <div className="flex flex-col items-center gap-6 mt-8">
            <div className="flex items-center gap-4 md:hidden">
              <button
                onClick={prevSlide}
                className="cursor-pointer p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 transition-colors active:border-emerald-500 shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((item) => (
                  <button
                    key={`dot-${item.author}`}
                    onClick={() => setCurrentIndex(testimonials.indexOf(item))}
                    className={`h-2 rounded transition-all duration-300 ${
                      testimonials.indexOf(item) === currentIndex
                        ? "w-8 bg-emerald-500"
                        : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-500"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextSlide}
                className="cursor-pointer p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 transition-colors active:border-emerald-500 shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="hidden md:flex gap-2">
              {testimonials.map((item) => (
                <button
                  key={`desktop-dot-${item.author}`}
                  onClick={() => setCurrentIndex(testimonials.indexOf(item))}
                  className={`h-2 rounded transition-all duration-300 ${
                    testimonials.indexOf(item) === currentIndex
                      ? "w-8 bg-emerald-500"
                      : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-500"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Feedback CTA */}
        <div className="cursor-pointer text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex flex-col items-center gap-4 p-8 rounded bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl relative overflow-hidden max-w-lg mx-auto w-full transition-all duration-300"
          >
            <div className="p-3 bg-emerald-500/10 rounded text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors duration-300">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold font-sora text-slate-900 dark:text-white mb-2 transition-colors duration-300">
                Have Feedback?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 transition-colors duration-300">
                We value your input! Help us improve our products and services.
              </p>
              <button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="cursor-pointer px-8 py-2 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20 w-full sm:w-auto"
              >
                Share Your Thoughts
              </button>
            </div>
          </motion.div>
        </div>

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      </div>
    </section>
  );
};

export default AboutTestimonials;
