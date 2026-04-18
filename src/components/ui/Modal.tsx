"use client";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface ModalProps {
 isOpen: boolean;
 onClose: () => void;
 title: string;
 children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
 const modalRef = useRef<HTMLDivElement>(null);
 const previousFocus = useRef<HTMLElement | null>(null);

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

 // 2. Event Listeners (Run when isOpen or onClose changes)
 useEffect(() => {
 if (isOpen) {
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
 document.removeEventListener("keydown", handleEscape);
 document.removeEventListener("keydown", handleTab);
 };
 }
 }, [isOpen, onClose]);

 return (
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 role="dialog"
 aria-modal="true"
 aria-labelledby="modal-title"
 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 "
 onClick={onClose}
 >
 <motion.div
 ref={modalRef}
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.95, opacity: 0 }}
 onClick={(e) => e.stopPropagation()}
 className="bg-slate-900 border border-white/10 rounded shadow w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
 >
 <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
 <h2 id="modal-title" className="text-lg font-bold text-white">
 {title}
 </h2>
 <button
 onClick={onClose}
 className="p-1 text-slate-400 hover:text-white transition-colors"
 type="button"
 aria-label="Close modal"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 <div className="p-6 overflow-y-auto custom-scrollbar">
 {children}
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
};
