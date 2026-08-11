"use client";

import { getErrorMessage } from "@/utils/error";
import {
  MessageSquareQuote,
  Plus,
  Search,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/Modal";
import { TestimonialCard } from "@/components/admin/testimonials/TestimonialCard";
import { TestimonialFormModal } from "@/components/admin/testimonials/TestimonialFormModal";
import { useAdminTestimonialsState } from "@/components/admin/testimonials/useAdminTestimonialsState";

const TestimonialsGridSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 animate-pulse select-none">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-muted/20 border border-border rounded p-4 flex items-center gap-4"
      >
        <div className="w-5 h-5 bg-accent/50 rounded shrink-0" />
        <div className="w-12 h-12 rounded bg-accent/50 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 bg-accent rounded" />
          <div className="h-3 w-3/4 bg-accent/50 rounded" />
        </div>
        <div className="h-8 w-24 bg-accent/50 rounded" />
      </div>
    ))}
  </div>
);

const AdminTestimonials = () => {
  const {
    isLoading,
    searchQuery,
    setSearchQuery,
    isModalOpen,
    setIsModalOpen,
    deleteModalData,
    setDeleteModalData,
    editingTestimonial,
    confirmModalData,
    setConfirmModalData,
    formData,
    setFormData,
    filteredTestimonials,
    handleOpenCreate,
    handleSubmit,
    toggleActive,
    handleSyncTrustpilot,
    createMutation,
    updateMutation,
    deleteMutation,
    syncTrustpilotMutation,
    addNotification,
  } = useAdminTestimonialsState();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <MessageSquareQuote className="w-7 h-7 text-brand-secondary-400" />
            Testimonials & Feedback
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage customer feedback, reviews, and success stories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSyncTrustpilot}
            disabled={syncTrustpilotMutation.isPending}
            className="bg-blue-600 hover:bg-blue-500 text-foreground"
          >
            {syncTrustpilotMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MessageSquareQuote className="w-4 h-4 mr-2" />
            )}
            Sync Trustpilot
          </Button>
          <Button
            onClick={handleOpenCreate}
            className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search testimonials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card/50 border-border text-foreground placeholder:text-slate-600 focus:ring-brand-secondary-500/20"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <TestimonialsGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTestimonials.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded border border-border">
              <MessageSquareQuote className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-muted-foreground">No testimonials found</p>
            </div>
          ) : (
            filteredTestimonials.map((t) => (
              <TestimonialCard
                key={t.id}
                t={t}
                onConfirmPublish={(testimonial) =>
                  setConfirmModalData({ isOpen: true, testimonial })
                }
                onConfirmDelete={(testimonialId) =>
                  setDeleteModalData({ isOpen: true, testimonialId })
                }
              />
            ))
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <TestimonialFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingTestimonial={editingTestimonial}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData({ isOpen: false, testimonial: null })}
        title={
          confirmModalData.testimonial?.active
            ? "Unpublish Feedback"
            : "Publish Feedback"
        }
      >
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Are you sure you want to{" "}
            {confirmModalData.testimonial?.active ? "unpublish" : "publish"} this
            feedback {confirmModalData.testimonial?.active ? "from" : "to"} the
            public site?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setConfirmModalData({ isOpen: false, testimonial: null })
              }
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={updateMutation.isPending}
              onClick={async () => {
                if (confirmModalData.testimonial) {
                  await toggleActive(confirmModalData.testimonial);
                  setConfirmModalData({ isOpen: false, testimonial: null });
                }
              }}
              className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalData.isOpen}
        onClose={() =>
          setDeleteModalData({ isOpen: false, testimonialId: null })
        }
        title="Delete Testimonial"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Are you sure you want to delete this testimonial? This action cannot
            be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setDeleteModalData({ isOpen: false, testimonialId: null })
              }
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteModalData.testimonialId) {
                  deleteMutation.mutate(deleteModalData.testimonialId, {
                    onSuccess: () => {
                      addNotification(
                        "Success",
                        "Testimonial deleted successfully",
                        "success",
                      );
                      setDeleteModalData({
                        isOpen: false,
                        testimonialId: null,
                      });
                    },
                    onError: (error) => {
                      console.error("Failed to delete testimonial:", error);
                      addNotification(
                        "Error",
                        getErrorMessage(error, "Failed to delete testimonial"),
                        "error",
                      );
                    },
                  });
                }
              }}
              className="bg-rose-600 hover:bg-rose-500 text-foreground"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminTestimonials;
