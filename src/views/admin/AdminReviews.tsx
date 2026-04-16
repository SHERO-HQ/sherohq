"use client";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { MessageSquare, Trash2, Search, Star, Loader2 } from "lucide-react";
import { useAdminReviews, useDeleteReview } from "@/hooks/queries/useReviews";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const AdminReviews = () => {
 const { data: reviews = [], isLoading } = useAdminReviews(ADMIN_POLLING_INTERVAL);
 const deleteMutation = useDeleteReview();
 const { addNotification } = useNotifications();

 const [searchQuery, setSearchQuery] = useState("");
 const [deleteId, setDeleteId] = useState<string | null>(null);

 const filteredReviews = reviews.filter(
 (review) =>
 review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
 review.productId.toLowerCase().includes(searchQuery.toLowerCase()),
 );

 const handleDelete = async () => {
 if (!deleteId) return;
 try {
 await deleteMutation.mutateAsync(deleteId);
 addNotification("Success", "Review deleted successfully", "success");
 setDeleteId(null);
 } catch (error) {
 console.error("Failed to delete review:", error);
 addNotification("Error", "Failed to delete review", "error");
 }
 };

 const renderContent = () => {
 if (isLoading) {
 return (
 <div className="flex items-center justify-center py-20">
 <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
 </div>
 );
 }

 if (filteredReviews.length === 0) {
 return (
 <div className="text-center py-20 bg-slate-800/30 rounded border border-white/5">
 <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
 <p className="text-slate-400">No reviews found</p>
 </div>
 );
 }

 return (
 <div className="grid gap-4">
 {filteredReviews.map((review) => (
 <div
 key={review.id}
 className="bg-slate-800/30 border border-white/5 rounded p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-800/50 transition-colors"
 >
 <div className="flex-1 space-y-2">
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-1 text-yellow-400">
 <Star className="w-4 h-4 fill-current" />
 <span className="font-bold">{review.rating}</span>
 </div>
 <span className="text-slate-500">•</span>
 <span className="font-medium text-white">
 {review.userName}
 </span>
 <span className="text-slate-500 text-sm">
 on Product ID: {review.productId}
 </span>
 </div>
 <p className="text-slate-300 leading-relaxed">{review.comment}</p>
 <p className="text-xs text-slate-500">
 Posted on {format(new Date(review.createdAt), "PPP")}
 </p>
 </div>
 <div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setDeleteId(review.id)}
 className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
 >
 <Trash2 className="w-4 h-4 mr-2" />
 Delete
 </Button>
 </div>
 </div>
 ))}
 </div>
 );
 };

 return (
 <AdminLayout>
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-white flex items-center gap-3">
 <Star className="w-7 h-7 text-yellow-400" />
 Product Reviews
 </h1>
 <p className="text-slate-400 text-sm mt-1">
 Manage and moderate customer reviews
 </p>
 </div>
 <div className="relative w-64">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
 <Input
 placeholder="Search reviews..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:ring-emerald-500/20"
 />
 </div>
 </div>

 {renderContent()}

 <ConfirmDialog
 isOpen={!!deleteId}
 title="Delete Review"
 message="Are you sure you want to delete this review? This action cannot be undone."
 onConfirm={handleDelete}
 onClose={() => setDeleteId(null)}
 confirmText="Delete"
 variant="danger"
 />
 </div>
 </AdminLayout>
 );
};

export default AdminReviews;
