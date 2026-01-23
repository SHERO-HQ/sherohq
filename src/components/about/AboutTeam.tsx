import { motion } from "motion/react";
import { Github, Linkedin, Users, Twitter } from "lucide-react";
import type { ElementType } from "react";

// Placeholder data - In real app, these would be real images
const team = [
  {
    name: "Alex Chen",
    role: "Founder & Lead Architect",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
    bio: "10+ years in full-stack dev. Obsessed with clean code and scalable architecture.",
    social: { twitter: "#", linkedin: "#", github: "#" },
  },
  {
    name: "Sarah Miller",
    role: "Head of Design",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
    bio: "Award-winning UX/UI designer with a passion for accessible and responsive interfaces.",
    social: { twitter: "#", linkedin: "#", github: "#" },
  },
  {
    name: "Marcus Johnson",
    role: "Senior Backend Engineer",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
    bio: "Expert in cloud infrastructure, database optimization, and API security.",
    social: { twitter: "#", linkedin: "#", github: "#" },
  },
  {
    name: "Emily Zhang",
    role: "Frontend Specialist",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
    bio: "React wizard. Turns complex requirements into buttery smooth user experiences.",
    social: {
      twitter: "https://x.com/",
      linkedin: "https://linkedin.com/",
      github: "https://github.com/",
    },
  },
  {
    name: "David Kim",
    role: "DevOps Engineer",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=faces",
    bio: "Ensures our reliable infrastructure and smooth CI/CD pipelines.",
    social: { twitter: "#", linkedin: "#", github: "#" },
  },
  {
    name: "Lisa Wong",
    role: "Product Manager",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces",
    bio: "Bridging the gap between client needs and technical execution.",
    social: { twitter: "#", linkedin: "#", github: "#" },
  },
];

const AboutTeam = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-white/5 transition-colors duration-300">
      <div className="container px-4 md:px-6 mx-auto w-full md:max-w-10/12">
        <div className="mb-16 space-y-4 flex flex-col md:flex-row md:justify-between justify-start md:items-center items-start">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded-full uppercase transition-colors duration-300">
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
            <button className="text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-2 mx-auto uppercase tracking-wider text-sm">
              Join the team <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative bg-slate-50 dark:bg-slate-950/50 rounded border border-slate-200 dark:border-white/5 p-4 hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className="relative overflow-hidden rounded bg-slate-200 dark:bg-slate-800 mb-6 aspect-square sm:aspect-[4/3] transition-colors duration-300">
                <img
                  src={member.image}
                  alt={member.name}
                  loading="lazy"
                  decoding="async"
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                />

                {/* Overlay with bio */}
                <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 text-center backdrop-blur-sm">
                  <p className="text-slate-200 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold font-sora text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4">{member.role}</p>
                </div>

                <div className="flex gap-3">
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
