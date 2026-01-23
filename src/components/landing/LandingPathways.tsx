import { NavLink } from "react-router-dom";
import { motion } from "motion/react";
import {
  ShoppingBag,
  MessageSquare,
  Handshake,
  Code,
  Route,
  ArrowRight,
} from "lucide-react";

const LandingPathways = () => {
  const paths = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      label: "For Everyone",
      title: "Shop Products",
      description:
        "Premium hardware and accessories curated for the modern professional.",
      cta: "Visit Store",
      link: "/products",
      gradient: "from-blue-600 to-cyan-500",
      image:
        "bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')]",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      label: "For Businesses",
      title: "Consultation",
      description:
        "Strategic advisory to navigate your digital transformation.",
      cta: "Book Session",
      link: "/consultation",
      gradient: "from-emerald-600 to-teal-500",
      image:
        "bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop')]",
    },
    {
      icon: <Handshake className="w-8 h-8" />,
      label: "For Partners",
      title: "Partnerships",
      description: "Join our global network of technology innovators.",
      cta: "Collaborate",
      link: "/partners",
      gradient: "from-purple-600 to-pink-500",
      image:
        "bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop')]",
    },
    {
      icon: <Code className="w-8 h-8" />,
      label: "For Enterprise",
      title: "Solutions & Infrastructure",
      description:
        "Custom software development, server configurations, and managed IT infrastructure.",
      cta: "Get Started",
      link: "/solutions",
      gradient: "from-indigo-600 to-blue-500",
      image:
        "bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop')]",
    },
  ];

  return (
    <section className="relative w-full py-32 bg-slate-950 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-900/50 rounded-full blur-[120px]" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <header className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-900 rounded-full">
            <Route className="size-4" />
            Navigate Your Journey
          </span>
          <h2 className="text-5xl lg:text-7xl font-sora font-bold text-white mb-6 tracking-tight">
            Choose Your Path
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Tailored gateways to the technology solutions you need.
          </p>
        </header>

        {/* Interactive Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-auto lg:h-[500px]">
          {paths.map((path) => (
            <motion.div
              key={path.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative flex-1 flex flex-col justify-end p-8 rounded overflow-hidden border border-white/5 bg-slate-900 transition-all duration-500 hover:flex-2 hover:border-white/20"
            >
              {/* Background Image with Overlay */}
              <div
                className={`absolute inset-0 ${path.image} bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-500 scale-105 group-hover:scale-100 transform`}
              />
              <div
                className={`absolute inset-0 bg-linear-to-t ${path.gradient.replace("from-", "from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90")}`}
              />

              {/* Content */}
              <div className="relative z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div
                  className={`w-12 h-12 rounded bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 text-white border border-white/10 group-hover:scale-110 transition-transform duration-500`}
                >
                  {path.icon}
                </div>

                <span className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1 block">
                  {path.label}
                </span>
                <h3 className="text-2xl font-bold text-white mb-2 font-sora">
                  {path.title}
                </h3>
                <p className="text-slate-300 text-sm mb-6 max-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 h-0 group-hover:h-auto">
                  {path.description}
                </p>

                <NavLink
                  to={path.link}
                  className="inline-flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all duration-300"
                >
                  {path.cta}
                  <ArrowRight className="w-4 h-4" />
                </NavLink>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPathways;
