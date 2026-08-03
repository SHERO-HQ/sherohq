import { motion, AnimatePresence } from "motion/react";
import { Loader } from "lucide-react";

export function PaymentVerifying({ brand, loadingText }: { brand: any, loadingText: string }) {
  return (
    <div className="pt-4 pb-20 flex flex-col items-center justify-center">
      <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          className={`absolute inset-0 ${brand.ring} rounded-full`}
        />
        <motion.div
          animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 1,
          }}
          className={`absolute inset-0 ${brand.ring} rounded-full`}
        />
        <div
          className={`w-16 h-16 ${brand.iconBg} rounded-full flex items-center justify-center z-10 border border-slate-100 dark:border-slate-800`}
        >
          <Loader className={`w-7 h-7 ${brand.iconText} animate-spin`} />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className={`absolute inset-0 border border-dashed ${brand.border} rounded-full`}
        />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 tracking-tight">
        Confirming Your Payment
      </h2>
      <div className="h-6 overflow-hidden mb-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingText}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-slate-500 dark:text-slate-400 text-sm font-medium"
          >
            {loadingText}
          </motion.p>
        </AnimatePresence>
      </div>
      <p className="text-slate-400 dark:text-slate-500 text-sm max-w-70 mx-auto text-center leading-relaxed">
        Please wait while we confirm your payment details with the gateway.
      </p>
    </div>
  );
}
