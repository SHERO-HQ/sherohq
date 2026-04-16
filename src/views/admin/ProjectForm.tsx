"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProjectById, uploadImages, type Project } from "@/services/api";
import {
  Save,
  X,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  Briefcase,
  List,
  Link as LinkIcon,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useUpdateProject,
  useCreateProject,
} from "@/hooks/queries/useProjects";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { cn } from "@/lib/utils";
import AppImage from "@/components/common/AppImage";

export default function ProjectForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { setLabel, clearLabel } = useBreadcrumb();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const [newTech, setNewTech] = useState("");

  const categories = [
    "Web Development",
    "Mobile Apps",
    "Infrastructure",
    "Custom Software",
  ];

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
        addNotification("Error", "Failed to load project data", "error");
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
    try {
      setIsSaving(true);
      if (isEdit && id) {
        await updateProjectMutation.mutateAsync({ id, data: projectData });
        addNotification("Success", "Project updated successfully", "success");
      } else {
        await createProjectMutation.mutateAsync(projectData);
        addNotification("Success", "Project created successfully", "success");
      }
      router.push("/admin/projects");
    } catch (err) {
      addNotification("Error", "Failed to save project", "error");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      const { imageUrls } = await uploadImages(files);
      setProjectData((prev: Partial<Project>) => ({
        ...prev,
        image: imageUrls[0],
      }));
      addNotification("Success", "Project image uploaded", "success");
    } catch (err) {
      addNotification("Error", "Failed to upload image", "error");
      console.error(err);
    } finally {
      setIsUploading(false);
      e.target.value = "";
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-100">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
              onClick={() => router.push("/admin/projects")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isEdit ? "Edit Project" : "New Project"}
              </h1>
              <p className="text-slate-400 text-sm">
                Showcase your successful projects and case studies
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-white"
              onClick={() => router.push("/admin/projects")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-500 text-white min-w-30"
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

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Info */}
            <Card className="bg-slate-900 border-white/5 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">
                  Project Details
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="title"
                    className="text-sm font-medium text-slate-400"
                  >
                    Project Title
                  </label>
                  <Input
                    id="title"
                    placeholder="e.g. Enterprise E-commerce Platform"
                    value={projectData.title || ""}
                    onChange={(e) =>
                      setProjectData((prev: Partial<Project>) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="bg-slate-800/50 border-white/5 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium text-slate-400"
                  >
                    Challenge / Overview
                  </label>
                  <textarea
                    id="description"
                    placeholder="What problem were you solving?"
                    value={projectData.description || ""}
                    onChange={(e) =>
                      setProjectData((prev: Partial<Project>) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full min-h-30 bg-slate-800/50 border border-white/5 rounded p-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-y"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="useCase"
                    className="text-sm font-medium text-slate-400"
                  >
                    Solution / Use Case
                  </label>
                  <textarea
                    id="useCase"
                    placeholder="How did you solve it?"
                    value={projectData.useCase || ""}
                    onChange={(e) =>
                      setProjectData((prev: Partial<Project>) => ({
                        ...prev,
                        useCase: e.target.value,
                      }))
                    }
                    className="w-full min-h-30 bg-slate-800/50 border border-white/5 rounded p-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-y"
                  />
                </div>
              </div>
            </Card>

            {/* Technologies */}
            <Card className="bg-slate-900 border-white/5 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <List className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Technologies</h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add technology (e.g. React, Docker)..."
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTech();
                      }
                    }}
                    className="bg-slate-800/50 border-white/5 text-white"
                  />
                  <Button
                    type="button"
                    onClick={addTech}
                    className="bg-slate-800 text-white hover:bg-slate-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {projectData.technologies?.map((tech, index) => (
                    <Badge
                      key={tech}
                      className="bg-slate-800 text-slate-200 border-white/5 py-1.5 px-3"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(index)}
                        className="ml-2 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Project Image */}
            <Card className="bg-slate-900 border-white/5 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white">Cover Image</h3>
              </div>

              <div className="space-y-4">
                {projectData.image ? (
                  <div className="relative aspect-video rounded overflow-hidden border border-white/10">
                    <AppImage
                      src={projectData.image}
                      alt="Project"
                      fill
                      sizes="(max-width: 768px) 100vw, 800px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setProjectData((prev: Partial<Project>) => ({ ...prev, image: "" }))
                      }
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded shadow hover:bg-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    className={cn(
                      "aspect-video rounded border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition",
                      isUploading
                        ? "bg-slate-800/50 pointer-events-none"
                        : "border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5",
                    )}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-6 h-6 text-slate-500" />
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Upload Cover
                        </span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </Card>

            {/* Meta Info */}
            <Card className="bg-slate-900 border-white/5 p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="category"
                    className="text-sm font-medium text-slate-400"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    className="w-full bg-slate-800 border-white/5 text-white rounded px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500/50"
                    value={projectData.category}
                    onChange={(e) =>
                      setProjectData((prev: Partial<Project>) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="client"
                    className="text-sm font-medium text-slate-400"
                  >
                    Client Name
                  </label>
                  <Input
                    id="client"
                    placeholder="e.g. Acme Innovations"
                    value={projectData.client || ""}
                    onChange={(e) =>
                      setProjectData((prev: Partial<Project>) => ({
                        ...prev,
                        client: e.target.value,
                      }))
                    }
                    className="bg-slate-800/50 border-white/5 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="link"
                    className="text-sm font-medium text-slate-400 flex items-center gap-2"
                  >
                    Project Link <LinkIcon className="w-3 h-3" />
                  </label>
                  <Input
                    id="link"
                    placeholder="https://example.com"
                    value={projectData.link || ""}
                    onChange={(e) =>
                      setProjectData((prev: Partial<Project>) => ({
                        ...prev,
                        link: e.target.value,
                      }))
                    }
                    className="bg-slate-800/50 border-white/5 text-white"
                  />
                </div>
              </div>
            </Card>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

function Card({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded border", className)} {...props}>
      {children}
    </div>
  );
}
