"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { useGuides } from "@/hooks/queries/useGuides";
import { ArrowLeft, Search, Monitor, Settings, ArrowRight } from "lucide-react";
import AppImage from "@/components/common/AppImage";

const SupportGuidesPage = () => {
  const { category } = useParams<{ category: "hardware" | "software" }>();
  const { data: guides = [], isLoading } = useGuides(category);
  const [searchQuery, setSearchQuery] = useState("");

  const title = category === "software" ? "Software Guides" : "Hardware Guides";
  const description =
    category === "software"
      ? "OS updates, driver downloads, and software guides"
      : "Detailed guides and manuals for all hardware products";

  const filteredGuides = guides.filter(
    (guide) =>
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.summary?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="pt-24 pb-12 bg-background min-h-screen text-foreground relative overflow-hidden transition-colors duration-300">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-125 h-125 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-0 w-100 h-100 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] -z-10" />

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Support Hub</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-lg shadow-emerald-500/10 shrink-0">
                {category === "software" ? (
                  <Settings className="w-9 h-9" />
                ) : (
                  <Monitor className="w-9 h-9" />
                )}
              </div>
              <div>
                <h1 className="text-4xl font-sora font-bold text-foreground mb-2 tracking-tight">
                  {title}
                </h1>
                <p className="text-muted-foreground text-sm">{description}</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full max-w-md group">
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-card/40 dark:bg-slate-900/40 backdrop-blur-md border border-border rounded focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-foreground placeholder:text-muted-foreground"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Content Rendering */}
        {(() => {
          if (isLoading) {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="bg-card/40 dark:bg-slate-900/40 rounded border border-border p-6 animate-pulse"
                  >
                    <div className="h-40 bg-secondary/50 rounded mb-6 shadow-inner" />
                    <div className="h-6 bg-secondary/50 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-secondary/50 rounded w-full mb-6" />
                    <div className="h-4 bg-secondary/50 rounded w-1/2" />
                  </div>
                ))}
              </div>
            );
          }

          if (filteredGuides.length === 0) {
            return (
              <div className="text-center py-24 bg-secondary/30 dark:bg-slate-900/30 rounded border border-border backdrop-blur-sm">
                <div className="w-20 h-20 bg-secondary/50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                  <Search className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-sora font-bold text-foreground mb-3">
                  No guides found
                </h3>
                <p className="text-muted-foreground text-lg">
                  {searchQuery
                    ? "Try a different search term"
                    : "Guides will appear here once published"}
                </p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGuides.map((guide) => (
                <div key={guide.id}>
                  <Link
                    href={`/support/${category}/${guide.slug}`}
                    className="block bg-card dark:bg-slate-900/40 backdrop-blur-md rounded border border-border hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden group h-full relative"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {guide.coverImage && (
                      <div className="h-48 overflow-hidden bg-secondary relative">
                        <AppImage
                          src={guide.coverImage}
                          alt={guide.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 to-transparent" />
                      </div>
                    )}
                    <div className="p-7 relative z-10">
                      <h3 className="text-xl font-sora font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                        {guide.summary}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="px-2.5 py-1 rounded bg-secondary border border-border">
                            {format(new Date(guide.createdAt), "MMM d, yyyy")}
                          </span>
                          {guide.authorName && (
                            <span className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                              {guide.authorName}
                            </span>
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-emerald-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
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
