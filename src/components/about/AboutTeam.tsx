import { motion } from "motion/react";
import { Github, Linkedin, Users, Twitter } from "lucide-react";
import type { ElementType } from "react";
import { useTeam } from "@/hooks/queries/useTeam";
import { Skeleton } from "@/components/ui/Skeleton";

// Helper to get initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const AboutTeam = () => {
  const { data: team = [], isLoading } = useTeam();

  // If loading or empty, we could show skeletons or fallback
  // For now, let's just make it graceful:

  return (
    <section className="py-24 bg-white pattern-dots dark:bg-slate-900 overflow-hidden border-y border-slate-200 dark:border-white/5 transition-colors duration-300">
      <div className="container px-4 md:px-6 mx-auto w-full md:max-w-10/12">
        <div className="mb-16 space-y-4 flex flex-col md:flex-row md:justify-between justify-start md:items-center items-start">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded uppercase transition-colors duration-300">
              <Users className="w-4 h-4" />
              Our Team
            </span>
            <h2 className="text-3xl md:text-4xl font-sora font-bold text-slate-900 dark:text-white transition-colors duration-300">
              Meet the Minds
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mt-2 transition-colors duration-300">
              The talented individuals behind our innovative products and
              reliable services.
            </p>
          </div>
          <div className="pt-2">
            <button className="cursor-pointer text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-2 mx-auto uppercase tracking-wider text-sm">
              Join the team <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {/* Decorative background blur */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))
          ) : team.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-800">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                Our team is growing correctly! Check back soon.
              </p>
            </div>
          ) : (
            team.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-white/5 p-4 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 overflow-hidden"
              >
                <div className="relative overflow-hidden rounded bg-slate-100 dark:bg-slate-800 mb-6 aspect-square transition-colors duration-300">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      width={400}
                      height={400}
                      loading="lazy"
                      decoding="async"
                      className="object-cover w-full h-full transition-all duration-700 filter grayscale group-hover:grayscale-0 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-blue-600/20 to-emerald-600/20 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-4xl tracking-tighter transition-all duration-700 group-hover:from-blue-600 group-hover:to-emerald-600 group-hover:text-white">
                      {getInitials(member.name)}
                    </div>
                  )}

                  {/* Overlay with bio - Sleeker design */}
                  {member.bio && (
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 backdrop-blur-[2px]">
                      <p className="text-white text-sm leading-relaxed font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        {member.bio}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end px-2">
                  <div>
                    <h3 className="text-xl font-bold font-sora text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-emerald-600 dark:text-emerald-500 text-sm font-semibold mt-1">
                      {member.role}
                    </p>
                  </div>

                  <div className="flex gap-4 mb-1">
                    {member.social?.twitter && (
                      <SocialLink href={member.social.twitter} icon={Twitter} />
                    )}
                    {member.social?.linkedin && (
                      <SocialLink
                        href={member.social.linkedin}
                        icon={Linkedin}
                      />
                    )}
                    {member.social?.github && (
                      <SocialLink href={member.social.github} icon={Github} />
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

const SocialLink = ({
  href,
  icon: Icon,
}: {
  href: string;
  icon: ElementType;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer noopener"
    className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
  >
    <Icon className="w-4 h-4" />
  </a>
);

export default AboutTeam;
