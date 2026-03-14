"use client";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  BarChart,
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit2,
  GripVertical,
  Activity,
  Globe,
  Users as UsersIcon,
  Trophy,
  Box,
} from "lucide-react";
import {
  useStats,
  useCreateStat,
  useUpdateStat,
  useDeleteStat,
} from "@/hooks/queries/useStats";
import { useNotifications } from "@/hooks/useNotifications";
import { type SiteStat } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/select";

const iconOptions = [
  { value: "Users", icon: UsersIcon, label: "Users" },
  { value: "Trophy", icon: Trophy, label: "Trophy" },
  { value: "Globe", icon: Globe, label: "Globe" },
  { value: "Activity", icon: Activity, label: "Activity" },
  { value: "Box", icon: Box, label: "Box" },
];

const AdminStats = () => {
  const { data: stats = [], isLoading } = useStats();
  const createMutation = useCreateStat();
  const updateMutation = useUpdateStat();
  const deleteMutation = useDeleteStat();
  const { addNotification } = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingStat, setEditingStat] = useState<SiteStat | null>(null);

  const [formData, setFormData] = useState({
    label: "",
    value: "",
    suffix: "",
    prefix: "",
    icon: "Users",
    color: "text-emerald-500",
    order: 0,
  });

  const filteredStats = stats
    .filter((s) => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleOpenCreate = () => {
    setEditingStat(null);
    setFormData({
      label: "",
      value: "",
      suffix: "",
      prefix: "",
      icon: "Users",
      color: "text-emerald-500",
      order: stats.length,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: SiteStat) => {
    setEditingStat(s);
    setFormData({
      label: s.label,
      value: s.value,
      suffix: s.suffix || "",
      prefix: s.prefix || "",
      icon: s.icon || "Users",
      color: s.color || "text-emerald-500",
      order: s.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStat) {
        await updateMutation.mutateAsync({
          id: editingStat.id,
          data: formData,
        });
        addNotification("Success", "Stat updated successfully", "success");
      } else {
        await createMutation.mutateAsync(formData);
        addNotification("Success", "Stat added successfully", "success");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save stat:", error);
      addNotification("Error", "Failed to save stat", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      addNotification("Success", "Stat deleted successfully", "success");
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete stat:", error);
      addNotification("Error", "Failed to delete stat", "error");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-sora text-white flex items-center gap-3">
              <BarChart className="w-7 h-7 text-emerald-400" />
              Site Statistics
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage marketing stats displayed on the landing page
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Stat
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search stats..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStats.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-slate-800/30 rounded border border-white/5">
                <BarChart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No stats found</p>
              </div>
            ) : (
              filteredStats.map((s) => {
                const IconComp =
                  iconOptions.find((o) => o.value === s.icon)?.icon || Box;
                return (
                  <div
                    key={s.id}
                    className="bg-slate-800/30 border border-white/5 rounded p-4 flex items-center gap-4 group hover:border-emerald-500/30 transition"
                  >
                    <div className="text-slate-600 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    <div className="w-12 h-12 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                      <IconComp className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">
                        {s.label}
                      </h3>
                      <p className="text-sm font-bold text-emerald-400">
                        {s.prefix}
                        {s.value}
                        {s.suffix}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(s)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(s.id)}
                        className="text-slate-400 hover:text-red-400"
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
          title={editingStat ? "Edit Stat" : "Add Stat"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                required
                className="bg-slate-800 border-white/10"
                placeholder="e.g. Happy Customers"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prefix">Prefix</Label>
                <Input
                  id="prefix"
                  value={formData.prefix}
                  onChange={(e) =>
                    setFormData({ ...formData, prefix: e.target.value })
                  }
                  placeholder="$"
                  className="bg-slate-800 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  required
                  placeholder="100"
                  className="bg-slate-800 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suffix">Suffix</Label>
                <Input
                  id="suffix"
                  value={formData.suffix}
                  onChange={(e) =>
                    setFormData({ ...formData, suffix: e.target.value })
                  }
                  placeholder="+"
                  className="bg-slate-800 border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0">
                <Select
                  label="Icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  options={iconOptions.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                  }))}
                  className="bg-slate-800 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
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

            <div className="space-y-2">
              <Label htmlFor="color">Color Class (Tailwind)</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                placeholder="text-emerald-500"
                className="bg-slate-800 border-white/10"
              />
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
          title="Delete Stat"
          message="Are you sure you want to delete this statistic? It will be removed from the landing page."
          onConfirm={handleDelete}
          onClose={() => setDeleteId(null)}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminStats;
