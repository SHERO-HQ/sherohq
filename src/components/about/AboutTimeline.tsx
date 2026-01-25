import { motion } from "motion/react";
import { Flag, Rocket, Trophy, Globe, Zap, History } from "lucide-react";

const milestones = [
  {
    year: "2018",
    title: "The Inception",
    description:
      "Founded in a garage with a vision to democratize enterprise-grade technology for startups.",
    icon: Flag,
    color: "emerald",
  },
  {
    year: "2020",
    title: "Global Expansion",
    description:
      "Expanded operations to 3 continents, establishing our first international HQ in Singapore.",
    icon: Globe,
    color: "blue",
  },
  {
    year: "2022",
    title: "Innovation Award",
    description:
      "Recognized as the 'Most Innovative Tech Disrupter' by TechCrunch for our SaaS platform.",
    icon: Trophy,
    color: "amber",
  },
  {
    year: "2024",
    title: "Tech Nexus Launch",
    description:
      "Unveiled the 'Tech Nexus' ecosystem, unifying hardware and software into a seamless experience.",
    icon: Zap,
    color: "purple",
  },
  {
    year: "2025",
    title: "Future Horizons",
    description:
      "Investing heavily in AI and Quantum Computing research to power the next decade.",
    icon: Rocket,
    color: "pink",
  },
];

const AboutTimeline = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden relative border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 dark:opacity-20 transition-opacity duration-300" />

      <div className="container max-w-5xl mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded-full transition-colors duration-300">
            <History className="w-4 h-4" />
            Our Journey
          </span>
          <h2 className="text-3xl md:text-5xl font-sora font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
            Pioneering the Future
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors duration-300">
            From humble beginnings to global impact, exploring the key moments
            that defined our path.
          </p>
        </div>

        <div className="relative">
          {/* Central Line - hidden on mobile, replaced by left line */}
          <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent transition-colors duration-300" />

          <div className="space-y-16 md:space-y-24">
            {milestones.map((item, index) => (
              <TimelineItem key={item.year} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const TimelineItem = ({
  item,
  index,
}: {
  item: (typeof milestones)[number];
  index: number;
}) => {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className={`relative flex items-center justify-between flex-row md:${
        isEven ? "flex-row-reverse" : "flex-row"
      } gap-8 md:gap-0`}
    >
      {/* Content Side */}
      <div className="w-full pl-16 md:pl-0 md:w-5/12">
        <div
          className={`p-6 rounded bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 backdrop-blur-sm hover:border-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/20 group text-left md:text-${
            isEven ? "right" : "left"
          }`}
        >
          <span
            className={`inline-block py-1 px-3 rounded mb-3 text-sm font-mono font-semibold bg-${item.color}-500/10 text-${item.color}-600 dark:text-${item.color}-400 border border-${item.color}-500/20`}
          >
            {item.year}
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
            {item.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors duration-300">
            {item.description}
          </p>
        </div>
      </div>

      {/* Axis Point */}
      <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-10 md:w-12 h-10 md:h-12 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] z-10 transition-colors duration-300">
        <div
          className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-${item.color}-500 animate-pulse`}
        />
      </div>

      {/* Empty Space for alignment (hidden on mobile) */}
      <div className="hidden md:block w-5/12" />
    </motion.div>
  );
};

export default AboutTimeline;
