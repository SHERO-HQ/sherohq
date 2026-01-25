import { Construction } from "lucide-react";
import { motion } from "motion/react";
import { NavLink } from "react-router-dom";

const Development: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden dark:bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 px-6">
      
      {/* Background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative max-w-md w-full rounded border dark:border-white/10 dark:bg-white/5 backdrop-blur-xl p-8 text-center dark:shadow-2xl shadow"
      >
        {/* Icon */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded border dark:bg-white/10 text-3xl"
        >
          <Construction />
        </motion.div>

        <h1 className="text-3xl font-semibold text-slate-600 dark:text-slate-200 mb-3">
          You caught us 👀
        </h1>

        <p className="text-slate-400 mb-6">
          This page is under development. We’re building something
          beautiful—stay tuned.
        </p>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Progress</span>
            <span>72%</span>
          </div>
          <div className="h-2 w-full rounded dark:bg-white/10 bg-slate-200 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "72%" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded bg-linear-to-r from-indigo-500 to-cyan-400"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <NavLink to='/' className="px-5 py-2 rounded bg-primary text-slate-300 font-medium hover:bg-primary/90 transition w-full">
            Go Home
          </NavLink>

        </div>
      </motion.div>
    </div>
  );
};

export default Development;
