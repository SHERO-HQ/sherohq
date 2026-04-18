"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Star, Send, CheckCircle2, Loader2 } from "lucide-react";
import { sendContactMessage } from "@/services/api";

interface FeedbackModalProps {
 isOpen: boolean;
 onClose: () => void;
}

// Helper function to get rating label
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

export default function FeedbackModal({
 isOpen,
 onClose,
}: Readonly<FeedbackModalProps>) {
 const [status, setStatus] = useState<
 "idle" | "submitting" | "success" | "error"
 >("idle");
 const [rating, setRating] = useState(0);
 const [hoveredRating, setHoveredRating] = useState(0);
 const [formData, setFormData] = useState({
 name: "",
 email: "",
 message: "",
 });

 // Reset form state when modal closes (not opens, to avoid cascading renders)
 const resetForm = useCallback(() => {
 setStatus("idle");
 setRating(0);
 setFormData({ name: "", email: "", message: "" });
 }, []);

 // Handle close with reset
 const handleClose = useCallback(() => {
 onClose();
 // Reset after animation completes
 setTimeout(resetForm, 300);
 }, [onClose, resetForm]);

 // Handle escape key
 const handleKeyDown = useCallback(
 (e: KeyboardEvent) => {
 if (e.key === "Escape") {
 handleClose();
 }
 },
 [handleClose],
 );

 useEffect(() => {
 if (isOpen) {
 document.addEventListener("keydown", handleKeyDown);
 document.body.style.overflow = "hidden";
 }
 return () => {
 document.removeEventListener("keydown", handleKeyDown);
 document.body.style.overflow = "";
 };
 }, [isOpen, handleKeyDown]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setStatus("submitting");

 try {
 await sendContactMessage({
 name: formData.name,
 email: formData.email,
 subject: "feedback",
 message: `[Rating: ${rating}/5 stars]\n\n${formData.message}`,
 });
 setStatus("success");
 } catch (error) {
 console.error("Feedback submission error:", error);
 setStatus("error");
 }
 };

 const handleBackdropClick = (e: React.MouseEvent) => {
 if (e.target === e.currentTarget) {
 handleClose();
 }
 };

 return (
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={handleBackdropClick}
 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 "
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 transition={{ type: "spring", damping: 25, stiffness: 300 }}
 className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded shadow border border-slate-200 dark:border-slate-800 overflow-hidden"
 >
 {/* Header */}
 <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
 <h2 className="text-sm font-bold text-slate-900 dark:text-white">
 Share Your Feedback
 </h2>
 <button
 onClick={handleClose}
 className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
 aria-label="Close modal"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Content */}
 {status === "success" ? (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="p-6 text-center"
 >
 <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-secondary-100 dark:bg-brand-secondary-900/30 flex items-center justify-center">
 <CheckCircle2 className="w-8 h-8 text-brand-secondary-600 dark:text-brand-secondary-400" />
 </div>
 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
 Thank You!
 </h3>
 <p className="text-slate-600 dark:text-slate-400 mb-6">
 Your feedback has been submitted successfully. We appreciate
 your input!
 </p>
 <button
 onClick={handleClose}
 className="px-6 py-2 bg-brand-secondary-600 text-white rounded font-medium hover:bg-brand-secondary-500 transition-colors"
 >
 Close
 </button>
 </motion.div>
 ) : (
 <form onSubmit={handleSubmit} className="p-4 space-y-4">
 {/* Star Rating */}
 <div className="text-center">
 <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
 How would you rate your experience?
 </p>
 <div className="flex justify-center gap-1">
 {[1, 2, 3, 4, 5].map((value) => (
 <button
 key={value}
 type="button"
 onClick={() => setRating(value)}
 onMouseEnter={() => setHoveredRating(value)}
 onMouseLeave={() => setHoveredRating(0)}
 className="p-1 transition-transform hover:scale-110"
 aria-label={`Rate ${value} stars`}
 >
 <Star
 className={`w-8 h-8 transition-colors ${
 value <= (hoveredRating || rating)
 ? "fill-amber-400 text-amber-400"
 : "text-slate-300 dark:text-slate-600"
 }`}
 />
 </button>
 ))}
 </div>
 {rating > 0 && (
 <p className="text-xs text-slate-500 mt-1">
 {getRatingLabel(rating)}
 </p>
 )}
 </div>

 {/* Name & Email */}
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label
 htmlFor="feedback-name"
 className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
 >
 Name
 </label>
 <input
 id="feedback-name"
 type="text"
 required
 value={formData.name}
 onChange={(e) =>
 setFormData({ ...formData, name: e.target.value })
 }
 className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50 focus:border-brand-secondary-500"
 placeholder="Your name"
 />
 </div>
 <div>
 <label
 htmlFor="feedback-email"
 className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
 >
 Email
 </label>
 <input
 id="feedback-email"
 type="email"
 required
 value={formData.email}
 onChange={(e) =>
 setFormData({ ...formData, email: e.target.value })
 }
 className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50 focus:border-brand-secondary-500"
 placeholder="you@example.com"
 />
 </div>
 </div>

 {/* Message */}
 <div>
 <label
 htmlFor="feedback-message"
 className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
 >
 Your Feedback
 </label>
 <textarea
 id="feedback-message"
 required
 rows={3}
 value={formData.message}
 onChange={(e) =>
 setFormData({ ...formData, message: e.target.value })
 }
 className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50 focus:border-brand-secondary-500 resize-none"
 placeholder="Tell us what you think..."
 />
 </div>

 {/* Error message */}
 {status === "error" && (
 <p className="text-sm text-red-600 dark:text-red-400 text-center">
 Failed to submit feedback. Please try again.
 </p>
 )}

 {/* Submit Button */}
 <button
 type="submit"
 disabled={status === "submitting" || rating === 0}
 className="w-full py-2 bg-brand-secondary-600 text-white rounded font-medium hover:bg-brand-secondary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {status === "submitting" ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 Submitting...
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
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
}
