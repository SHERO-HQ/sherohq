import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { useTitle } from "@/hooks/useTitle";
import { getGuides, type SupportGuide } from "@/services/guides";

const SupportGuidesPage = () => {
  const { category } = useParams<{ category: "hardware" | "software" }>();
  const [guides, setGuides] = useState<SupportGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const title = category === "software" ? "Software Guides" : "Hardware Guides";
  const description =
    category === "software"
      ? "OS updates, driver downloads, and software guides"
      : "Detailed guides and manuals for all hardware products";

  useTitle(title);

  useEffect(() => {
    async function loadGuides() {
      setIsLoading(true);
      try {
        const data = await getGuides(category);
        setGuides(data);
      } catch (error) {
        console.error("Failed to load guides:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadGuides();
  }, [category]);

  const filteredGuides = guides.filter(
    (guide) =>
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.summary?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <div className="pt-24 pb-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link
            to="/support"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 mb-8 transition-colors"
          >
            <span>&larr;</span>
            Back to Support
          </Link>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <span>{category === "software" ? "S" : "H"}</span>
              </div>
              <div>
                <h1 className="text-3xl font-sora font-bold text-slate-900 dark:text-white">
                  {title}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md mt-6">
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Content Rendering */}
          {(() => {
            if (isLoading) {
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 animate-pulse"
                    >
                      <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-4" />
                    </div>
                  ))}
                </div>
              );
            }

            if (filteredGuides.length === 0) {
              return (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">?</div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    No guides found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    {searchQuery
                      ? "Try a different search term"
                      : "Guides will appear here once published"}
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGuides.map((guide) => (
                  <div key={guide.id}>
                    <Link
                      to={`/support/${category}/${guide.slug}`}
                      className="block bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all overflow-hidden group"
                    >
                      {guide.coverImage && (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={guide.coverImage}
                            alt={guide.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                          {guide.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                          {guide.summary}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>
                            {format(new Date(guide.createdAt), "MMM d, yyyy")}
                          </span>
                          {guide.authorName && (
                            <span>By {guide.authorName}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
};

export default SupportGuidesPage;
