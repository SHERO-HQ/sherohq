"use client";
import { useState, type ElementType } from "react";
import { motion } from "motion/react";
import { Github, Linkedin, Users } from "lucide-react";
import { useTeam } from "@/hooks/queries/useTeam";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/services/api";
import { TwitterXIcon } from "@/assets/icons/icons";
import AppImage from "@/components/common/AppImage";

interface TeamMemberWithPlaceholder extends TeamMember {
  isPlaceholder?: boolean;
}

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
  const [activeBioId, setActiveBioId] = useState<string | null>(null);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`team-skeleton-${i}`} className="space-y-4">
              <Skeleton className="h-64 w-full rounded" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      );
    }

    if (team.length === 0) {
      return (
        <div className="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            Our team is growing! Check back soon.
          </p>
        </div>
      );
    }

    return (
      <div className="relative border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 min-[470px]:grid-cols-2 lg:grid-cols-4 relative">
          {/* Decorative background blur */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {team.map((member: TeamMemberWithPlaceholder, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onClick={() =>
                setActiveBioId(activeBioId === member.id ? null : member.id)
              }
              className={cn(
                "group relative p-4 transition-colors duration-500 hover:bg-slate-50/50 dark:hover:bg-white/2 cursor-pointer",
                // Horizontal borders
                "border-b border-slate-200 dark:border-white/10",
                // Vertical borders logic
                "min-[470px]:border-r", // Default right border on 470px+
                (index + 1) % 2 === 0 && "min-[470px]:border-r-0", // Remove every 2nd on 470px+
                "lg:border-r", // Restore/set right border on lg
                (index + 1) % 4 === 0 && "lg:border-r-0", // Remove every 4th on lg
              )}
            >
              {/* Coming Soon Badge for placeholders (no image)
              {!member.image && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-2 py-0.5 text-[8px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-tighter">
                    Coming Soon
                  </span>
                </div>
              )} */}
              <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4 aspect-square transition-colors duration-300">
                {member.image ? (
                  <AppImage
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover rounded transition-all duration-700 filter grayscale group-hover:grayscale-0 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-blue-600/20 to-emerald-600/20 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-5xl tracking-tighter transition-all duration-700 group-hover:from-blue-600 group-hover:to-emerald-600 group-hover:text-white">
                    {getInitials(member.name)}
                  </div>
                )}

                {/* Overlay with bio */}
                {member.bio && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent transition-opacity duration-300 flex flex-col justify-end p-8 backdrop-blur-[2px]",
                      activeBioId === member.id
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100",
                    )}
                  >
                    <p
                      className={cn(
                        "text-white text-sm leading-relaxed font-medium transition-transform duration-500",
                        activeBioId === member.id
                          ? "translate-y-0"
                          : "translate-y-4 group-hover:translate-y-0",
                      )}
                    >
                      {member.bio}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <h3 className="text-2xl font-bold font-sora text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-emerald-600 dark:text-emerald-500 text-sm font-bold mt-1 uppercase tracking-widest">
                    {member.role}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex gap-1 items-center">
                    {member.social?.twitter && (
                      <SocialLink
                        href={member.social.twitter}
                        icon={TwitterXIcon}
                      />
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

                  <div className="h-8 w-8 rounded bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 text-slate-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

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
        {renderContent()}
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
    rel="noopener noreferrer"
    className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-1"
  >
    <Icon className="w-5 h-5" />
  </a>
);

export default AboutTeam;
