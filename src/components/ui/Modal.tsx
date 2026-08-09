"use client";
import { m, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Focus Management (Run only when isOpen changes)
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;

      // Focus the first element (close button or input)
      // Small timeout to ensure content is mounted and to let other effects settle
      const timer = setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (firstFocusable instanceof HTMLElement) {
          firstFocusable.focus();
        }
      }, 10);

      return () => {
        clearTimeout(timer);
        previousFocus.current?.focus();
      };
    }
  }, [isOpen]);

  // 2. Event Listeners and Background Scroll Lock
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };

      const handleTab = (e: KeyboardEvent) => {
        if (!modalRef.current || e.key !== "Tab") return;

        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      };

      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleTab);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.removeEventListener("keydown", handleEscape);
        document.removeEventListener("keydown", handleTab);
      };
    }
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 dark:bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
          />

          {/* Content Panel */}
          <m.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ maxHeight: 'calc(100dvh - 2rem)' }}
            className="relative glass-surface-lg text-foreground w-full max-w-2xl flex flex-col overflow-hidden shadow-xl rounded"
          >
            <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10 shrink-0">
              <h2
                id="modal-title"
                className="text-lg font-bold text-black dark:text-white"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-1 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer hover:bg-red-500/50 rounded shrink-0"
                type="button"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar overscroll-contain">
              {children}
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
