"use client";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Info, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  isLoading?: boolean;
  showCancel?: boolean;
  isPrompt?: boolean;
  promptValue?: string;
  onPromptChange?: (value: string) => void;
  placeholder?: string;
  inputType?: string;
}

const variantStyles = {
  danger: {
    icon: "bg-red-500/20 text-red-400",
    button: "bg-red-600 hover:bg-red-500 text-white",
  },
  warning: {
    icon: "bg-amber-500/20 text-amber-400",
    button: "bg-amber-600 hover:bg-amber-500 text-white",
  },
  info: {
    icon: "bg-emerald-500/20 text-emerald-400",
    button: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
  success: {
    icon: "bg-emerald-500/20 text-emerald-400",
    button: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
  showCancel = true,
  isPrompt = false,
  promptValue = "",
  onPromptChange,
  placeholder = "",
  inputType = "text",
}: Readonly<ConfirmDialogProps>) {
  const styles = variantStyles[variant] || variantStyles.info;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  }

  function handleConfirm() {
    onConfirm();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && isPrompt) {
      e.preventDefault();
      onConfirm();
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />

          {/* Alert Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative glass-surface-lg w-full max-w-md overflow-hidden shadow-2xl rounded border border-slate-700/50 bg-slate-900/95"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-0">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded flex items-center justify-center ${styles.icon}`}>
                  {variant === "danger" || variant === "warning" ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : variant === "success" ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Info className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {message && <p className="text-slate-300 text-sm leading-relaxed">{message}</p>}

              {isPrompt && (
                <div className="mt-2">
                  <input
                    type={inputType}
                    value={promptValue}
                    onChange={(e) => onPromptChange?.(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoFocus
                    className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-6 pt-0">
              {showCancel && (
                <Button
                  onClick={onClose}
                  disabled={isLoading}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  {cancelText}
                </Button>
              )}
              <Button onClick={handleConfirm} disabled={isLoading} className={styles.button}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  confirmText
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
