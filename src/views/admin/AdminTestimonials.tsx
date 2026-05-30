"use client";
import { useState, useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";
import { getErrorMessage } from "@/utils/error";
import {
  MessageSquareQuote,
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit2,
  GripVertical,
  CheckCircle2,
  XCircle,
  Star,
} from "lucide-react";
import {
  useAdminTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  useSyncTrustpilotTestimonials,
} from "@/hooks/queries/useTestimonials";
import { useNotifications } from "@/hooks/useNotifications";
import { type Testimonial } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/textarea";
import AppImage from "@/components/common/AppImage";

const TestimonialsGridSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 animate-pulse select-none">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-slate-800/20 border border-white/5 rounded p-4 flex items-center gap-4"
      >
        <div className="w-5 h-5 bg-white/5 rounded shrink-0" />
        <div className="w-12 h-12 rounded bg-white/5 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 bg-white/10 rounded" />
          <div className="h-3 w-3/4 bg-white/5 rounded" />
        </div>
        <div className="h-8 w-24 bg-white/5 rounded" />
      </div>
    ))}
  </div>
);

const AdminTestimonials = () => {
  const { data: testimonials = [], isLoading } = useAdminTestimonials();
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();
  const syncTrustpilotMutation = useSyncTrustpilotTestimonials();
  const { addNotification } = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(3);
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timeout | null>(null);
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);

  const [formData, setFormData] = useState({
    quote: "",
    author: "",
    role: "",
    company: "",
    image: "",
    order: 0,
    active: true,
    rating: 5,
  });

  const filteredTestimonials = testimonials
    .filter(
      (t) =>
        t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.quote.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleOpenCreate = () => {
    setEditingTestimonial(null);
    setFormData({
      quote: "",
      author: "",
      role: "",
      company: "",
      image: "",
      order: testimonials.length,
      active: true,
      rating: 5,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingTestimonial(t);
    setFormData({
      quote: t.quote,
      author: t.author,
      role: t.role || "",
      company: t.company || "",
      image: t.image || "",
      order: t.order || 0,
      active: t.active ?? true,
      rating: t.rating || 5,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await updateMutation.mutateAsync({
          id: editingTestimonial.id,
          data: formData,
        });
        addNotification(
          "Success",
          "Testimonial updated successfully",
          "success",
        );
      } else {
        await createMutation.mutateAsync(formData);
        addNotification("Success", "Testimonial added successfully", "success");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save testimonial:", error);
      addNotification("Error", getErrorMessage(error, "Failed to save testimonial"), "error");
    }
  };

  const startSoftDelete = (id: string) => {
    if (activeTimer) clearTimeout(activeTimer);
    setPendingDeleteId(id);
    setSecondsLeft(3);

    const countdown = (secs: number) => {
      if (secs <= 0) {
        setPendingDeleteId(null);
        deleteMutation.mutate(id, {
          onSuccess: () => {
            addNotification("Success", "Testimonial deleted successfully", "success");
          },
          onError: (error) => {
            console.error("Failed to delete testimonial:", error);
            addNotification("Error", getErrorMessage(error, "Failed to delete testimonial"), "error");
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
    setPendingDeleteId(id);
    setSecondsLeft(3);
    setPendingDeleteId(null);
    addNotification("Info", "Deletion cancelled", "info");
  };

  useEffect(() => {
    return () => {
      if (activeTimer) clearTimeout(activeTimer);
    };
  }, [activeTimer]);

  const toggleActive = async (t: Testimonial) => {
    try {
      const newStatus = !t.active;
      await updateMutation.mutateAsync({
        id: t.id,
        data: { active: newStatus },
      });
      const statusLabel = newStatus ? "activated" : "deactivated";
      addNotification("Success", `Testimonial ${statusLabel}`, "success");
    } catch (error) {
      console.error("Failed to toggle testimonial status:", error);
      addNotification("Error", getErrorMessage(error, "Failed to update status"), "error");
    }
  };

  const handleSyncTrustpilot = async () => {
    try {
      const result = await syncTrustpilotMutation.mutateAsync(20);
      addNotification(
        "Success",
        `Trustpilot sync complete: fetched ${result.fetched}, inserted ${result.inserted}, updated ${result.updated}`,
        "success",
      );
    } catch (error) {
      console.error("Failed to sync Trustpilot testimonials:", error);
      addNotification(
        "Error",
        "Failed to sync Trustpilot testimonials",
        "error",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageSquareQuote className="w-7 h-7 text-brand-secondary-400" />
            Testimonials
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage customer reviews and success stories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSyncTrustpilot}
            disabled={syncTrustpilotMutation.isPending}
            className="bg-blue-600 hover:bg-blue-500 text-white"
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
            className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search testimonials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:ring-brand-secondary-500/20"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <TestimonialsGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTestimonials.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/30 rounded border border-white/5">
              <MessageSquareQuote className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No testimonials found</p>
            </div>
          ) : (
            filteredTestimonials.map((t) => {
              const isDeleting = pendingDeleteId === t.id;
              return (
                <div
                  key={t.id}
                  className="bg-slate-800/30 border border-white/5 rounded p-4 flex items-center gap-4 group hover:border-brand-secondary-500/30 transition relative overflow-hidden"
                >
                  {isDeleting && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs z-10 flex items-center justify-between px-4 py-2 animate-in fade-in duration-200 select-none">
                      <span className="text-xs font-bold text-rose-400 animate-pulse">
                        Removing testimonial in {secondsLeft}s
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleCancelDelete(t.id)}
                        className="h-8 px-4 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] font-bold transition-all shrink-0"
                      >
                        Undo Deletion
                      </Button>
                    </div>
                  )}

                  <div className="text-slate-600 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="relative w-12 h-12 rounded bg-slate-700/50 overflow-hidden shrink-0 flex items-center justify-center">
                    {t.image ? (
                      <AppImage
                        src={t.image}
                        alt={t.author}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-brand-secondary-500/10">
                        {t.author.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white truncate">
                        {t.author}
                      </h3>
                      {!t.active && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-white/5 uppercase">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 truncate italic">
                      "{t.quote}"
                    </p>
                    {typeof t.rating === "number" && (
                      <div className="flex gap-0.5 mt-1">
                        {(() => {
                          const rating = t.rating;
                          return [...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-600"
                                }`}
                            />
                          ));
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 relative z-5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(t)}
                      title={t.active ? "Deactivate" : "Activate"}
                      className={
                        t.active
                          ? "text-brand-secondary-500 hover:text-brand-secondary-400"
                          : "text-slate-500 hover:text-slate-400"
                      }
                    >
                      {t.active ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(t)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startSoftDelete(t.id)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
        >
          <div className="space-y-2">
            <Label htmlFor="author">Author Name</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              required
              className="bg-slate-800 border-white/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                placeholder="e.g. CEO"
                className="bg-slate-800 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="e.g. Acme Inc"
                className="bg-slate-800 border-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote">Quote</Label>
            <Textarea
              id="quote"
              value={formData.quote}
              onChange={(e) =>
                setFormData({ ...formData, quote: e.target.value })
              }
              required
              className="bg-slate-800 border-white/10 min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://..."
                className="bg-slate-800 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: Number(e.target.value) })
                }
                className="bg-slate-800 border-white/10"
              />
            </div>
          </div>

          <div className="space-y-3 py-2 border-t border-white/5">
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
                    className={`w-8 h-8 transition-colors ${val <= formData.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-600"
                      }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              id="active"
              type="checkbox"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="w-4 h-4 rounded border-white/10 bg-slate-800"
            />
            <Label htmlFor="active" className="cursor-pointer">
              Active
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Modal>


    </div>
  );
};

export default AdminTestimonials;
