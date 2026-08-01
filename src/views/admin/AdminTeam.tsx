"use client";
import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { getErrorMessage } from "@/utils/error";
import {
  Users,
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit2,
  GripVertical,
} from "lucide-react";
import {
  useTeam,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
} from "@/hooks/queries/useTeam";
import { useNotifications } from "@/hooks/useNotifications";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/textarea";
import AppImage from "@/components/common/AppImage";

const TeamGridSkeleton = () => (
  <div className="space-y-4 animate-pulse select-none">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="bg-muted/30 border border-border rounded p-4 flex items-center gap-4"
      >
        <div className="w-5 h-5 bg-accent/50 rounded shrink-0" />
        <div className="w-12 h-12 rounded bg-accent shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-accent rounded" />
          <div className="h-3 w-24 bg-accent/50 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-accent/50 rounded" />
          <div className="h-8 w-8 bg-accent/50 rounded" />
        </div>
      </div>
    ))}
  </div>
);

const AdminTeam = () => {
  const { data: team = [], isLoading } = useTeam(ADMIN_POLLING_INTERVAL);
  const createMutation = useCreateTeamMember();
  const updateMutation = useUpdateTeamMember();
  const deleteMutation = useDeleteTeamMember();
  const { addNotification } = useNotifications();
  const { admin: currentAdmin } = useAdmin();
  const canAddMember =
    currentAdmin?.role === "superadmin" || currentAdmin?.role === "admin";

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<{
    id: string;
    name: string;
    role: string;
    bio: string;
    image: string;
    social: { twitter?: string; linkedin?: string; github?: string };
    order?: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    image: "",
    social: { twitter: "", linkedin: "", github: "" },
    order: 0,
  });

  const { isUploading, handleFileChangeEvent } = useImageUpload({
    maxImages: 1,
    currentImagesCount: formData.image ? 1 : 0,
    onSuccess: (urls) => {
      if (urls.length > 0) {
        setFormData((prev) => ({ ...prev, image: urls[0] }));
      }
    }
  });

  const filteredTeam = team.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      role: "",
      bio: "",
      image: "",
      social: { twitter: "", linkedin: "", github: "" },
      order: team.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: {
    id: string;
    name: string;
    role: string;
    bio?: string;
    image?: string;
    social: { twitter?: string; linkedin?: string; github?: string };
    order?: number;
  }) => {
    setEditingMember({
      ...member,
      bio: member.bio || "",
      image: member.image || "",
    });
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio || "",
      image: member.image || "",
      social: {
        twitter: member.social?.twitter || "",
        linkedin: member.social?.linkedin || "",
        github: member.social?.github || "",
      },
      order: member.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        role: formData.role,
        bio: formData.bio,
        image: formData.image,
        social: formData.social,
        order: Number(formData.order),
      };

      if (editingMember) {
        await updateMutation.mutateAsync({
          id: editingMember.id,
          data: payload,
        });
        addNotification(
          "Success",
          "Team member updated successfully",
          "success",
        );
      } else {
        await createMutation.mutateAsync(payload);
        addNotification("Success", "Team member added successfully", "success");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save team member:", error);
      addNotification("Error", getErrorMessage(error, "Failed to save team member"), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      addNotification("Success", "Team member deleted successfully", "success");
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete team member:", error);
      addNotification("Error", getErrorMessage(error, "Failed to delete team member"), "error");
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Users className="w-7 h-7 text-brand-secondary-400" />
              Team Members
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your team profiles and roles
            </p>
          </div>
          {canAddMember && (
            <Button
              onClick={handleOpenCreate}
              className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 border-border text-foreground placeholder:text-slate-600 focus:ring-brand-secondary-500/20"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <TeamGridSkeleton />
        ) : filteredTeam.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded border border-border">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-muted-foreground">No team members found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTeam.map((member) => (
              <div
                key={member.id}
                className="bg-muted/30 border border-border rounded p-4 flex items-center gap-4 group hover:border-brand-secondary-500/30 transition"
              >
                <div className="text-slate-600 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-5 h-5" />
                </div>

                <div className="relative w-12 h-12 rounded bg-accent overflow-hidden shrink-0">
                  {member.image ? (
                    <AppImage
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">
                    {member.name}
                  </h3>
                  <p className="text-sm text-brand-secondary-500 truncate">
                    {member.role}
                  </p>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(member)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(member.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-red-400"
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
          title={editingMember ? "Edit Team Member" : "Add Team Member"}
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
          >
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  required
                  className="bg-muted border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex items-center gap-4">
                {formData.image ? (
                  <div className="relative w-24 h-24 rounded border border-border overflow-hidden group shrink-0 bg-accent">
                    <AppImage
                      src={formData.image}
                      alt="Avatar preview"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                        className="text-white hover:bg-white/20 hover:text-white"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="w-24 h-24 rounded border-2 border-dashed border-border hover:border-brand-secondary-500/50 hover:bg-brand-secondary-500/5 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChangeEvent}
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-brand-secondary-400 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1 font-medium">Upload</span>
                      </>
                    )}
                  </label>
                )}
                <div className="flex-1 text-xs text-muted-foreground max-w-[200px]">
                  Recommended size: 400x400px (1:1 ratio). Will be cropped to a circle.
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="bg-muted border-border min-h-25"
              />
            </div>

            <div className="space-y-2">
              <Label>Social Links</Label>
              <div className="grid grid-cols-1 gap-3">
                <Input
                  placeholder="Twitter URL"
                  value={formData.social.twitter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social: { ...formData.social, twitter: e.target.value },
                    })
                  }
                  className="bg-muted border-border"
                />
                <Input
                  placeholder="LinkedIn URL"
                  value={formData.social.linkedin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social: { ...formData.social, linkedin: e.target.value },
                    })
                  }
                  className="bg-muted border-border"
                />
                <Input
                  placeholder="GitHub URL"
                  value={formData.social.github}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social: { ...formData.social, github: e.target.value },
                    })
                  }
                  className="bg-muted border-border"
                />
              </div>
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
                className="bg-muted border-border"
              />
            </div>

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

        {/* Delete Confirm */}
        <ConfirmDialog
          isOpen={!!deleteId}
          title="Delete Team Member"
          message="Are you sure you want to delete this team member?"
          onConfirm={handleDelete}
          onClose={() => setDeleteId(null)}
          confirmText="Delete"
          variant="danger"
        />
    </div>
  );
};

export default AdminTeam;
