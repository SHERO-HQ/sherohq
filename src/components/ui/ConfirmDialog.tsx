"use client";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    isLoading?: boolean;
    showCancel?: boolean;
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
        icon: "bg-blue-500/20 text-blue-400",
        button: "bg-blue-600 hover:bg-blue-500 text-white",
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
    variant = "danger",
    isLoading = false,
    showCancel = true,
}: Readonly<ConfirmDialogProps>) {
    const styles = variantStyles[variant];

    function handleBackdropClick(e: React.MouseEvent) {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    }

    function handleConfirm() {
        onConfirm();
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
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm will-change-opacity"
                        style={{
                            WebkitBackfaceVisibility: "hidden",
                            backfaceVisibility: "hidden",
                            transform: "translate3d(0,0,0)",
                        }}
                        onClick={handleBackdropClick}
                    />

                    {/* Alert Card */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        className="relative glass-surface-lg w-full max-w-md overflow-hidden shadow will-change-transform"
                        style={{
                            WebkitBackfaceVisibility: "hidden",
                            backfaceVisibility: "hidden",
                            transform: "translate3d(0,0,0)",
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between p-6 pb-0">
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center ${styles.icon}`}
                                >
                                    <AlertTriangle className="w-6 h-6" />
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
                        <div className="p-6">
                            <p className="text-slate-400">{message}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 p-6 pt-0">
                            {showCancel && (
                                <Button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300"
                                >
                                    {cancelText}
                                </Button>
                            )}
                            <Button
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className={styles.button}
                            >
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
