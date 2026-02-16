import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tag, Plus, Search, Loader2, Trash2, Edit2 } from "lucide-react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/queries/useCategories";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import * as Icons from "lucide-react";

// Icon Selector Component (Simplified)
const IconSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [search, setSearch] = useState("");
  const iconNames = Object.keys(Icons)
    .filter((name) => name !== "createLucideIcon" && name !== "default")
    .slice(0, 100);

  const filteredIcons = search
    ? Object.keys(Icons).filter((name) =>
        name.toLowerCase().includes(search.toLowerCase()),
      )
    : iconNames;

  const displayIcons = filteredIcons.slice(0, 50);

  return (
    <div className="space-y-2">
      <Label>Select Icon</Label>
      <Input
        placeholder="Search icons (e.g. 'Smartphone')..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-slate-800 border-white/10"
      />
      <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-800/50 rounded border border-white/5">
        {displayIcons.map((name) => {
          // @ts-expect-error - Dynamic icon access
          const Icon = Icons[name];
          if (!Icon) return null;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className={`p-2 rounded flex items-center justify-center transition-colors ${value === name ? "bg-emerald-500 text-white" : "hover:bg-white/10 text-slate-400"}`}
              title={name}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
      {value && <p className="text-xs text-slate-400">Selected: {value}</p>}
    </div>
  );
};

const AdminCategories = () => {
  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const { addNotification } = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    icon: string;
  } | null>(null);

  const [formData, setFormData] = useState({ name: "", icon: "Package" });

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: "", icon: "Package" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: { id: string; name: string; icon: string }) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, icon: cat.icon });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          data: formData,
        });
        addNotification("Success", "Category updated successfully", "success");
      } else {
        await createMutation.mutateAsync(formData);
        addNotification("Success", "Category created successfully", "success");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save category:", error);
      addNotification("Error", "Failed to save category", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      addNotification("Success", "Category deleted successfully", "success");
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
      addNotification("Error", "Failed to delete category", "error");
    }
  };

  const renderIcon = (iconName: string) => {
    // @ts-expect-error - Dynamic icon access
    const Icon = Icons[iconName] || Icons.Package;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-sora text-white flex items-center gap-3">
              <Tag className="w-7 h-7 text-emerald-400" />
              Categories
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage product categories and icons
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search categories..."
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
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/30 rounded border border-white/5">
            <Tag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-slate-800/30 border border-white/5 rounded p-4 flex items-center justify-between group hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    {renderIcon(cat.icon)}
                  </div>
                  <span className="font-medium text-white">{cat.name}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(cat)}
                    className="h-8 w-8 text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(cat.id)}
                    className="h-8 w-8 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? "Edit Category" : "Add New Category"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="bg-slate-800 border-white/10"
              />
            </div>

            <IconSelector
              value={formData.icon}
              onChange={(icon) => setFormData({ ...formData, icon })}
            />

            <div className="flex justify-end gap-3 pt-4">
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
          title="Delete Category"
          message="Are you sure you want to delete this category? Products using this category might be affected."
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
