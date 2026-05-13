"use client";

import FeedbackForm from "@/components/feedback/FeedbackForm";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Legacy FeedbackModal wrapper.
 * Now uses the unified FeedbackForm component in modal mode.
 */
export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  return (
    <FeedbackForm 
      mode="modal" 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Share Your Feedback"
      description="Tell us about your experience. Your input helps us provide the best service possible."
    />
  );
}
