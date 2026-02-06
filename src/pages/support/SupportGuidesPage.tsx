import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { useTitle } from "@/hooks/useTitle";
import { useGuides } from "@/hooks/queries/useGuides";
import { ArrowLeft, Search, Monitor, Settings } from "lucide-react";
import UniversalLink from "@/components/common/UniversalLink";

const SupportGuidesPage = () => {
  const { category } = useParams<{ category: "hardware" | "software" }>();
  const { data: guides = [], isLoading } = useGuides(category);
  const [searchQuery, setSearchQuery] = useState("");

  const title = category === "software" ? "Software Guides" : "Hardware Guides";
  const description =
    category === "software"
      ? "OS updates, driver downloads, and software guides"
      : "Detailed guides and manuals for all hardware products";

  useTitle(title);

  const filteredGuides = guides.filter(
    (guide) =>
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.summary?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="dark pt-24 pb-12 bg-slate-950 min-h-screen text-slate-300">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <UniversalLink
            to="/support"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Support</span>
          </UniversalLink>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-emerald-900/30 rounded flex items-center justify-center text-emerald-400">
              {category === "software" ? (
                <Settings className="w-8 h-8" />
              ) : (
                <Monitor className="w-8 h-8" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-sora font-bold text-white">
                {title}
              </h1>
              <p className="text-slate-400">{description}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md mt-6">
            <input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white placeholder:text-slate-500"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
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
                    className="bg-slate-900/40 rounded border border-white/5 p-6 animate-pulse"
                  >
                    <div className="h-32 bg-slate-800/50 rounded mb-4" />
                    <div className="h-5 bg-slate-800/50 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-slate-800/50 rounded w-full mb-4" />
                  </div>
                ))}
              </div>
            );
          }

          if (filteredGuides.length === 0) {
            return (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 text-slate-700">?</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No guides found
                </h3>
                <p className="text-slate-500">
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
                    className="block bg-slate-900/50 backdrop-blur-sm rounded border border-white/5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all overflow-hidden group h-full"
                  >
                    {guide.coverImage && (
                      <div className="h-40 overflow-hidden bg-slate-800">
                        <img
                          src={guide.coverImage}
                          alt={guide.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                        {guide.summary}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>
                          {format(new Date(guide.createdAt), "MMM d, yyyy")}
                        </span>
                        {guide.authorName && <span>By {guide.authorName}</span>}
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
  );
};

export default SupportGuidesPage;
