"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProjectById, type Project } from "@/services/api";
import { getErrorMessage } from "@/utils/error";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import {
  useUpdateProject,
  useCreateProject,
} from "@/hooks/queries/useProjects";
import { useFormDraft } from "@/hooks/useFormDraft";

// Import modular components
import ProjectIdentityCard from "@/components/admin/project/ProjectIdentityCard";
import ProjectMediaCard from "@/components/admin/project/ProjectMediaCard";
import ProjectSidebarMeta from "@/components/admin/project/ProjectSidebarMeta";

export default function ProjectForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { setLabel, clearLabel } = useBreadcrumb();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTech, setNewTech] = useState("");

  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();

  const [projectData, setProjectData] = useState<Partial<Project>>({
    title: "",
    category: "",
    client: "",
    description: "",
    useCase: "",
    technologies: [],
    image: "",
    link: "",
  });

  const draftKey = `sherotech:admin:project-form:v1:${id || "new"}`;
  const { hasDraft, draftSavedAt, persistDraft, clearDraft } = useFormDraft<Partial<Project>>({
    storageKey: draftKey,
    currentData: projectData,
    isMeaningful: (data) => Boolean(
      data.title?.trim() ||
      data.category?.trim() ||
      data.client?.trim() ||
      data.description?.trim() ||
      data.useCase?.trim() ||
      data.image?.trim() ||
      data.link?.trim() ||
      (data.technologies?.length ?? 0) > 0
    ),
    serialize: (data) => JSON.stringify(data),
    deserialize: (text) => JSON.parse(text),
    isLoading,
    onRestore: (restored) => setProjectData(restored),
  });

  const { isUploading, uploadFiles, handleFileChangeEvent: handleImageUpload } = useImageUpload({
    maxImages: 1,
    currentImagesCount: projectData.image ? 1 : 0,
    onSuccess: (imageUrls) => {
      setProjectData((prev: Partial<Project>) => ({
        ...prev,
        image: imageUrls[0],
      }));
    },
  });

  const handleSaveDraft = () => {
    persistDraft(projectData);
    addNotification("Draft saved", "Your changes were saved locally.", "success");
  };

  useEffect(() => {
    async function loadData() {
      try {
        if (isEdit && id) {
          const project = await fetchProjectById(id);
          if (project) {
            setProjectData(project);
            setLabel(`/admin/projects/${id}`, project.title || id);
          }
        }
      } catch (err) {
        addNotification("Error", getErrorMessage(err, "Failed to load project data"), "error");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    return () => {
      if (id) {
        clearLabel(`/admin/projects/${id}`);
      }
    };
  }, [id, isEdit, addNotification, setLabel, clearLabel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!projectData.title?.trim()) {
      newErrors.title = "Project title is required";
    }
    if (!projectData.category) {
      newErrors.category = "Please select a category";
    }
    if (!projectData.description?.trim()) {
      newErrors.description = "Challenge overview is required";
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
        setTimeout(() => element.focus(), 400);
      }
      return;
    }

    setIsSaving(true);
    try {
      if (isEdit && id) {
        await updateProjectMutation.mutateAsync({ id, data: projectData });
        addNotification("Success", "Project updated successfully", "success");
      } else {
        await createProjectMutation.mutateAsync(projectData);
        addNotification("Success", "Project created successfully", "success");
      }
      clearDraft();
      router.push("/admin/projects");
    } catch (err) {
      addNotification("Error", getErrorMessage(err, "Failed to save project"), "error");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const addTech = () => {
    if (!newTech.trim()) return;
    setProjectData((prev: Partial<Project>) => ({
      ...prev,
      technologies: [...(prev.technologies || []), newTech.trim()],
    }));
    setNewTech("");
  };

  const removeTech = (index: number) => {
    setProjectData((prev: Partial<Project>) => ({
      ...prev,
      technologies: prev.technologies?.filter((_, i) => i !== index),
    }));
  };

  const updateProjectData = (updates: Partial<Project>) => {
    setProjectData((prev) => ({ ...prev, ...updates }));
  };

  const removeImage = () => {
    setProjectData((prev) => ({ ...prev, image: "" }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-secondary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Sticky Header Action Bar */}
      <div className="sticky top-20 bg-card backdrop-blur-md z-20 py-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/admin/projects")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? "Edit Project" : "New Project"}
            </h1>
            <p className="text-muted-foreground text-sm">
              Showcase your successful projects and case studies
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/admin/projects")}
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
                Save Project
              </>
            )}
          </Button>
        </div>
      </div>

      {(hasDraft || draftSavedAt) && (
        <div className="flex flex-col gap-3 rounded border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20">
                Local draft
              </Badge>
              <span className="text-sm text-muted-foreground">
                Draft autosave is enabled for this form.
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
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
              className="border-emerald-500/30 text-emerald-600 dark:text-emerald-200 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-100"
            >
              Save draft now
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={clearDraft}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
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
          <ProjectIdentityCard
            projectData={projectData}
            onUpdateProjectData={updateProjectData}
            errors={errors}
          />

          <ProjectMediaCard
            image={projectData.image || ""}
            isUploading={isUploading}
            onUpload={handleImageUpload}
            onUploadFiles={uploadFiles}
            onRemove={removeImage}
          />

          {/* Desktop Secondary Action Bar */}
          <div className="hidden md:flex items-center gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => router.push("/admin/projects")}
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
                  Save Project
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar Area */}
        <ProjectSidebarMeta
          projectData={projectData}
          onUpdateProjectData={updateProjectData}
          errors={errors}
          newTech={newTech}
          onNewTechChange={setNewTech}
          onAddTech={addTech}
          onRemoveTech={removeTech}
        />
      </form>

      {/* Mobile Sticky Bottom Action Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card backdrop-blur-md border-t border-border p-4 flex items-center justify-between gap-4 md:hidden shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground w-1/3"
          onClick={() => router.push("/admin/projects")}
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
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Project
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
