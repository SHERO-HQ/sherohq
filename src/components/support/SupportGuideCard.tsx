import { format } from "date-fns";
import { ArrowRight, Calendar } from "lucide-react";
import type { SupportGuide } from "@/data/supportGuides";

interface SupportGuideCardProps {
  guide: SupportGuide;
}

export function SupportGuideCard({ guide }: SupportGuideCardProps) {
  const IconComponent = guide.icon;

  return (
    <div className="group bg-white dark:bg-slate-900 p-5 rounded border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {guide.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {guide.description}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Calendar className="w-3 h-3" />
              {format(new Date(guide.date), "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Read <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
