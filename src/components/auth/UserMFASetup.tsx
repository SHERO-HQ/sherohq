"use client";

import { useState } from "react";
import { Shield, CheckCircle2, AlertCircle, Copy, Loader2 } from "lucide-react";
import {Modal} from "@/components/ui/Modal";

interface UserMFASetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserMFASetup({ isOpen, onClose, onSuccess }: UserMFASetupProps) {
  const [step, setStep] = useState<"intro" | "scan" | "verify">("intro");
  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  const startSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/mfa/setup", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSetupData(data.data);
        setStep("scan");
      } else {
        setError(data.error || "Failed to initialize MFA setup");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        setRecoveryCodes(data.data.recoveryCodes);
        setStep("verify"); // We stay on verify step but show success view
      } else {
        setError(data.error || "Invalid verification code");
      }
    } catch (err) {
      setError("Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Setup 2nd-Step Verification">
      <div className="space-y-6 py-2">
        {step === "intro" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto">
              <Shield size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Protect your account</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add an extra layer of security by requiring a 6-digit code from an authenticator app whenever you log in.
              </p>
            </div>
            <button
              onClick={startSetup}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Get Started"}
            </button>
          </div>
        )}

        {step === "scan" && setupData && (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-sm font-medium text-gray-500">STEP 1 OF 2</p>
              <h3 className="text-lg font-bold">Scan the QR Code</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Open your authenticator app (like Google Authenticator or Authy) and scan the code below.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mx-auto w-fit">
              <img src={setupData.qrCode} alt="MFA QR Code" className="w-48 h-48" />
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-2">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Manual Entry Code</p>
              <div className="flex items-center justify-between gap-4">
                <code className="text-lg font-mono text-blue-600 dark:text-blue-400 break-all">
                  {setupData.secret}
                </code>
                <button
                  onClick={copySecret}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep("verify")}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              I've scanned it, continue
            </button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-6">
            {!recoveryCodes ? (
              <>
                <div className="space-y-2 text-center">
                  <p className="text-sm font-medium text-gray-500">STEP 2 OF 2</p>
                  <h3 className="text-lg font-bold">Verify the Code</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Enter the 6-digit code generated by your authenticator app to confirm setup.
                  </p>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="000 000"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center text-3xl tracking-[0.5em] font-mono py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 outline-none transition-colors"
                  />

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    onClick={verifySetup}
                    disabled={loading || code.length !== 6}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                    {loading ? "Verifying..." : "Enable MFA"}
                  </button>

                  <button
                    onClick={() => setStep("scan")}
                    className="w-full py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                  >
                    Back to QR Code
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="text-xl font-bold">MFA Enabled Successfully!</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Save these recovery codes in a safe place. You can use them to access your account if you lose your phone.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  {recoveryCodes.map((code, index) => (
                    <div key={index} className="flex items-center gap-3 font-mono text-sm">
                      <span className="text-gray-400 w-4">{index + 1}.</span>
                      <span className="font-bold text-gray-900 dark:text-white">{code}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const blob = new Blob([recoveryCodes.join("\n")], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "sherotech-recovery-codes.txt";
                      a.click();
                    }}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy size={18} />
                    Download
                  </button>
                  <button
                    onClick={onSuccess}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Finish Setup
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
