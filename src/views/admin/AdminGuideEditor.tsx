"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/utils/error";

import {
  createGuide,
  updateGuide,
  getAdminGuides,
  type SupportGuide,
} from "@/services/guides";
import { useNotifications } from "@/hooks/useNotifications";
import { useFormDraft } from "@/hooks/useFormDraft";
import { useImageUpload } from "@/hooks/useImageUpload";

// Import modular components
import GuideIdentityCard from "@/components/admin/guide/GuideIdentityCard";
import GuideMediaCard from "@/components/admin/guide/GuideMediaCard";
import GuideSidebarMeta from "@/components/admin/guide/GuideSidebarMeta";

const AdminGuideEditor = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { addNotification } = useNotifications();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"hardware" | "software">("hardware");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);

  const guideDraft = useMemo(() => ({
    title,
    summary,
    content,
    category,
    coverImage,
    published,
  }), [title, summary, content, category, coverImage, published]);

  const draftKey = `sherotech:admin:guide-editor:v1:${id || "new"}`;
  const { hasDraft, draftSavedAt, persistDraft, clearDraft } = useFormDraft({
    storageKey: draftKey,
    currentData: guideDraft,
    isMeaningful: (data) => Boolean(
      data.title.trim() ||
      data.summary.trim() ||
      data.content.trim() ||
      data.coverImage.trim()
    ),
    serialize: (data) => JSON.stringify(data),
    deserialize: (text) => JSON.parse(text),
    isLoading,
    onRestore: (restored) => {
      setTitle(restored.title);
      setSummary(restored.summary);
      setContent(restored.content);
      setCategory(restored.category);
      setCoverImage(restored.coverImage);
      setPublished(restored.published);
    },
  });

  const { isUploading: isUploadingImage, uploadFiles, handleFileChangeEvent: handleImageUpload } = useImageUpload({
    maxImages: 1,
    currentImagesCount: coverImage ? 1 : 0,
    onSuccess: (urls) => {
      if (urls[0]) {
        setCoverImage(urls[0]);
      }
    },
  });

  const handleSaveDraft = () => {
    persistDraft(guideDraft);
    addNotification("Draft saved", "Your changes were saved locally.", "success");
  };

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

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = "Guide title is required";
    }
    if (!content.trim()) {
      newErrors.content = "Guide content is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addNotification(
        "Validation Error",
        "Please check the highlighted fields on the form",
        "error"
      );

      // Smoothly scroll to the first element with an error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Delay focusing to allow the scroll to center smoothly
        setTimeout(() => {
          if (firstErrorField === "content") {
            // MDEditor focus element can vary, targeting textarea
            const textarea = element.querySelector("textarea") || element;
            textarea.focus();
          } else {
            element.focus();
          }
        }, 400);
      }
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
      clearDraft();
      router.push("/admin/guides");
    } catch (error) {
      console.error("Failed to save guide:", error);
      addNotification("Error", getErrorMessage(error, "Failed to save guide"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const removeImage = () => {
    setCoverImage("");
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
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Sticky Header Action Bar */}
      <div className="sticky top-20 bg-slate-950/80 backdrop-blur-md z-20 py-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white"
            onClick={() => router.push("/admin/guides")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? "Edit Guide" : "New Guide"}
            </h1>
            <p className="text-slate-400 text-sm">
              Create and manage helpful resources for your customers
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="text-slate-400 hover:text-white"
            onClick={() => router.push("/admin/guides")}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white min-w-30"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Guide
              </>
            )}
          </Button>
        </div>
      </div>

      {(hasDraft || draftSavedAt) && (
        <div className="flex flex-col gap-3 rounded border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                Local draft
              </Badge>
              <span className="text-sm text-slate-200">
                Draft autosave is enabled for this form.
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {draftSavedAt
                ? `Last saved ${new Date(draftSavedAt).toLocaleString()}.`
                : "Your changes will be saved locally as you type."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              className="border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10 hover:text-emerald-100"
            >
              Save draft now
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={clearDraft}
              className="text-slate-300 hover:text-white hover:bg-white/5"
            >
              Clear draft
            </Button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <GuideIdentityCard
            title={title}
            onTitleChange={setTitle}
            summary={summary}
            onSummaryChange={setSummary}
            content={content}
            onContentChange={setContent}
            errors={errors}
          />

          <GuideMediaCard
            coverImage={coverImage}
            onCoverImageChange={setCoverImage}
            isUploading={isUploadingImage}
            onUpload={handleImageUpload}
            onUploadFiles={uploadFiles}
            onRemove={removeImage}
          />

          {/* Desktop Secondary Action Bar */}
          <div className="hidden md:flex items-center gap-3 pt-6 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-400 hover:text-white"
              onClick={() => router.push("/admin/guides")}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white min-w-30"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Guide
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar Area */}
        <GuideSidebarMeta
          category={category}
          onCategoryChange={setCategory}
          published={published}
          onPublishedChange={setPublished}
        />
      </form>

      {/* Mobile Sticky Bottom Action Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-white/10 p-4 flex items-center justify-between gap-4 md:hidden shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
        <Button
          type="button"
          variant="ghost"
          className="text-slate-400 hover:text-white w-1/3"
          onClick={() => router.push("/admin/guides")}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white w-2/3"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2 animate-pulse" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Guide
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdminGuideEditor;
