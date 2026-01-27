import { useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, Code2, Smartphone, Server, Layers, Wrench } from "lucide-react";

interface Project {
  id: string;
  title: string;
  category:
    | "Web Development"
    | "Mobile Apps"
    | "Infrastructure"
    | "Custom Software";
  client: string;
  description: string;
  useCase: string;
  technologies: string[];
  image: string;
  link?: string;
}

const Portfolio = () => {
  const projects: Project[] = [
    {
      id: "1",
      title: "E-Commerce Platform",
      category: "Web Development",
      client: "RetailCo Ghana",
      description:
        "Full-stack e-commerce solution with inventory management, payment integration, and analytics dashboard.",
      useCase:
        "Handling massive traffic spikes during Black Friday sales while maintaining real-time inventory synchronization across multiple warehouses.",
      technologies: ["React", "Node.js", "PostgreSQL", "Stripe"],
      image: "🛒",
    },
    {
      id: "2",
      title: "Mobile Banking App",
      category: "Mobile Apps",
      client: "FinTech Solutions",
      description:
        "Secure mobile banking application with biometric authentication and real-time transaction processing.",
      useCase:
        "Providing bank-grade security for low-latency transactions, allowing users to send money internationally in under 3 seconds.",
      technologies: ["React Native", "Firebase", "Node.js"],
      image: "💳",
    },
    {
      id: "3",
      title: "Cloud Infrastructure",
      category: "Infrastructure",
      client: "TechCorp Ltd",
      description:
        "Scalable cloud infrastructure with auto-scaling, load balancing, and monitoring solutions.",
      useCase:
        "Migrating legacy on-prem systems to the cloud to reduce operational costs by 40% and improve uptime to 99.99%.",
      technologies: ["AWS", "Kubernetes", "Docker", "Terraform"],
      image: "☁️",
    },
    {
      id: "4",
      title: "Inventory Management System",
      category: "Custom Software",
      client: "Manufacturing Inc",
      description:
        "Custom ERP solution for inventory tracking, order management, and supply chain optimization.",
      useCase:
        "Streamlining complex supply chains to give manufacturers 360-degree visibility of material flow from raw purchase to final delivery.",
      technologies: ["Python", "Django", "PostgreSQL", "Redis"],
      image: "📦",
    },
    {
      id: "5",
      title: "Healthcare Portal",
      category: "Web Development",
      client: "MediCare Ghana",
      description:
        "Patient management system with appointment scheduling, medical records, and telemedicine features.",
      useCase:
        "Enabling secure remote consultations and encrypted patient record access to expand healthcare reach to rural areas.",
      technologies: ["Next.js", "MongoDB", "WebRTC"],
      image: "🏥",
    },
    {
      id: "6",
      title: "Delivery Tracking App",
      category: "Mobile Apps",
      client: "LogisticsPro",
      description:
        "Real-time delivery tracking with GPS integration, route optimization, and customer notifications.",
      useCase:
        "Optimizing delivery routes in real-time to reduce fuel consumption by 15% and provide customers with accurate ETAs.",
      technologies: ["Flutter", "Google Maps API", "Firebase"],
      image: "📍",
    },
  ];

  const categories = [
    "All",
    "Web Development",
    "Mobile Apps",
    "Infrastructure",
    "Custom Software",
  ];
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Web Development":
        return <Code2 className="w-4 h-4" />;
      case "Mobile Apps":
        return <Smartphone className="w-4 h-4" />;
      case "Infrastructure":
        return <Server className="w-4 h-4" />;
      case "Custom Software":
        return <Layers className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <section className="relative w-full py-20 bg-slate-50 dark:bg-slate-950">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded-full uppercase">
          <Wrench className="size-4" />
            Our Work
          </span>
          <h2 className="text-4xl md:text-5xl font-sora font-bold text-slate-900 dark:text-white mb-4">
            Featured Projects
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore our portfolio of successful projects and see how we've
            helped businesses transform digitally
          </p>
        </motion.div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="cursor-pointer grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
            >
              {/* Project Image */}
              <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden">
                <div className="text-7xl group-hover:scale-110 transition-transform duration-300">
                  {project.image}
                </div>

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-emerald-600/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    View Project
                    <ExternalLink className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="p-6">
                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded">
                    {getCategoryIcon(project.category)}
                    {project.category}
                  </span>
                </div>

                {/* Title & Client */}
                <h3 className="text-xl font-bold font-sora text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  Client: {project.client}
                </p>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Use Case */}
                <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded text-sm border-l-2 border-emerald-500">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                    Use Case
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed italic">
                    "{project.useCase}"
                  </p>
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              No projects found in this category
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
