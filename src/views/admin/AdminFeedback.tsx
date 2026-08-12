"use client";
import { useState } from "react";
import { MessageSquare, Trash2, Search, Star, Loader2, Share } from "lucide-react";
import { useAdminFeedback, useDeleteFeedback, usePromoteFeedback } from "@/hooks/queries/useFeedback";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/utils/error";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useDialog } from "@/hooks/useDialog";

const FeedbackTableSkeleton = () => (
  <div className="grid gap-4 animate-pulse select-none">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-muted/20 border border-border rounded p-6 flex flex-col md:flex-row gap-6"
      >
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-4 w-24 bg-accent rounded" />
            <div className="h-3 w-32 bg-accent/50 rounded" />
          </div>
          <div className="h-4 w-3/4 bg-accent rounded" />
          <div className="h-3 w-24 bg-accent/50 rounded" />
        </div>
        <div className="flex gap-2 mt-auto md:mt-0">
          <div className="h-8 w-24 bg-accent/50 rounded" />
          <div className="h-8 w-20 bg-accent/50 rounded" />
        </div>
      </div>
    ))}
  </div>
);

const AdminFeedback = () => {
  const { data: feedback = [], isLoading } = useAdminFeedback(ADMIN_POLLING_INTERVAL);
  const deleteMutation = useDeleteFeedback();
  const promoteMutation = usePromoteFeedback();
  const { addNotification } = useNotifications();
  const dialog = useDialog();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredFeedback = feedback.filter(
    (item) =>
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteFeedback = async (id: number) => {
    const confirmed = await dialog.confirm({
      title: "Delete Feedback",
      message: "Are you sure you want to delete this feedback item? This action cannot be undone.",
      type: "error",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    deleteMutation.mutate(id, {
      onSuccess: () => {
        addNotification("Success", "Feedback deleted successfully", "success");
      },
      onError: (error) => {
        console.error("Failed to delete feedback:", error);
        addNotification("Error", getErrorMessage(error, "Failed to delete feedback"), "error");
      },
    });
  };

  const handlePromote = async (id: number) => {
    try {
      await promoteMutation.mutateAsync(id);
      addNotification("Success", "Feedback promoted to Testimonial! It is currently inactive so you can review it.", "success");
    } catch (error) {
       console.error("Failed to promote feedback:", error);
       addNotification("Error", getErrorMessage(error, "Failed to promote feedback"), "error");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <FeedbackTableSkeleton />;
    }

    if (filteredFeedback.length === 0) {
      return (
        <div className="text-center py-20 bg-muted/30 rounded border border-border">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-muted-foreground">No feedback found</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {filteredFeedback.map((item) => {
          return (
            <div
              key={item.id}
              className="bg-muted/30 border border-border rounded p-6 flex flex-col md:flex-row gap-6 hover:bg-muted/50 transition-colors relative overflow-hidden"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  {item.rating && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold">{item.rating}</span>
                    </div>
                  )}
                  {item.rating && <span className="text-muted-foreground">•</span>}
                  <span className="font-bold text-foreground">
                    {item.name || "Anonymous"}
                  </span>
                  {item.email && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground text-sm">
                        {item.email}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed italic">"{item.message}"</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    Submitted on {format(new Date(item.createdAt), "PPP")}
                  </p>
                  {item.page && (
                    <>
                      <span className="text-muted-foreground text-xs">•</span>
                      <p className="text-xs text-muted-foreground">From page: {item.page}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 relative z-5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePromote(item.id)}
                  disabled={promoteMutation.isPending}
                  className="h-9 px-3 rounded border-brand-secondary-500/20 text-brand-secondary-400 hover:bg-brand-secondary-500/10"
                >
                  {promoteMutation.isPending ? (
                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                     <Share className="w-4 h-4 mr-2" />
                  )}
                  Promote to Testimonial
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFeedback(item.id)}
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
        icon={MessageSquare}
        title="Site Feedback"
        description="Manage general feedback submitted by users"
      >
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 border-border text-foreground placeholder:text-slate-600 focus:ring-brand-secondary-500/20"
          />
        </div>
      </AdminPageHeader>

      {renderContent()}
    </div>
  );
};

export default AdminFeedback;
