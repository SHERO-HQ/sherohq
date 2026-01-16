import { motion } from "motion/react";
import { Quote, UserCheck, MessageSquarePlus } from "lucide-react";

const testimonials = [
  {
    quote:
      "SHERO transformed our outdated legacy system into a high-performance cloud platform. The transition was seamless, and the results were immediate.",
    author: "Jennifer Wu",
    role: "CTO",
    company: "TechFlow Solutions",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces",
  },
  {
    quote:
      "Their attention to detail and commitment to quality is unmatched. They didn't just build what we asked for; they built what we needed to grow.",
    author: "David Ross",
    role: "Director of Operations",
    company: "Apex Logistics",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
  },
  {
    quote:
      "The team at SHERO are true partners. They understood our business goals and delivered a product that exceeded our wildest expectations.",
    author: "Sarah L.",
    role: "Founder",
    company: "Bloom Health",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

      <div className="container px-4 md:px-6 relative z-10 w-full mx-auto md:w-10/12">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
            <UserCheck className="w-5" />
            Success Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-sora font-bold text-slate-900 dark:text-slate-100 mt-2 mb-4">
            Trusted by Leaders
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="bg-white dark:bg-slate-950 p-8 rounded shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col relative group hover:-translate-y-2 transition-transform duration-300"
            >
              <Quote className="w-10 h-10 text-emerald-100 dark:text-emerald-900/30 mb-6 absolute top-8 right-8 group-hover:text-emerald-500/20 transition-colors" />

              <p className="text-slate-600 dark:text-slate-300 italic mb-8 relative z-10 leading-relaxed">
                "{item.quote}"
              </p>

              <div className="mt-auto flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.author}
                  className="w-16 h-16 rounded object-cover border-2 border-slate-100 dark:border-slate-800"
                />
                <div>
                  <h4 className="font-bold font-sora text-slate-900 dark:text-slate-100 text-sm">
                    {item.author}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.role}, {item.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feedback CTA */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex flex-col items-center gap-4 p-8 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded text-emerald-600 dark:text-emerald-400">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-sora text-slate-900 dark:text-slate-100 mb-2">
                Got a Feedback?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 max-w-xs mx-auto">
                We value your input! Help us improve our products and services.
              </p>
              <button className="px-6 py-2.5 bg-secondary text-white rounded font-medium hover:opacity-90 transition-opacity cursor-pointer">
                Share Your Thoughts
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
