"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, User, Monitor, Settings } from "lucide-react";
import { getGuideBySlug, type SupportGuide } from "@/services/guides";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AppImage from "@/components/common/AppImage";
import Link from "next/link";

const SupportGuideDetail = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const [guide, setGuide] = useState<SupportGuide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryTitle =
    category === "software" ? "Software Guides" : "Hardware Guides";

  useEffect(() => {
    async function loadGuide() {
      if (!slug) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getGuideBySlug(slug);
        setGuide(data);
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to load guide:", err);
        }
        setError("Guide not found or failed to load");
      } finally {
        setIsLoading(false);
      }
    }
    loadGuide();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="dark min-h-screen bg-slate-950">
        <div className="pt-8 pb-12">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-32 mb-8" />
              <div className="h-10 bg-slate-800 rounded w-3/4 mb-4" />
              <div className="h-4 bg-slate-800 rounded w-1/3 mb-8" />
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-4 bg-slate-800/50 rounded"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="dark min-h-screen bg-slate-950">
        <div className="pt-8 pb-12">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
            {category === "software" ? (
              <Settings className="w-16 h-16 text-slate-800 mx-auto mb-4" />
            ) : (
              <Monitor className="w-16 h-16 text-slate-800 mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold text-white mb-4">
              {error || "Guide not found"}
            </h2>
            <Link
              href={`/support/${category}`}
              className="inline-flex items-center gap-2 text-brand-secondary-400 hover:text-brand-secondary-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {categoryTitle}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-300">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-1/4 w-125 h-125 bg-brand-secondary-500/5 dark:bg-brand-secondary-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-125 h-125 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <div className="pt-8 pb-12">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              href={`/support/${category}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to {categoryTitle}</span>
            </Link>
          </div>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/40 dark:bg-slate-900/40  rounded border border-border overflow-hidden shadow relative"
          >
            <div className="absolute inset-0 bg-linear-to-br from-brand-secondary-500/5 to-transparent pointer-events-none" />

            {/* Cover Image */}
            {guide.coverImage && (
              <div className="h-64 md:h-96 overflow-hidden bg-secondary relative">
                <AppImage
                  src={guide.coverImage}
                  alt={guide.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent" />
              </div>
            )}

            <div className="pt-8 md:p-16 relative z-10">
              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-900/40 rounded-full border border-brand-secondary-200 dark:border-brand-secondary-500/20 uppercase tracking-wider">
                  {category === "software" ? (
                    <Settings className="w-4 h-4" />
                  ) : (
                    <Monitor className="w-4 h-4" />
                  )}
                  {categoryTitle}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                {guide.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-10 pb-10 border-b border-border">
                <span className="flex items-center gap-2 px-3 py-1.5 rounded bg-secondary border border-border">
                  <Calendar className="w-4 h-4 text-brand-secondary-500/60" />
                  {format(new Date(guide.createdAt), "MMMM d, yyyy")}
                </span>
                {guide.authorName && (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded bg-secondary border border-border">
                    <User className="w-4 h-4 text-brand-secondary-500/60" />
                    {guide.authorName}
                  </span>
                )}
              </div>

              {/* Summary */}
              {guide.summary && (
                <p className="text-xl text-muted-foreground mb-12 leading-relaxed font-medium">
                  {guide.summary}
                </p>
              )}

              {/* Content */}
              <div
                className="prose prose-lg prose-slate dark:prose-invert max-w-none 
 prose-headings: prose-headings:text-foreground prose-headings:tracking-tight
 prose-p:text-muted-foreground prose-p:leading-relaxed
 prose-a:text-brand-secondary-600 dark:prose-a:text-brand-secondary-400 prose-a:font-bold hover:prose-a:text-brand-secondary-700 dark:hover:prose-a:text-brand-secondary-300 prose-a:transition-colors
 prose-img:rounded prose-img:shadow
 prose-strong:text-brand-secondary-600 dark:prose-strong:text-brand-secondary-400
 prose-code:text-brand-secondary-700 dark:prose-code:text-brand-secondary-300 prose-code:bg-brand-secondary-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
 prose-pre:bg-secondary/50 dark:prose-pre:bg-slate-800/50 prose-pre:border prose-pre:border-border prose-pre:rounded
 prose-blockquote:border-l-4 prose-blockquote:border-brand-secondary-500 prose-blockquote:bg-brand-secondary-500/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic
 "
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {guide.content}
                </ReactMarkdown>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </div>
  );
};

export default SupportGuideDetail;
