"use client";
import { useState, useEffect } from "react";
import { } from "@/context/AdminContext";
import { Tag, Plus, Search, Loader2, Trash2, Edit2 } from "lucide-react";
import { getErrorMessage } from "@/utils/error";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory} from "@/hooks/queries/useCategories";
import { useNotifications } from "@/hooks/useNotifications";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/label";

import * as Icons from "lucide-react";

// Icon Selector Component (Simplified)
const IconSelector = ({
  value,
  onChange}: {
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
        className="bg-muted border-border"
      />
      <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-muted/50 rounded border border-border">
        {displayIcons.map((name) => {
          // @ts-expect-error - Dynamic icon access
          const Icon = Icons[name];
          if (!Icon) return null;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className={`p-2 rounded flex items-center justify-center transition-colors ${value === name ? "bg-brand-secondary-500 text-foreground" : "hover:bg-accent text-muted-foreground"}`}
              title={name}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
      {value && <p className="text-xs text-muted-foreground">Selected: {value}</p>}
    </div>
  );
};

const CategoriesTableSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-pulse select-none">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
      <div key={i} className="bg-muted/20 border border-border rounded p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-accent/50" />
        <div className="h-4 w-20 bg-accent rounded" />
      </div>
    ))}
  </div>
);

const AdminCategories = () => {
  const { data: categories = [], isLoading } = useCategories(ADMIN_POLLING_INTERVAL);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const { addNotification } = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(3);
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timeout | null>(null);

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
          data: formData});
        addNotification("Success", "Category updated successfully", "success");
      } else {
        await createMutation.mutateAsync(formData);
        addNotification("Success", "Category created successfully", "success");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save category:", error);
      addNotification("Error", getErrorMessage(error, "Failed to save category"), "error");
    }
  };

  const startSoftDelete = (id: string) => {
    if (activeTimer) {
      clearTimeout(activeTimer);
    }
    setPendingDeleteId(id);
    setSecondsLeft(3);

    const countdown = (secs: number) => {
      if (secs <= 0) {
        setPendingDeleteId(null);
        deleteMutation.mutate(id, {
          onSuccess: () => {
            addNotification("Success", "Category deleted successfully", "success");
          },
          onError: (error) => {
            console.error("Failed to delete category:", error);
            addNotification("Error", getErrorMessage(error, "Failed to delete category"), "error");
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

  const renderIcon = (iconName: string) => {
    // @ts-expect-error - Dynamic icon access
    const Icon = Icons[iconName] || Icons.Package;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Tag className="w-7 h-7 text-brand-secondary-400" />
            Categories
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage product categories and icons
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card/50 border-border text-foreground placeholder:text-slate-600 focus:ring-brand-secondary-500/20"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <CategoriesTableSkeleton />
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded border border-border">
          <Tag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-muted-foreground">No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredCategories.map((cat) => {
            const isDeleting = pendingDeleteId === cat.id;
            return (
              <div
                key={cat.id}
                className="bg-muted/30 border border-border rounded p-4 flex items-center justify-between group hover:border-brand-secondary-500/30 transition relative overflow-hidden"
              >
                {isDeleting && (
                  <div className="absolute inset-0 bg-card backdrop-blur-xs z-10 flex items-center justify-between px-3 py-2 animate-in fade-in duration-200 select-none">
                    <span className="text-[10px] font-bold text-rose-400 animate-pulse truncate mr-1">
                      Removing in {secondsLeft}s
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCancelDelete(cat.id)}
                      className="px-2 py-1 bg-accent hover:bg-white/20 text-foreground rounded text-[9px] font-bold transition-all shrink-0"
                    >
                      Undo
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-brand-secondary-500/10 flex items-center justify-center text-brand-secondary-400">
                    {renderIcon(cat.icon)}
                  </div>
                  <span className="font-medium text-foreground">{cat.name}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(cat)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startSoftDelete(cat.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
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
              className="bg-muted border-border"
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
              className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground"
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

export default AdminCategories;
