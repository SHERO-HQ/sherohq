import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UniversalLink from "@/components/common/UniversalLink";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { type SupportGuide } from "@/types/guide";
import { useNotifications } from "@/hooks/useNotifications";
import {
  useAdminGuides,
  useUpdateGuide,
  useDeleteGuide,
} from "@/hooks/queries/useGuides";

const AdminGuides = () => {
  const navigate = useNavigate();
  const { data: guides = [], isLoading } = useAdminGuides();
  const updateMutation = useUpdateGuide();
  const deleteMutation = useDeleteGuide();

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addNotification } = useNotifications();

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      addNotification("Success", "Guide deleted successfully", "success");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete guide:", error);
      addNotification("Error", "Failed to delete guide", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  async function togglePublished(guide: SupportGuide) {
    try {
      await updateMutation.mutateAsync({
        id: guide.id,
        data: { published: !guide.published },
      });
      const message = guide.published ? "Guide unpublished" : "Guide published";
      addNotification("Success", message, "success");
    } catch (error) {
      console.error("Failed to update guide:", error);
      addNotification("Error", "Failed to update guide", "error");
    }
  }

  const filteredGuides = guides.filter(
    (guide) =>
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  let renderContent;

  if (isLoading) {
    renderContent = (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={`skeleton-${i}`}
            className="bg-slate-900/40 rounded border border-white/10 p-6 animate-pulse"
          >
            <div className="h-5 bg-slate-800 rounded w-1/3 mb-3" />
            <div className="h-4 bg-slate-800 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  } else if (filteredGuides.length === 0) {
    renderContent = (
      <div className="text-center py-16 bg-slate-900/40 rounded border border-white/10">
        <h3 className="text-xl font-semibold text-slate-400 mb-2">
          No guides found
        </h3>
        <Button
          className="bg-emerald-600 text-slate-100 hover:bg-emerald-500"
          asChild
        >
          <UniversalLink to="/admin/guides/new">Create Guide</UniversalLink>
        </Button>
      </div>
    );
  } else {
    renderContent = (
      <div className="bg-slate-900/40 rounded border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                  Guide
                </th>
                <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                  Category
                </th>
                <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-slate-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredGuides.map((guide) => (
                <tr
                  key={guide.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-emerald-400">
                        {guide.category === "hardware" ? "H" : "S"}
                      </div>
                      <div>
                        <span className="text-white font-medium block">
                          {guide.title}
                        </span>
                        <span className="text-slate-500 text-sm">
                          {guide.slug}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={
                        guide.category === "hardware"
                          ? "border-blue-500/50 text-blue-400"
                          : "border-purple-500/50 text-purple-400"
                      }
                    >
                      {guide.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePublished(guide)}
                      className="cursor-pointer"
                    >
                      <Badge
                        className={
                          guide.published
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }
                      >
                        {guide.published ? "Published" : "Draft"}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {format(new Date(guide.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <UniversalLink
                        to={`/support/${guide.category}/${guide.slug}`}
                        target="_blank"
                        className="text-slate-400 hover:text-white"
                      >
                        View
                      </UniversalLink>
                      <button
                        className="text-slate-400 hover:text-white ml-4"
                        onClick={() =>
                          navigate(`/admin/guides/edit/${guide.id}`)
                        }
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({ id: guide.id, title: guide.title })
                        }
                        className="text-slate-400 hover:text-red-400 ml-4"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-sora text-white">
            Support Guides
          </h1>
          <p className="text-slate-400 mt-1">
            Create and manage hardware & software guides
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <Input
            placeholder="Search guides..."
            className="pl-4 w-full sm:w-64 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
            asChild
          >
            <UniversalLink to="/admin/guides/new">New Guide</UniversalLink>
          </Button>
        </div>
      </div>

      {renderContent}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Guide"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminGuides;
