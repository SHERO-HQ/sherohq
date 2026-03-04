"use client";
import { useState } from "react";
import { resendVerificationEmail } from "@/services/api";

export const useVerification = () => {
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleResendVerification = async (email: string) => {
    if (!email) return;
    setResendingEmail(true);
    setResendMessage("");
    try {
      await resendVerificationEmail(email);
      setResendMessage("Verification email sent! Check your inbox.");
    } catch (err: unknown) {
      setResendMessage(
        err instanceof Error ? err.message : "Failed to send email",
      );
    } finally {
      setResendingEmail(false);
    }
  };

  return {
    resendingEmail,
    resendMessage,
    handleResendVerification,
  };
};
