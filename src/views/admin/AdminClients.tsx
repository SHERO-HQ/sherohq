"use client";

import React, { useState, useMemo } from "react";
import {
  Handshake,
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit2,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/Modal";
import { useNotifications } from "@/hooks/useNotifications";
import { useImageUpload } from "@/hooks/useImageUpload";
import { getErrorMessage } from "@/utils/error";
import { getImageUrl } from "@/services/api";
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from "@/hooks/queries/useClients";
import type { ClientPartner } from "@/services/api";

export default function AdminClients() {
  const { addNotification } = useNotifications();
  const { data: clients = [], isLoading, isFetching } = useClients(true);

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  // Search & Filter
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientPartner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientPartner | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    tagline: string;
    logo: string;
    logoDark: string;
    website: string;
    category: string;
    order: number;
    active: boolean;
  }>({
    name: "",
    tagline: "",
    logo: "",
    logoDark: "",
    website: "",
    category: "Client",
    order: 0,
    active: true,
  });

  const { isUploading, handleFileChangeEvent } = useImageUpload({
    maxImages: 1,
    currentImagesCount: formData.logo ? 1 : 0,
    onSuccess: (urls) => {
      if (urls.length > 0) {
        setFormData((prev) => ({ ...prev, logo: urls[0] }));
        addNotification("Logo uploaded", "Client logo uploaded successfully", "success");
      }
    },
  });

  const { isUploading: isUploadingDark, handleFileChangeEvent: handleDarkFileChange } = useImageUpload({
    maxImages: 1,
    currentImagesCount: formData.logoDark ? 1 : 0,
    onSuccess: (urls) => {
      if (urls.length > 0) {
        setFormData((prev) => ({ ...prev, logoDark: urls[0] }));
        addNotification("Dark Logo uploaded", "Dark mode logo uploaded successfully", "success");
      }
    },
  });

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        (client.tagline || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        (client.category || "Client").toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [clients, search, selectedCategory]);

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData({
      name: "",
      tagline: "",
      logo: "",
      logoDark: "",
      website: "",
      category: "Client",
      order: clients.length + 1,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: ClientPartner) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      tagline: client.tagline || "",
      logo: client.logo,
      logoDark: client.logoDark || "",
      website: client.website || "",
      category: client.category || "Client",
      order: client.order || 0,
      active: client.active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addNotification("Validation Error", "Company name is required", "error");
      return;
    }
    if (!formData.logo.trim()) {
      addNotification("Validation Error", "Logo is required", "error");
      return;
    }

    try {
      if (editingClient) {
        await updateMutation.mutateAsync({
          id: editingClient.id,
          data: formData,
        });
        addNotification("Updated", `${formData.name} updated successfully`, "success");
      } else {
        await createMutation.mutateAsync(formData);
        addNotification("Created", `${formData.name} added successfully`, "success");
      }
      setIsModalOpen(false);
    } catch (err) {
      addNotification("Error", getErrorMessage(err, "Failed to save client"), "error");
    }
  };

  const handleToggleActive = async (client: ClientPartner) => {
    try {
      await updateMutation.mutateAsync({
        id: client.id,
        data: { active: !client.active },
      });
      addNotification(
        client.active ? "Hidden" : "Published",
        `${client.name} is now ${client.active ? "hidden from" : "visible on"} the website`,
        "success"
      );
    } catch (err) {
      addNotification("Error", getErrorMessage(err, "Failed to toggle status"), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      addNotification("Deleted", `${deleteTarget.name} removed successfully`, "success");
      setDeleteTarget(null);
    } catch (err) {
      addNotification("Error", getErrorMessage(err, "Failed to delete client"), "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        icon={Handshake}
        title="Partners & Client Logos"
        description="Manage company proof logos, solution partners, and client ventures shown across the website"
      >
        <Button
          onClick={handleOpenCreate}
          className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client / Partner
        </Button>
      </AdminPageHeader>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search partners & clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["all", "Client", "Solution Partner", "Venture"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-brand-secondary-600 text-white"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-card/60 border border-border rounded p-4" />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-16 bg-card/40 rounded border border-border/80 p-6">
          <Handshake className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-foreground mb-1">No Partners Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            {search ? "No results matched your search." : "Start by adding your first client or partner logo."}
          </p>
          <Button onClick={handleOpenCreate} size="sm" className="bg-brand-secondary-600 text-white">
            <Plus className="w-4 h-4 mr-1.5" />
            Add First Partner
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const logoUrl = getImageUrl(client.logo);
            return (
              <div
                key={client.id}
                className={`group relative bg-card border rounded p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                  client.active ? "border-slate-200 dark:border-slate-800" : "border-slate-200/50 dark:border-slate-800/50 opacity-60 bg-muted/20"
                }`}
              >
                <div>
                  {/* Top Bar: Category & Status */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                      {client.category || "Client"}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(client)}
                      title={client.active ? "Click to hide from site" : "Click to publish on site"}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                        client.active
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-slate-500/10 text-slate-500 border border-slate-500/20 hover:bg-slate-500/20"
                      }`}
                    >
                      {client.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{client.active ? "Published" : "Hidden"}</span>
                    </button>
                  </div>

                  {/* Logo Preview & Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded bg-muted border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2 shrink-0">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={client.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-muted-foreground opacity-40" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-bold text-foreground font-sora truncate">
                        {client.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {client.tagline || "No tagline"}
                      </p>
                      {client.website && (
                        <a
                          href={client.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-secondary-600 dark:text-brand-secondary-400 hover:underline mt-1"
                        >
                          <span>Visit Website</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/60">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Order: {client.order ?? 0}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(client)}
                      className="h-8 px-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(client)}
                      className="h-8 px-2.5 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? `Edit ${editingClient.name}` : "Add New Client / Partner"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Company / Team Name *
            </label>
            <Input
              placeholder="e.g. Dajrim"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Tagline or Domain Focus
            </label>
            <Input
              placeholder="e.g. Operations & Workflow Platform"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-9 rounded border border-border bg-card px-3 text-xs text-foreground focus:ring-1 focus:ring-brand-secondary-500"
              >
                <option value="Client">Client</option>
                <option value="Solution Partner">Solution Partner</option>
                <option value="Venture">Venture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Display Order
              </label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Website URL (Optional)
            </label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          {/* Logo Upload Section */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Primary Logo Image (PNG, SVG, WebP) *
            </label>
            <div className="flex items-center gap-3">
              {formData.logo ? (
                <div className="w-16 h-16 rounded bg-muted border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2 shrink-0 relative group">
                  <img
                    src={getImageUrl(formData.logo)}
                    alt="Logo Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : null}

              <div className="flex-1 space-y-2">
                <Input
                  placeholder="/assets/images/clients/logo.png or direct upload"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                />
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-muted hover:bg-muted/80 text-xs font-semibold cursor-pointer border border-border transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{isUploading ? "Uploading..." : "Upload Light Logo"}</span>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    className="hidden"
                    onChange={handleFileChangeEvent}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Dark Mode Logo (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Dark Mode Logo Variant (Optional)
            </label>
            <div className="flex items-center gap-3">
              {formData.logoDark ? (
                <div className="w-16 h-16 rounded bg-card border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2 shrink-0 relative group">
                  <img
                    src={getImageUrl(formData.logoDark)}
                    alt="Dark Logo Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : null}

              <div className="flex-1 space-y-2">
                <Input
                  placeholder="/assets/images/clients/logo-dark.png or direct upload"
                  value={formData.logoDark}
                  onChange={(e) => setFormData({ ...formData, logoDark: e.target.value })}
                />
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-muted hover:bg-muted/80 text-xs font-semibold cursor-pointer border border-border transition-colors">
                  {isUploadingDark ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{isUploadingDark ? "Uploading..." : "Upload Dark Mode Logo"}</span>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    className="hidden"
                    onChange={handleDarkFileChange}
                    disabled={isUploadingDark}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-3 rounded bg-muted/40 border border-border/60">
            <div>
              <span className="block text-xs font-bold text-foreground">
                Publish on Public Website
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Control whether this logo is displayed in the homepage ribbon.
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 rounded text-brand-secondary-600 focus:ring-brand-secondary-500 cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending || isUploading}
              className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white font-semibold"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-1.5" />
              )}
              {editingClient ? "Save Changes" : "Add Partner"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Partner / Client Logo"
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-bold text-foreground">{deleteTarget?.name}</span>? This will
            remove its logo from the public website ribbon.
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1.5" />
              )}
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
