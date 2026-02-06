import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export default function Toaster() {
  const { notifications, markAsRead } = useNotifications();

  // We only show unread notifications as toasts
  const [activeToasts, setActiveToasts] = useState<string[]>([]);

  useEffect(() => {
    // Add new unread notifications to active toasts
    const unread = notifications.filter((n) => !n.read);
    unread.forEach((n) => {
      if (!activeToasts.includes(n.id)) {
        setActiveToasts((prev) => [...prev, n.id]);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          markAsRead(n.id);
          setActiveToasts((prev) => prev.filter((id) => id !== n.id));
        }, 5000);
      }
    });
  }, [notifications, activeToasts, markAsRead]);

  const removeToast = (id: string) => {
    markAsRead(id);
    setActiveToasts((prev) => prev.filter((tid) => tid !== id));
  };

  return (
    <div className="fixed top-20 right-4 z-9999 flex flex-col gap-3 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {activeToasts.map((id) => {
          const notification = notifications.find((n) => n.id === id);
          if (!notification) return null;

          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-4 rounded border shadow-2xl backdrop-blur-md",
                notification.type === "success" &&
                  "bg-emerald-950/90 border-emerald-500/20 text-emerald-50",
                notification.type === "error" &&
                  "bg-rose-950/90 border-rose-500/20 text-rose-50",
                notification.type === "warning" &&
                  "bg-amber-950/90 border-amber-500/20 text-amber-50",
                notification.type === "info" &&
                  "bg-slate-900/90 border-slate-700/50 text-slate-50",
              )}
            >
              <div className="shrink-0 mt-0.5">
                {notification.type === "success" && (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                )}
                {notification.type === "error" && (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                {notification.type === "warning" && (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                {notification.type === "info" && (
                  <Info className="w-5 h-5 text-blue-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold font-sora leading-none mb-1">
                  {notification.title}
                </h4>
                <p className="text-xs opacity-80 leading-relaxed">
                  {notification.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(id)}
                className="shrink-0 p-1 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
