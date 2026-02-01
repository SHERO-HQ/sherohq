import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, User, Monitor, Settings } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { useTitle } from "@/hooks/useTitle";
import { getGuideBySlug, type SupportGuide } from "@/services/guides";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SupportGuideDetail = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const [guide, setGuide] = useState<SupportGuide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useTitle(guide?.title || "Loading...");

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
        console.error("Failed to load guide:", err);
        setError("Guide not found or failed to load");
      } finally {
        setIsLoading(false);
      }
    }
    loadGuide();
  }, [slug]);

  if (isLoading) {
    return (
      <>
        <div className="pt-24 pb-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32 mb-8" />
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-8" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-4 bg-slate-200 dark:bg-slate-800 rounded"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !guide) {
    return (
      <>
        <div className="pt-24 pb-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
            {category === "software" ? (
              <Settings className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            ) : (
              <Monitor className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
              {error || "Guide not found"}
            </h2>
            <Link
              to={`/support/${category}`}
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-500"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {categoryTitle}
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="pt-24 pb-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link
            to={`/support/${category}`}
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {categoryTitle}
          </Link>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Cover Image */}
            {guide.coverImage && (
              <div className="h-64 md:h-80 overflow-hidden">
                <img
                  src={guide.coverImage}
                  alt={guide.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8 md:p-12">
              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                  {category === "software" ? (
                    <Settings className="w-3.5 h-3.5" />
                  ) : (
                    <Monitor className="w-3.5 h-3.5" />
                  )}
                  {categoryTitle}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-sora font-bold text-slate-900 dark:text-white mb-4">
                {guide.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(guide.createdAt), "MMMM d, yyyy")}
                </span>
                {guide.authorName && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {guide.authorName}
                  </span>
                )}
              </div>

              {/* Summary */}
              {guide.summary && (
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed font-medium">
                  {guide.summary}
                </p>
              )}

              {/* Content */}
              <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-sora prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-img:rounded-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {guide.content}
                </ReactMarkdown>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SupportGuideDetail;
