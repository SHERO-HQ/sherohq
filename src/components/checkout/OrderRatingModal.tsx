"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Star, Send, Loader2, CheckCircle2 } from "lucide-react";
import { sendContactMessage } from "@/services/api";
import { COMPANY_EMAILS } from "@/constants/emails";

interface OrderRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

function getRatingLabel(rating: number): string {
  const labels: Record<number, string> = {
    5: "Excellent!",
    4: "Great!",
    3: "Good",
    2: "Fair",
    1: "Poor",
  };
  return labels[rating] || "";
}

export default function OrderRatingModal({
  isOpen,
  onClose,
  orderId,
}: Readonly<OrderRatingModalProps>) {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const resetForm = useCallback(() => {
    setStatus("idle");
    setRating(0);
    setComment("");
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(resetForm, 300);
  }, [onClose, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setStatus("submitting");
    try {
      // Reusing the contact message API as requested by user plan
      // Ideally this would be a dedicated review API but this works for now
      await sendContactMessage({
        name: "Verified Customer",
        email: COMPANY_EMAILS.NOREPLY, // Or fetch from context if available
        subject: `Order Rating: #${orderId}`,
        message: `Order ID: ${orderId}\nRating: ${rating}/5 (${getRatingLabel(rating)})\nComment: ${comment}`,
      });
      setStatus("success");
      // Auto close after success? Maybe let user close manually to see confirmation
    } catch (error) {
      console.error("Failed to submit rating:", error);
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold font-sora text-slate-900 dark:text-white">
                How was your experience?
              </h3>
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {status === "success" ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Thanks for feedback!
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                    We appreciate your input. It helps us improve for your next
                    order.
                  </p>
                  <button
                    onClick={handleClose}
                    className="w-full py-2 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Stars */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRating(val)}
                          onMouseEnter={() => setHoveredRating(val)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              val <= (hoveredRating || rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300 dark:text-slate-700"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 h-5">
                      {getRatingLabel(hoveredRating || rating)}
                    </span>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Leave a comment (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="The checkout was fast..."
                      className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
                    />
                  </div>

                  {/* Error */}
                  {status === "error" && (
                    <p className="text-xs text-red-500 text-center">
                      Something went wrong. Please try again.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={rating === 0 || status === "submitting"}
                    className="w-full py-2 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
