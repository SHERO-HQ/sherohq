import { useInView } from "motion/react";
import { Activity, Globe, Users, Trophy, Box } from "lucide-react";
import { useRef, useEffect, useState, useMemo } from "react";
import { useStats } from "@/hooks/queries/useStats";

interface Stat {
  value: string;
  label: string;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  color: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users className="w-5 h-5" />,
  Trophy: <Trophy className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
};

const LandingStats = () => {
  const { data: apiStats = [], isLoading } = useStats();

  const stats: Stat[] = useMemo(() => {
    return apiStats.map((s) => ({
      value: s.value,
      label: s.label,
      suffix: s.suffix,
      prefix: s.prefix,
      icon: (s.icon && iconMap[s.icon]) || <Box className="w-5 h-5" />,
      color: s.color || "text-emerald-500",
    }));
  }, [apiStats]);

  return (
    <section className="relative w-full py-16 bg-white dark:bg-slate-950 overflow-hidden border-y border-slate-200 dark:border-slate-900 transition-colors duration-300">
      {/* Background patterns */}
      <div className="absolute inset-0 pattern-grid-emerald opacity-[0.03] dark:opacity-[0.5] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* The Hub Container */}
        <div className="relative flex flex-col md:flex-row items-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded overflow-hidden shadow-2xl shadow-emerald-500/5 group/hub">
          {/* Pulsing Aura */}
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/hub:opacity-100 transition-opacity duration-1000 animate-pulse pointer-events-none" />

          {/* Scanning Line Effect (Horizontal) */}
          <div className="absolute inset-y-0 left-0 w-px bg-emerald-500/30 hidden md:block" />

          {isLoading ? (
            // Skeleton State
            [1, 2, 3, 4].map((i) => (
              <div
                key={`skeleton-${i}`}
                className={`relative flex-1 w-full py-10 px-8 flex flex-col items-center md:items-start animate-pulse
                           ${i === 4 ? "" : "border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800"}`}
              >
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))
          ) : (
            <>
              {stats.length === 0 ? (
                <div className="w-full py-12 flex items-center justify-center text-slate-500">
                  <p>No stats available</p>
                </div>
              ) : (
                stats.map((stat, idx) => (
                  <div
                    key={stat.label}
                    className={`relative flex-1 w-full py-10 px-8 flex flex-col items-center md:items-start transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50
                               ${idx === stats.length - 1 ? "" : "border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800"}`}
                  >
                    {/* Corner Accent (Top Left) */}
                    <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-emerald-500 opacity-40" />

                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {stat.icon}
                      </div>
                      <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500">
                        {stat.label}
                      </span>
                    </div>

                    <StatItem stat={stat} />

                    {/* Individual Pattern Overlay */}
                    <div className="absolute inset-0 pattern-dots pointer-events-none" />
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

const StatItem = ({ stat }: { stat: Stat }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const target = Number.parseInt(stat.value, 10);
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, stat.value]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center md:items-start select-none"
    >
      <div className="flex items-baseline gap-1">
        <span className="text-4xl md:text-5xl font-sora font-extrabold text-slate-900 dark:text-white tracking-tighter">
          {stat.prefix}
          {count.toLocaleString()}
          {stat.suffix}
        </span>
      </div>

      {/* Mini Progress Line */}
      <div className="mt-4 w-12 h-0.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
          style={{ width: isInView ? "100%" : "0%" }}
        />
      </div>
    </div>
  );
};

export default LandingStats;
