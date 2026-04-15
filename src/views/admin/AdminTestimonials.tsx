"use client";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
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

const AdminTestimonials = () => {
  const { data: testimonials = [], isLoading } = useAdminTestimonials();
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();
  const syncTrustpilotMutation = useSyncTrustpilotTestimonials();
  const { addNotification } = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
      addNotification("Error", "Failed to save testimonial", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      addNotification("Success", "Testimonial deleted successfully", "success");
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete testimonial:", error);
      addNotification("Error", "Failed to delete testimonial", "error");
    }
  };

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
      addNotification("Error", "Failed to update status", "error");
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
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <MessageSquareQuote className="w-7 h-7 text-emerald-400" />
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
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
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
            className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:ring-emerald-500/20"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTestimonials.length === 0 ? (
              <div className="text-center py-20 bg-slate-800/30 rounded border border-white/5">
                <MessageSquareQuote className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No testimonials found</p>
              </div>
            ) : (
              filteredTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-800/30 border border-white/5 rounded p-4 flex items-center gap-4 group hover:border-emerald-500/30 transition"
                >
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
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-emerald-500/10">
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
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(t)}
                      title={t.active ? "Deactivate" : "Activate"}
                      className={
                        t.active
                          ? "text-emerald-500 hover:text-emerald-400"
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
                      onClick={() => setDeleteId(t.id)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
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

        {/* Delete Confirm */}
        <ConfirmDialog
          isOpen={!!deleteId}
          title="Delete Testimonial"
          message="Are you sure you want to delete this testimonial? This action cannot be undone."
          onConfirm={handleDelete}
          onClose={() => setDeleteId(null)}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonials;
