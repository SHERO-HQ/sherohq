import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, User, Monitor, Settings } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { useTitle } from "@/hooks/useTitle";
import { getGuideBySlug, type SupportGuide } from "@/services/guides";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import UniversalLink from "@/components/common/UniversalLink";

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
      <div className="dark min-h-screen bg-slate-950">
        <div className="pt-24 pb-12">
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
        <Footer />
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="dark min-h-screen bg-slate-950">
        <div className="pt-24 pb-12">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
            {category === "software" ? (
              <Settings className="w-16 h-16 text-slate-800 mx-auto mb-4" />
            ) : (
              <Monitor className="w-16 h-16 text-slate-800 mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold text-white mb-4">
              {error || "Guide not found"}
            </h2>
            <UniversalLink
              to={`/support/${category}`}
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {categoryTitle}
            </UniversalLink>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-300">
      <div className="pt-24 pb-12">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <UniversalLink
              to={`/support/${category}`}
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to {categoryTitle}</span>
            </UniversalLink>
          </div>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded border border-white/5 overflow-hidden shadow-2xl shadow-emerald-500/5"
          >
            {/* Cover Image */}
            {guide.coverImage && (
              <div className="h-64 md:h-80 overflow-hidden bg-slate-800">
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-900/30 rounded-full border border-emerald-500/20">
                  {category === "software" ? (
                    <Settings className="w-3.5 h-3.5" />
                  ) : (
                    <Monitor className="w-3.5 h-3.5" />
                  )}
                  {categoryTitle}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-sora font-bold text-white mb-4">
                {guide.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 pb-8 border-b border-white/5">
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
                <p className="text-lg text-slate-400 mb-8 leading-relaxed font-medium">
                  {guide.summary}
                </p>
              )}

              {/* Content */}
              <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-sora prose-a:text-emerald-400 prose-img:rounded-xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {guide.content}
                </ReactMarkdown>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SupportGuideDetail;
