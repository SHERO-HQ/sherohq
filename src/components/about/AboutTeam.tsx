import { motion } from "motion/react";
import { Github, Linkedin, Users, Twitter } from "lucide-react";
import type { ElementType } from "react";
import teamKwame from "@/assets/images/team/team-kwame.png";
import teamAbena from "@/assets/images/team/team-abena.png";
import teamKofi from "@/assets/images/team/team-kofi.png";
import teamEfua from "@/assets/images/team/team-efua.png";
import teamYaw from "@/assets/images/team/team-yaw.png";
import teamAma from "@/assets/images/team/team-ama.png";

// Professional Ghanaian Team
const team = [
  {
    name: "Kwame Mensah",
    role: "Founder & Lead Architect",
    image: teamKwame,
    bio: "Visionary leader with 15+ years in digital transformation. Kwame spearheads our mission to bridge Africa's digital divide.",
    social: { twitter: "#", linkedin: "#", github: "#" },
  },
  {
    name: "Abena Osei",
    role: "Head of Product Design",
    image: teamAbena,
    bio: "Champion of inclusive design. Abena ensures every SHERO product is intuitive and resonates with our diverse user base.",
    social: { twitter: "#", linkedin: "#", github: "#" },
  },
  {
    name: "Kofi Asare",
    role: "Senior Cloud Architect",
    image: teamKofi,
    bio: "Infrastructure wizard specializing in high-availability systems. Kofi builds the backbone of our enterprise solutions.",
    social: { twitter: "#", linkedin: "#", github: "#" },
  },
  {
    name: "Efua Boateng",
    role: "Lead Software Engineer",
    image: teamEfua,
    bio: "Full-stack expert with a passion for clean, performant code. Efua leads our engineering teams to excellence.",
    social: {
      twitter: "https://x.com/",
      linkedin: "https://linkedin.com/",
      github: "https://github.com/",
    },
  },
  {
    name: "Yaw Appiah",
    role: "Cybersecurity Lead",
    image: teamYaw,
    bio: "Security first. Yaw protects our clients' digital assets with state-of-the-art protocols and proactive monitoring.",
    social: { twitter: "#", linkedin: "#", github: "#" },
  },
  {
    name: "Ama Serwaa",
    role: "Operations Manager",
    image: teamAma,
    bio: "The glue that holds us together. Ama ensures seamless execution and world-class service delivery for every project.",
    social: { twitter: "#", linkedin: "#", github: "#" },
  },
];

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
  return (
    <section className="py-24 bg-white pattern-dots dark:bg-slate-900 overflow-hidden border-y border-slate-200 dark:border-white/5 transition-colors duration-300">
      {/* <div className="absolute inset-0 pattern-dots opacity-80 pointer-events-none" /> */}
      <div className="container px-4 md:px-6 mx-auto w-full md:max-w-10/12">
        <div className="mb-16 space-y-4 flex flex-col md:flex-row md:justify-between justify-start md:items-center items-start">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded-full uppercase transition-colors duration-300">
              <Users className="w-4 h-4" />
              Our Team
            </span>
            <h2 className="text-3xl md:text-5xl font-sora font-bold text-slate-900 dark:text-white transition-colors duration-300">
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

          {team.map((member, index) => (
            <motion.div
              key={member.name}
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
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 backdrop-blur-[2px]">
                  <p className="text-white text-sm leading-relaxed font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {member.bio}
                  </p>
                </div>
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
                  <SocialLink href={member.social.twitter} icon={Twitter} />
                  <SocialLink href={member.social.linkedin} icon={Linkedin} />
                  <SocialLink href={member.social.github} icon={Github} />
                </div>
              </div>
            </motion.div>
          ))}
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
    className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
  >
    <Icon className="w-4 h-4" />
  </a>
);

export default AboutTeam;
