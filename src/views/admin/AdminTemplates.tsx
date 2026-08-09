"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LayoutTemplate, Plus, RefreshCw, Trash2, Save, X, Mail, MessageCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotifications } from "@/hooks/useNotifications";
import { useDialog } from "@/hooks/useDialog";
import { cn } from "@/lib/utils";
import { TemplatePreview } from "@/components/admin/newsletter/TemplatePreview";

interface CampaignTemplate {
  id: string;
  name: string;
  description: string | null;
  channel: string;
  content: string | null;
  whatsappTemplateLanguage: string | null;
  expectedParams: string[] | null;
  category: string | null;
  isSync: boolean;
  status?: string | null;
  createdAt: string;
}

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { addNotification } = useNotifications();
  const dialog = useDialog();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<CampaignTemplate>>({
    channel: "email",
    name: "",
    description: "",
    content: "",
    whatsappTemplateLanguage: "en",
  });

  const fetchTemplates = async (sync = false) => {
    try {
      if (sync) setIsSyncing(true);
      else setIsLoading(true);

      const res = await fetch(`/api/admin/templates${sync ? "?sync=true" : ""}`);
      if (!res.ok) throw new Error("Failed to load templates");
      const data = await res.json();
      setTemplates(data.templates || []);

      if (sync) addNotification("Success", "Templates synced with Meta", "success");
    } catch (error: any) {
      addNotification("Error", error.message || "Failed to fetch templates", "error");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: "Delete Template",
      message: "Are you sure you want to delete this template?",
      confirmText: "Delete",
      type: "error",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete template");
      setTemplates(templates.filter(t => t.id !== id));
      addNotification("Success", "Template deleted", "success");
    } catch (error: any) {
      addNotification("Error", error.message, "error");
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.channel) {
      addNotification("Error", "Name and channel are required", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save template");
      }

      await fetchTemplates();
      setIsCreating(false);
      setFormData({ channel: "email", name: "", description: "", content: "", whatsappTemplateLanguage: "en" });
      addNotification("Success", "Template created", "success");
    } catch (error: any) {
      addNotification("Error", error.message, "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader title="Templates Management" icon={LayoutTemplate}>
        <div className="flex gap-2">
          <Button onClick={() => fetchTemplates(true)} variant="outline" disabled={isLoading || isSyncing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")} />
            Sync WhatsApp
          </Button>
          <Button onClick={() => setIsCreating(true)} className="bg-brand-secondary-600 text-white hover:bg-brand-secondary-500">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </AdminPageHeader>

      {/* Glassmorphic Modal for Creating Template */}
      {isCreating && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border p-6 rounded w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-brand-secondary-500" />
                Create New Template
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full hover:bg-accent">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Channel</label>
                  <select
                    value={formData.channel}
                    onChange={e => setFormData({ ...formData, channel: e.target.value })}
                    className="w-full h-11 px-4 bg-accent/30 border border-border/60 rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/30 transition-all appearance-none"
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Template Name</label>
                  <Input
                    value={formData.name || ""}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="promo_launch_v1"
                    className="h-11 rounded bg-accent/30 border-border/60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description / Category</label>
                <Input
                  value={formData.description || ""}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Internal description of what this is for"
                  className="h-11 rounded bg-accent/30 border-border/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Content (Text or HTML)</label>
                <textarea
                  value={formData.content || ""}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full min-h-35 p-4 bg-accent/30 border border-border/60 rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/30 transition-all resize-y custom-scrollbar"
                  placeholder="Hi {{1}}, here is your code: {{2}}"
                />
              </div>

              {formData.channel === "whatsapp" && (
                <div className="grid grid-cols-2 gap-5 animate-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Language Code</label>
                    <Input
                      value={formData.whatsappTemplateLanguage || ""}
                      onChange={e => setFormData({ ...formData, whatsappTemplateLanguage: e.target.value })}
                      placeholder="en"
                      className="h-11 rounded bg-accent/30 border-border/60"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-8 gap-3">
              <Button variant="ghost" onClick={() => setIsCreating(false)} className="rounded px-6">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-brand-secondary-600 text-white hover:bg-brand-secondary-500 rounded px-6 shadow-md shadow-brand-secondary-500/20">
                <Save className="h-4 w-4 mr-2" /> Save Template
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.length === 0 && !isLoading && (
          <div className="col-span-full py-16 text-center border border-dashed border-border rounded bg-card text-muted-foreground flex flex-col items-center justify-center gap-3">
            <LayoutTemplate className="w-10 h-10 opacity-20" />
            <p>No templates found. Click 'New Template' or 'Sync WhatsApp'.</p>
          </div>
        )}

        {isLoading && templates.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">Loading templates...</div>
        )}

        {templates.map((t) => (
          <div
            key={t.id}
            className="group flex flex-col bg-card border border-border/80 rounded overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300"
          >
            {/* Card Header */}
            <div className="p-5 border-b border-border/50 flex justify-between items-start bg-accent/10">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  {t.channel === 'email' ? <Mail className="h-4 w-4 text-brand-secondary-500" /> : <MessageCircle className="h-4 w-4 text-[#25D366]" />}
                  <h4 className="font-bold text-foreground truncate max-w-45" title={t.name}>{t.name}</h4>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {t.whatsappTemplateLanguage && (
                    <span className="text-[10px] bg-accent text-muted-foreground px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider border border-border/50">
                      {t.whatsappTemplateLanguage}
                    </span>
                  )}
                  {t.isSync ? (
                    <span className="text-[10px] bg-sky-500/10 text-sky-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-sky-500/20">
                      Meta Sync
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-emerald-500/20">
                      Local
                    </span>
                  )}
                  {/* Status Badge */}
                  {t.status === 'APPROVED' ? (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-emerald-500/20">APPROVED</span>
                  ) : t.status === 'REJECTED' ? (
                    <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-rose-500/20">REJECTED</span>
                  ) : t.status === 'PENDING' ? (
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-amber-500/20">PENDING</span>
                  ) : null}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(t.id)}
                className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Card Body - Preview */}
            <div className="p-4 flex-1 flex flex-col bg-accent/5">
              <div className="text-xs text-muted-foreground mb-4 line-clamp-2 min-h-8">
                {t.description || t.category || "No description provided."}
              </div>

              <div className="relative rounded overflow-hidden border border-border/50 bg-card flex-1 min-h-40 pointer-events-none transform scale-[0.85] origin-top">
                <TemplatePreview
                  channel={t.channel as any}
                  content={t.content || ""}
                  params={Array(5).fill("___")} // dummy params for preview
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
