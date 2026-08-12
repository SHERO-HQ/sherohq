"use client";
import { useState, useEffect } from "react";

import { MessageSquare, Trash2, Search, Star, Plus, Loader2 } from "lucide-react";
import { useAdminReviews, useDeleteReview, useSubmitReview } from "@/hooks/queries/useReviews";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/Modal";
import { getErrorMessage } from "@/utils/error";
import { useDialog } from "@/hooks/useDialog";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const ReviewsTableSkeleton = () => (
  <div className="grid gap-4 animate-pulse select-none">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-muted/20 border border-border rounded p-6 flex flex-col md:flex-row gap-6"
      >
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-4 w-12 bg-accent rounded" />
            <div className="h-3 w-20 bg-accent/50 rounded" />
            <div className="h-3 w-32 bg-accent/50 rounded" />
          </div>
          <div className="h-4 w-3/4 bg-accent rounded" />
          <div className="h-3 w-24 bg-accent/50 rounded" />
        </div>
        <div className="h-8 w-20 bg-accent/50 rounded mt-auto md:mt-0" />
      </div>
    ))}
  </div>
);

const AdminReviews = () => {
  const { data: reviews = [], isLoading } = useAdminReviews(ADMIN_POLLING_INTERVAL);
  const deleteMutation = useDeleteReview();
  const { addNotification } = useNotifications();
  const dialog = useDialog();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    userName: "",
    rating: 5,
    comment: "",
  });
  const submitMutation = useSubmitReview();

  const filteredReviews = reviews.filter(
    (review) =>
      review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.productId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDeleteReview = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: "Delete Review",
      message: "Are you sure you want to delete this customer review? This action cannot be undone.",
      type: "error",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    deleteMutation.mutate(id, {
      onSuccess: () => {
        addNotification("Success", "Review deleted successfully", "success");
      },
      onError: (error) => {
        console.error("Failed to delete review:", error);
        addNotification("Error", getErrorMessage(error, "Failed to delete review"), "error");
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitMutation.mutateAsync({
        productId: formData.productId,
        data: {
          userName: formData.userName,
          rating: formData.rating,
          comment: formData.comment,
        },
      });
      addNotification("Success", "Review added successfully", "success");
      setIsModalOpen(false);
      setFormData({ productId: "", userName: "", rating: 5, comment: "" });
    } catch (error) {
      console.error("Failed to add review:", error);
      addNotification("Error", getErrorMessage(error, "Failed to add review"), "error");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <ReviewsTableSkeleton />;
    }

    if (filteredReviews.length === 0) {
      return (
        <div className="text-center py-20 bg-muted/30 rounded border border-border">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-muted-foreground">No reviews found</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {filteredReviews.map((review) => {
          return (
            <div
              key={review.id}
              className="bg-muted/30 border border-border rounded p-6 flex flex-col md:flex-row gap-6 hover:bg-muted/50 transition-colors relative overflow-hidden"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold">{review.rating}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-medium text-foreground">
                    {review.userName}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    on Product ID: {review.productId}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                <p className="text-xs text-muted-foreground">
                  Posted on {format(new Date(review.createdAt), "PPP")}
                </p>
              </div>
              <div className="relative z-5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteReview(review.id)}
                  className="text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 h-9 px-3 rounded"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Star}
        title="Product Reviews"
        description="Manage and moderate customer reviews"
      >
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 border-border text-foreground placeholder:text-slate-600 focus:ring-brand-secondary-500/20"
          />
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Review
        </Button>
      </AdminPageHeader>

      {renderContent()}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Manual Review"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productId">Product ID</Label>
            <Input
              id="productId"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              required
              placeholder="e.g. prod_123"
              className="bg-muted border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName">User Name</Label>
            <Input
              id="userName"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              required
              className="bg-muted border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              required
              className="bg-muted border-border min-h-[100px]"
            />
          </div>

          <div className="space-y-3 py-2 border-t border-border">
            <Label>Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: val })}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      val <= formData.rating ? "fill-amber-400 text-amber-400" : "text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground"
            >
              {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminReviews;
