"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import dynamic from "next/dynamic";
import { getErrorMessage } from "@/utils/error";

import {
  createGuide,
  updateGuide,
  getAdminGuides,
  type SupportGuide,
} from "@/services/guides";
import { useNotifications } from "@/hooks/useNotifications";
import { uploadImage } from "@/services/api";
import AppImage from "@/components/common/AppImage";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-slate-900/50 rounded animate-pulse" />
  ),
});

const AdminGuideEditor = () => {
  const router = useRouter();
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
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
          router.push("/admin/guides");
        }
      } catch (error) {
        console.error("Failed to load guide:", error);
        addNotification("Error", getErrorMessage(error, "Failed to load guide"), "error");
      } finally {
        setIsLoading(false);
      }
    },
    [router, addNotification],
  );

  useEffect(() => {
    if (isEditing && id) {
      loadGuide(id);
    }
  }, [id, isEditing, loadGuide]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const result = await uploadImage(file);
      if (result.success) {
        setCoverImage(result.imageUrl);
        addNotification("Success", "Image uploaded successfully", "success");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      addNotification("Error", getErrorMessage(error, "Failed to upload image"), "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
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
      router.push("/admin/guides");
    } catch (error) {
      console.error("Failed to save guide:", error);
      addNotification("Error", getErrorMessage(error, "Failed to save guide"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-secondary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Loading guide editor...</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/guides")}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? "Edit Guide" : "New Guide"}
            </h1>
          </div>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white"
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
                  { value: "hardware", label: "Hardware" },
                  { value: "software", label: "Software" },
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
                  className="w-4 h-4 rounded border-white/20 bg-slate-800 text-brand-secondary-500 focus:ring-brand-secondary-500 focus:ring-offset-slate-900 cursor-pointer"
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
              Cover Image
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-1">
                  Upload from computer
                </p>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded cursor-pointer bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
                  {isUploadingImage ? (
                    <Loader2 className="w-8 h-8 animate-spin text-brand-secondary-500" />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Plus className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-400">Click to upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                  />
                </label>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-1">Or provide a URL</p>
                <Input
                  id="coverImage"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                />
                {coverImage && (
                  <div className="relative mt-2 h-20 rounded overflow-hidden bg-slate-800 border border-white/5">
                    <AppImage
                      src={coverImage}
                      alt="Cover preview"
                      fill
                      sizes="100%"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
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
  );
};

export default AdminGuideEditor;
