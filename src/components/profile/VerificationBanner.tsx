import React from "react";
import { AlertCircle, Loader2, Send } from "lucide-react";

interface VerificationBannerProps {
  emailVerified: boolean | undefined;
  resendingEmail: boolean;
  resendMessage: string;
  onResend: () => void;
}

const VerificationBanner: React.FC<VerificationBannerProps> = ({
  emailVerified,
  resendingEmail,
  resendMessage,
  onResend,
}) => {
  if (emailVerified !== false) return null;

  return (
    <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <div>
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Please verify your email address
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Check your inbox for a verification link.
          </p>
        </div>
      </div>
      <button
        onClick={onResend}
        disabled={resendingEmail}
        className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
      >
        {resendingEmail ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        Resend Email
      </button>
      {resendMessage && (
        <p className="w-full text-sm text-amber-700 dark:text-amber-300 mt-2">
          {resendMessage}
        </p>
      )}
    </div>
  );
};

export default VerificationBanner;
