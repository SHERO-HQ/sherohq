import { motion } from "motion/react";
import {
  LifeBuoy,
  FileText,
  MessageCircle,
  Phone,
  Mail,
  Download,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import { useTitle } from "@/hooks/useTitle";

const Support = () => {
  useTitle("Support Center");

  const resources = [
    {
      title: "Product Documentation",
      description:
        "Detailed guides and manuals for all our hardware and software products.",
      icon: FileText,
      action: "Browse Docs",
    },
    {
      title: "Software Drivers",
      description:
        "Download the latest drivers and firmware updates for your devices.",
      icon: Download,
      action: "Downloads",
    },
    {
      title: "Community Forum",
      description: "Connect with other users, share tips, and find solutions.",
      icon: MessageCircle,
      action: "Visit Forum",
    },
  ];

  return (
    <>
      <div className="pt-24 pb-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-sora font-bold text-slate-900 dark:text-white mb-4">
              How can we help you?
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-8">
              Find answers, download drivers, or contact our dedicated support
              team.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <input
                type="text"
                placeholder="Search for articles, manuals, or help..."
                className="w-full px-6 py-4 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all pl-12"
              />
              <LifeBuoy className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {resources.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-900 p-8 rounded border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                  {item.description}
                </p>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm group-hover:underline decoration-2 underline-offset-4">
                  {item.action} &rarr;
                </span>
              </motion.div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="bg-slate-900 text-white rounded p-8 md:p-12 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                <p className="text-slate-300 max-w-md">
                  Our expert support team is available Mon-Fri, 8am - 6pm GMT to
                  assist you with any technical issues.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="cursor-pointer flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition-colors">
                  <Phone className="w-4 h-4" />
                  Call Support
                </button>
                <button className="cursor-pointer flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded font-bold transition-colors">
                  <Mail className="w-4 h-4" />
                  Email Us
                </button>
              </div>
            </div>

            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Support;
