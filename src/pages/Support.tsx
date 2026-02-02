import { useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  FileText,
  Download,
  MessageCircle,
  LifeBuoy,
  Phone,
  Mail,
  ArrowRight,
  Ticket,
  HeadsetIcon,
  // Linkedin,
} from "lucide-react";
import {
  TelegramIcon,
  TwitterXIcon,
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
} from "@/assets/icons/icons";
import Footer from "@/components/layout/Footer";
import { useTitle } from "@/hooks/useTitle";
import SupportTicketForm from "@/components/support/SupportTicketForm";
import { Link } from "react-router-dom";

const Support = () => {
  useTitle("Support Center");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const resources = [
    {
      title: "Hardware Support",
      description: "Detailed guides and manuals for all hardware products.",
      icon: FileText,
      link: "/support/hardware",
    },
    {
      title: "Software Support",
      description: "OS updates, driver downloads, and software updates.",
      icon: Download,
      link: "/support/software",
    },
    {
      title: "Community Forum",
      description:
        "Connect with other users, share tips, and find solutions. Join our community on our social media pages to get started.",
      icon: MessageCircle,
      socials: [
        { icon: WhatsAppIcon, url: "https://wa.me/233548711582" },
        { icon: TelegramIcon, url: "https://t.me/sherohq" },
        { icon: FacebookIcon, url: "https://web.facebook.com/profile.php?id=61583887925479" },
        { icon: InstagramIcon, url: "https://instagram.com/sherohq" },
        { icon: TwitterXIcon, url: "https://twitter.com/sherohq" },
      ],
    },
  ];

  return (
    <>
      <div className="pt-24 pb-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full border border-emerald-500/20 uppercase">
              <LifeBuoy className="w-4 h-4" />
              <span className="text-emerald-600 dark:text-emerald-400">
                Support Center
              </span>
            </div>
            <h1 className="md:text-4xl text-3xl font-sora font-bold text-slate-900 dark:text-white mb-4">
              How can we help?
            </h1>
            <p className="text-slate-600 text-sm dark:text-slate-400 max-w-2xl mx-auto mb-8">
              Find answers, download drivers, or contact our dedicated support
              team for assistance.
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for articles, guides, and more..."
                  className="w-full pl-12 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {resources.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-900 p-8 rounded border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all group"
              >
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-sora font-bold text-slate-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm dark:text-slate-400 mb-6 leading-relaxed">
                  {item.description}
                </p>

                {item.socials ? (
                  <div className="flex gap-4">
                    {item.socials.map((social, i) => (
                      <a
                        key={i}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-emerald-500 transition-colors"
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <Link
                    to={item.link!}
                    className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold group-hover:gap-3 transition-all"
                  >
                    Browse <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="flex items-center justify-around bg-white dark:bg-slate-900 rounded p-8 md:p-12 border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/2" />
            <div className="z-10 flex items-center justify-center">
              {/* little glow Decoration for the headset icon */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
              <HeadsetIcon className="w-28 h-28 hidden lg:block text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="w-px h-42 bg-slate-200 dark:bg-slate-800 hidden lg:block" />
            <div className="z-10">
              <h2 className="md:text-3xl text-2xl font-sora font-bold text-slate-900 dark:text-white mb-4">
                Still need help?
              </h2>
              <p className="text-slate-600 text-sm dark:text-slate-400 mb-8 max-w-xl mx-auto">
                Can't find what you're looking for? Our support team is
                available Monday through Friday, 9am to 6pm EST.
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setIsTicketModalOpen(true)}
                  className="flex items-center gap-3 px-4 py-2 sm:px-6 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors sm:min-w-[200px] justify-center shadow-lg hover:shadow-xl shadow-emerald-500/20 w-full md:w-auto"
                  aria-label="Submit a Ticket"
                >
                  <Ticket className="w-5 h-5" />
                  <div className="w-px h-5 bg-white/20" />
                  <span>Ticket</span>
                </button>
                <a
                  href="mailto:info.sherohq@gmail.com"
                  className="flex items-center gap-3 px-6 py-2 sm:px-6 rounded bg-slate-300/70 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-w-[200px] justify-center w-full md:w-auto"
                >
                  <Mail className="w-5 h-5" />
                  <div className="w-px h-5 bg-slate-500/20" />
                  <span>Email Us</span>
                </a>
                <a
                  href="tel:+233548711582"
                  className="flex items-center gap-3 px-6 py-2 sm:px-6 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors min-w-[200px] justify-center shadow-lg hover:shadow-xl shadow-emerald-500/20 w-full md:w-auto"
                >
                  <Phone className="w-5 h-5" />
                  <div className="w-px h-5 bg-white/20" />
                  <span>Call Support</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <SupportTicketForm
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
    </>
  );
};

export default Support;
