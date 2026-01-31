import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { createTicket } from "@/services/api";
import {
  supportTicketSchema,
  type SupportTicketInput,
} from "@/lib/validations/support";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportTicketInput>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: defaultSubject,
      category: defaultCategory,
      message: "",
      priority: "medium",
    },
  });

  const onSubmit = async (data: SupportTicketInput) => {
    setLoading(true);
    setError("");

    try {
      await createTicket({
        ...data,
        userId: localStorage.getItem("userToken") ? "authenticated" : undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        reset();
      }, 2000);
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-900 rounded shadow-2xl z-50 p-6 border border-slate-200 dark:border-slate-800"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
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
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Ticket Submitted!
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  We've received your request and will respond via email.
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

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Category"
                    options={categories}
                    error={errors.category?.message}
                    {...register("category")}
                  />
                  <Input
                    label="Subject"
                    placeholder="Brief summary"
                    error={errors.subject?.message}
                    {...register("subject")}
                  />
                </div>

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
                  className="w-full h-12 text-base font-bold"
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
