"use client";
import { useState, useEffect } from "react";
import { } from "@/context/AdminContext";
import { MessageSquare, Trash2, Search, Star} from "lucide-react";
import { useAdminReviews, useDeleteReview } from "@/hooks/queries/useReviews";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/utils/error";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(3);
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timeout | null>(null);

  const filteredReviews = reviews.filter(
    (review) =>
      review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.productId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const startSoftDelete = (id: string) => {
    if (activeTimer) clearTimeout(activeTimer);
    setPendingDeleteId(id);
    setSecondsLeft(3);

    const countdown = (secs: number) => {
      if (secs <= 0) {
        setPendingDeleteId(null);
        deleteMutation.mutate(id, {
          onSuccess: () => {
            addNotification("Success", "Review deleted successfully", "success");
          },
          onError: (error) => {
            console.error("Failed to delete review:", error);
            addNotification("Error", getErrorMessage(error, "Failed to delete review"), "error");
          }
        });
      } else {
        setSecondsLeft(secs);
        const timer = setTimeout(() => countdown(secs - 1), 1000);
        setActiveTimer(timer);
      }
    };

    const timer = setTimeout(() => countdown(2), 1000);
    setActiveTimer(timer);
  };

  const handleCancelDelete = (id: string) => {
    if (activeTimer) {
      clearTimeout(activeTimer);
      setActiveTimer(null);
    }
    setPendingDeleteId(null);
    addNotification("Info", "Deletion cancelled", "info");
  };

  useEffect(() => {
    return () => {
      if (activeTimer) clearTimeout(activeTimer);
    };
  }, [activeTimer]);

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
          const isDeleting = pendingDeleteId === review.id;
          return (
            <div
              key={review.id}
              className="bg-muted/30 border border-border rounded p-6 flex flex-col md:flex-row gap-6 hover:bg-muted/50 transition-colors relative overflow-hidden"
            >
              {isDeleting && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs z-10 flex items-center justify-between px-6 py-4 animate-in fade-in duration-200 select-none">
                  <span className="text-xs font-bold text-rose-400 animate-pulse">
                    Removing review in {secondsLeft}s
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleCancelDelete(review.id)}
                    className="h-8 px-4 bg-accent hover:bg-white/20 text-foreground rounded text-[11px] font-bold transition-all shrink-0"
                  >
                    Undo Deletion
                  </Button>
                </div>
              )}

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
                  onClick={() => startSoftDelete(review.id)}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Star className="w-7 h-7 text-yellow-400" />
            Product Reviews
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and moderate customer reviews
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 border-border text-foreground placeholder:text-slate-600 focus:ring-brand-secondary-500/20"
          />
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default AdminReviews;
