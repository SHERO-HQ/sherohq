import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getAdminGuides,
  deleteGuide,
  updateGuide,
  type SupportGuide,
} from "@/services/guides";
import { useNotifications } from "@/hooks/useNotifications";

const AdminGuides = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState<SupportGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadGuides();
  }, []);

  async function loadGuides() {
    setIsLoading(true);
    try {
      const data = await getAdminGuides();
      setGuides(data);
    } catch (error) {
      console.error("Failed to load guides:", error);
      addNotification("Error", "Failed to load guides", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteGuide(id);
      addNotification("Success", "Guide deleted successfully", "success");
      setGuides((prev) => prev.filter((g) => g.id !== id));
    } catch (error) {
      console.error("Failed to delete guide:", error);
      addNotification("Error", "Failed to delete guide", "error");
    }
  }

  async function togglePublished(guide: SupportGuide) {
    try {
      await updateGuide(guide.id, { published: !guide.published });
      const message = guide.published ? "Guide unpublished" : "Guide published";
      addNotification("Success", message, "success");
      setGuides((prev) =>
        prev.map((g) =>
          g.id === guide.id ? { ...g, published: !g.published } : g,
        ),
      );
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
            onClick={() => navigate("/admin/guides/new")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            New Guide
          </Button>
        </div>
      </div>

      {isLoading ? (
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
      ) : filteredGuides.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded border border-white/10">
          <h3 className="text-xl font-semibold text-slate-400 mb-2">
            No guides found
          </h3>
          <Button
            onClick={() => navigate("/admin/guides/new")}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            Create Guide
          </Button>
        </div>
      ) : (
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
                        <Link
                          to={`/support/${guide.category}/${guide.slug}`}
                          target="_blank"
                          className="text-slate-400 hover:text-white"
                        >
                          View
                        </Link>
                        <button
                          onClick={() =>
                            navigate(`/admin/guides/edit/${guide.id}`)
                          }
                          className="text-slate-400 hover:text-white ml-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(guide.id, guide.title)}
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
      )}
    </div>
  );
};

export default AdminGuides;
