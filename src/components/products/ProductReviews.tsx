"use client";
import { useState, useEffect, useCallback } from "react";
import { Star, User, Loader2, MessageSquare, PenLine } from "lucide-react";
import {
 getProductReviews,
 submitProductReview,
 type Review,
} from "@/services/api";
import { useNotifications } from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "motion/react";

interface ProductReviewsProps {
 productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
 const [reviews, setReviews] = useState<Review[]>([]);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const { addNotification } = useNotifications();

 // Form State
 const [rating, setRating] = useState(5);
 const [name, setName] = useState("");
 const [comment, setComment] = useState("");
 const [hoveredRating, setHoveredRating] = useState(0);

 const fetchReviews = useCallback(async () => {
 try {
 const data = await getProductReviews(productId);
 setReviews(data);
 } catch (error) {
 console.error("Failed to load reviews", error);
 } finally {
 setLoading(false);
 }
 }, [productId]);

 useEffect(() => {
 fetchReviews();
 }, [fetchReviews]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!name.trim()) return;

 setSubmitting(true);
 try {
 await submitProductReview(productId, {
 userName: name,
 rating,
 comment,
 });

 setName("");
 setComment("");
 setRating(5);
 fetchReviews();
 addNotification(
 "Review Submitted",
 "Your feedback has been integrated into our store.",
 "success",
 );
 } catch (error) {
 console.error("Error submitting review:", error);
 addNotification(
 "Review Error",
 "Failed to submit review. Please try again.",
 "error",
 );
 } finally {
 setSubmitting(false);
 }
 };

 return (
 <div className="space-y-12">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
 <div>
 <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
 Customer <span className="text-emerald-500">Feedback</span>
 </h2>
 <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
 {reviews.length} Verified Reviews
 </p>
 </div>
 </div>

 <div className="grid lg:grid-cols-12 gap-12">
 {/* Reviews List */}
 <div className="lg:col-span-7 space-y-8">
 {loading ? (
 <div className="flex flex-col items-center justify-center p-20 gap-4 text-slate-500">
 <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
 <span className="text-xs font-black uppercase tracking-widest">Gathering Experiences...</span>
 </div>
 ) : reviews.length === 0 ? (
 <div className="rounded bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 p-12 text-center">
 <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
 <p className="text-slate-500 dark:text-slate-400 font-bold">
 No reviews yet. Be the first to share your thoughts.
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-6">
 <AnimatePresence mode="popLayout">
 {reviews.map((review, idx) => (
 <motion.div
 key={review.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.1 }}
 className="p-8 rounded bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 shadow shadow-black/5"
 >
 <div className="flex items-start justify-between mb-6">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
 <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
 </div>
 <div>
 <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">
 {review.userName}
 </h4>
 <span className="text-xs font-bold text-slate-500">
 {new Date(review.createdAt).toLocaleDateString(undefined, {
 year: 'numeric',
 month: 'long',
 day: 'numeric'
 })}
 </span>
 </div>
 </div>
 <div className="flex gap-0.5">
 {[...Array(5)].map((_, i) => (
 <Star
 key={i}
 size={14}
 className={`${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-800"}`}
 />
 ))}
 </div>
 </div>
 <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
 "{review.comment}"
 </p>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 )}
 </div>

 {/* Review Form */}
 <div className="lg:col-span-5 h-fit lg:sticky lg:top-24">
 <div className="p-8 rounded bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 shadow overflow-hidden relative group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
 
 <div className="relative">
 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
 <PenLine size={20} className="text-emerald-500" /> Shape the <span className="text-emerald-500">Future</span>
 </h3>
 
 <form onSubmit={handleSubmit} className="space-y-6">
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
 Product Experience
 </label>
 <div className="flex gap-2">
 {[1, 2, 3, 4, 5].map((star) => (
 <button
 key={star}
 type="button"
 onClick={() => setRating(star)}
 onMouseEnter={() => setHoveredRating(star)}
 onMouseLeave={() => setHoveredRating(0)}
 className="focus:outline-none transition duration-300 hover:scale-125 hover:-translate-y-1"
 >
 <Star
 size={28}
 className={`transition ${
 star <= (hoveredRating || rating)
 ? "text-amber-400 fill-amber-400 drop-shadow-sm"
 : "text-slate-200 dark:text-slate-700"
 }`}
 />
 </button>
 ))}
 </div>
 </div>

 <div className="space-y-4">
 <div>
 <input
 type="text"
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full px-6 py-4 rounded border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-black/40 outline-none transition"
 placeholder="Your Public Name"
 />
 </div>

 <div>
 <textarea
 required
 value={comment}
 onChange={(e) => setComment(e.target.value)}
 rows={4}
 className="w-full px-6 py-4 rounded border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-black/40 outline-none transition resize-none"
 placeholder="What was your experience like?"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={submitting}
 className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs rounded shadow shadow-emerald-500/20 transition active:scale-[0.98] flex items-center justify-center gap-3"
 >
 {submitting ? (
 <>
 <Loader2 className="w-5 h-5 animate-spin" /> 
 <span className="animate-pulse">Broadcasting...</span>
 </>
 ) : (
 "Publish Review"
 )}
 </button>
 </form>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default ProductReviews;
