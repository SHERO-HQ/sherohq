import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import MDEditor from "@uiw/react-md-editor";
import {
  createGuide,
  updateGuide,
  getAdminGuides,
  type SupportGuide,
} from "@/services/guides";
import { useNotifications } from "@/hooks/useNotifications";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminGuideEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { addNotification } = useNotifications();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"hardware" | "software">("hardware");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);

  const loadGuide = useCallback(
    async (guideId: string) => {
      setIsLoading(true);
      try {
        const guides = await getAdminGuides();
        const guide = guides.find((g: SupportGuide) => g.id === guideId);
        if (guide) {
          setTitle(guide.title);
          setSummary(guide.summary || "");
          setContent(guide.content);
          setCategory(guide.category);
          setCoverImage(guide.coverImage || "");
          setPublished(guide.published);
        } else {
          addNotification("Error", "Guide not found", "error");
          navigate("/admin/guides");
        }
      } catch (error) {
        console.error("Failed to load guide:", error);
        addNotification("Error", "Failed to load guide", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, addNotification],
  );

  useEffect(() => {
    if (isEditing && id) {
      loadGuide(id);
    }
  }, [id, isEditing, loadGuide]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      addNotification("Error", "Title and content are required", "error");
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        category,
        coverImage: coverImage.trim() || undefined,
        published,
      };

      if (isEditing && id) {
        await updateGuide(id, data);
        addNotification("Success", "Guide updated successfully", "success");
      } else {
        await createGuide(data);
        addNotification("Success", "Guide created successfully", "success");
      }
      navigate("/admin/guides");
    } catch (error) {
      console.error("Failed to save guide:", error);
      addNotification("Error", "Failed to save guide", "error");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 bg-slate-800 rounded w-48 mb-8" />
            <div className="space-y-6">
              <div className="h-10 bg-slate-800 rounded" />
              <div className="h-24 bg-slate-800 rounded" />
              <div className="h-64 bg-slate-800 rounded" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="animate-in fade-in duration-500">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin/guides")}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold font-sora text-white">
                {isEditing ? "Edit Guide" : "New Guide"}
              </h1>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Guide"}
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., How to Install RAM"
                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                required
              />
            </div>

            {/* Category & Published */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white">Category *</Label>
                <Select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as "hardware" | "software")
                  }
                  options={[
                    { value: "hardware", label: "🖥️ Hardware" },
                    { value: "software", label: "⚙️ Software" },
                  ]}
                  className="bg-slate-900/50 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Publish Status</Label>
                <div className="flex items-center gap-3 h-10 pt-1">
                  <input
                    type="checkbox"
                    id="published"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                  <label
                    htmlFor="published"
                    className="text-sm text-slate-400 cursor-pointer"
                  >
                    {published
                      ? "Published (visible to users)"
                      : "Draft (not visible)"}
                  </label>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label htmlFor="coverImage" className="text-white">
                Cover Image URL (optional)
              </Label>
              <Input
                id="coverImage"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
              />
              {coverImage && (
                <div className="mt-2 h-32 rounded overflow-hidden bg-slate-800">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label htmlFor="summary" className="text-white">
                Summary (optional)
              </Label>
              <Textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A brief description that appears in guide listings..."
                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 min-h-20"
                rows={3}
              />
            </div>

            {/* Content */}
            <div className="space-y-2" data-color-mode="dark">
              <Label htmlFor="content" className="text-white">
                Content * (Markdown supported)
              </Label>
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || "")}
                height={400}
                preview="edit"
                hideToolbar={false}
              />
              <p className="text-xs text-slate-500">
                Markdown is supported. Use # for headers, ** for bold, - for
                lists, etc.
              </p>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminGuideEditor;
