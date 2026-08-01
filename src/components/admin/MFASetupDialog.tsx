"use client";
import { useState } from "react";
import { Shield, Loader2, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setupAdminMFA, verifyAdminMFASetup } from "@/services/admin";
import AppImage from "@/components/common/AppImage";

interface MFASetupDialogProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function MFASetupDialog({ onSuccess, onCancel }: MFASetupDialogProps) {
  const [step, setStep] = useState<"init" | "setup" | "verify" | "success">("init");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mfaData, setMfaData] = useState<{ qrCode: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleStartSetup() {
    setLoading(true);
    setError("");
    try {
      const data = await setupAdminMFA();
      setMfaData(data);
      setStep("setup");
    } catch (err: any) {
      setError(err.message || "Failed to initialize MFA setup");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (code.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      await verifyAdminMFASetup(code);
      setStep("success");
      setTimeout(onSuccess, 2000);
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  }

  const copySecret = () => {
    if (!mfaData?.secret) return;
    navigator.clipboard.writeText(mfaData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-secondary-400" />
            <h3 className="text-lg font-bold text-foreground">Setup Multi-Factor Auth</h3>
          </div>
          {step !== "success" && (
            <button 
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <div className="p-8">
          {step === "init" && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-brand-secondary-500/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-brand-secondary-400" />
              </div>
              <div className="space-y-2">
                <p className="text-foreground font-medium">Strengthen your account</p>
                <p className="text-sm text-muted-foreground">
                  MFA adds a mandatory second step to your login. You'll need an authenticator app like Google Authenticator or Microsoft Authenticator.
                </p>
              </div>
              <Button 
                onClick={handleStartSetup} 
                disabled={loading}
                className="w-full bg-brand-secondary-500 hover:bg-brand-secondary-600 text-white font-bold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Get Started
              </Button>
            </div>
          )}

          {step === "setup" && mfaData && (
            <div className="space-y-6 text-center">
              <p className="text-sm text-muted-foreground">
                1. Scan this QR code with your authenticator app:
              </p>
              <div className="bg-white p-4 rounded inline-block shadow-inner mx-auto">
                <img src={mfaData.qrCode} alt="MFA QR Code" width={180} height={180} className="w-44 h-44" />
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Or enter this secret key manually:</p>
                <div className="flex items-center gap-2 bg-card p-2 rounded border border-border">
                  <code className="text-xs text-brand-secondary-400 font-mono flex-1">{mfaData.secret}</code>
                  <button onClick={copySecret} className="text-muted-foreground hover:text-foreground transition-colors">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                onClick={() => setStep("verify")} 
                className="w-full bg-muted hover:bg-accent text-foreground"
              >
                I've scanned it
              </Button>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <p className="text-foreground font-medium">Verify Setup</p>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code from your app to confirm.
                </p>
              </div>

              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full bg-card border border-border rounded py-4 text-center text-3xl tracking-[0.5em] font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-brand-secondary-500"
                autoFocus
              />

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep("setup")}
                  className="flex-1 text-muted-foreground hover:text-foreground"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleVerify} 
                  disabled={loading || code.length !== 6}
                  className="flex-2 bg-brand-secondary-500 hover:bg-brand-secondary-600 text-white font-bold"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Enable MFA"}
                </Button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-foreground">MFA Enabled!</p>
                <p className="text-sm text-muted-foreground">
                  Your account is now more secure. You'll need your authenticator app for future logins.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
