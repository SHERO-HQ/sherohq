"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Send, CheckCircle2, AlertCircle, Loader2, BookOpen, ChevronRight } from "lucide-react";
import { createTicket } from "@/services/api";
import {
  supportTicketSchema,
  type SupportTicketInput,
} from "@/lib/validations/support";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useGuides } from "@/hooks/queries/useGuides";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link";

interface SupportTicketFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultCategory?: string;
}

const SupportTicketForm = ({
  isOpen,
  onClose,
  defaultSubject = "",
  defaultCategory = "General",
}: SupportTicketFormProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketNo, setTicketNo] = useState<number | null>(null);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SupportTicketInput>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: defaultSubject,
      category: defaultCategory,
      message: "",
      priority: "medium",
    },
  });

  const subject = watch("subject");
  const debouncedSubject = useDebounce(subject, 300);
  const { data: guides } = useGuides();

  const suggestedGuides = useMemo(() => {
    if (!debouncedSubject || debouncedSubject.length < 3 || !guides) return [];
    const query = debouncedSubject.toLowerCase();
    return guides.filter(
      (guide) =>
        guide.title.toLowerCase().includes(query) ||
        guide.summary.toLowerCase().includes(query)
    ).slice(0, 3);
  }, [debouncedSubject, guides]);

  const onSubmit = async (data: SupportTicketInput) => {
    setLoading(true);
    setError("");

    try {
      const response = await createTicket({
        ...data,
        // Let the backend handle userId from the token if needed, or pass undefined for now since we don't have the UUID handy
        userId: undefined,
      });
      setTicketNo(response.ticketNo);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setTicketNo(null);
        reset();
      }, 5000); // Give user more time to see the ticket number
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit ticket. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "General", label: "General" },
    { value: "Hardware", label: "Hardware" },
    { value: "Software", label: "Software" },
    { value: "Order Issue", label: "Order Issue" },
    { value: "Billing", label: "Billing" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50  z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-900 rounded shadow z-50 p-6 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 pr-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Submit a Support Ticket
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                We're here to help. Fill out the form below and we'll get back
                to you shortly.
              </p>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-brand-secondary-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Ticket Submitted!
                </h3>
                {ticketNo && (
                  <div className="bg-brand-secondary-500/10 border border-brand-secondary-500/20 rounded px-4 py-2 mb-4">
                    <span className="text-brand-secondary-600 dark:text-brand-secondary-400 font-mono font-bold text-lg">
                      Ticket #{ticketNo}
                    </span>
                  </div>
                )}
                <p className="text-slate-600 dark:text-slate-400">
                  We've received your request and will respond via email. Please
                  keep your ticket number for reference.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    placeholder="John Doe"
                    error={errors.name?.message}
                    {...register("name")}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>

                <Input
                  label="Phone Number (Optional)"
                  type="tel"
                  placeholder="+233 50 000 0000"
                  error={errors.phone?.message}
                  {...register("phone")}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Category"
                    options={categories}
                    error={errors.category?.message}
                    {...register("category")}
                  />
                  <div className="space-y-1">
                    <Input
                      label="Subject"
                      placeholder="Brief summary"
                      error={errors.subject?.message}
                      {...register("subject")}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Smart FAQ Suggestions */}
                <AnimatePresence>
                  {suggestedGuides.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-brand-secondary-50 dark:bg-brand-secondary-500/5 rounded-lg border border-brand-secondary-200 dark:border-brand-secondary-500/20 p-4 space-y-3">
                        <div className="flex items-center gap-2 text-brand-secondary-700 dark:text-brand-secondary-400 font-semibold text-sm">
                          <BookOpen className="w-4 h-4" />
                          <span>Suggested Articles</span>
                        </div>
                        <ul className="space-y-2">
                          {suggestedGuides.map((guide) => (
                            <li key={guide.id}>
                              <Link
                                href={`/guides/${guide.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-start gap-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-3 hover:border-brand-secondary-300 dark:hover:border-brand-secondary-500/50 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors">
                                    {guide.title}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    {guide.summary}
                                  </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-secondary-500 transition-colors flex-shrink-0 mt-1" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Textarea
                  label="Message"
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  error={errors.message?.message}
                  {...register("message")}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  variant="brand"
                  className="w-full h-10 text-base font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SupportTicketForm;
