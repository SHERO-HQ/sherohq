"use client";

import { useEffect, useState } from "react";
import { LayoutTemplate, Plus, RefreshCw, Trash2, Edit, Save, X, Mail, MessageCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotifications } from "@/hooks/useNotifications";
import { useDialog } from "@/hooks/useDialog";
import { cn } from "@/lib/utils";

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
  createdAt: string;
}

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { addNotification } = useNotifications();
  const dialog = useDialog();

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

      {isCreating && (
        <div className="bg-card border border-border p-5 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-foreground">Create Template</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}><X className="h-4 w-4" /></Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Channel</label>
              <select 
                value={formData.channel} 
                onChange={e => setFormData({ ...formData, channel: e.target.value })}
                className="w-full h-10 px-3 bg-accent/50 border border-border rounded text-sm text-foreground"
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Template Name</label>
              <Input 
                value={formData.name || ""} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="promo_launch_v1"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Description</label>
            <Input 
              value={formData.description || ""} 
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Internal description of what this is for"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Content (Text or HTML)</label>
            <textarea
              value={formData.content || ""}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full min-h-[120px] p-3 bg-accent/50 border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-secondary-500"
              placeholder="Hi {{1}}, here is your code: {{2}}"
            />
          </div>

          {formData.channel === "whatsapp" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Language Code</label>
                <Input 
                  value={formData.whatsappTemplateLanguage || ""} 
                  onChange={e => setFormData({ ...formData, whatsappTemplateLanguage: e.target.value })}
                  placeholder="en"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} className="bg-brand-secondary-600 text-white hover:bg-brand-secondary-500">
              <Save className="h-4 w-4 mr-2" /> Save Template
            </Button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs uppercase bg-accent/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Channel</th>
                <th className="px-6 py-4 font-medium">Category / Desc</th>
                <th className="px-6 py-4 font-medium">Source</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    {isLoading ? "Loading..." : "No templates found. Click 'New Template' or 'Sync WhatsApp'."}
                  </td>
                </tr>
              ) : (
                templates.map((t) => (
                  <tr key={t.id} className="hover:bg-accent/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{t.name}</div>
                      {t.whatsappTemplateLanguage && <div className="text-[10px] text-muted-foreground uppercase">{t.whatsappTemplateLanguage}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {t.channel === 'email' ? <Mail className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                        <span className="capitalize">{t.channel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground text-xs">{t.description || t.category || "None"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {t.isSync ? (
                        <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-1 rounded-full border border-blue-500/20 font-bold">Meta Graph</span>
                      ) : (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-1 rounded-full border border-emerald-500/20 font-bold">Local</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
