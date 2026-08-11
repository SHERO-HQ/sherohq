"use client";

import React from "react";
import { Loader2, CheckCircle, AlertTriangle, Send, Check, X } from "lucide-react";

interface ConfigStatus {
  hasAccessToken: boolean;
  hasPhoneNumberId: boolean;
  loading: boolean;
}

interface WhatsAppSettingsTabProps {
  configStatus: ConfigStatus;
  handleSendTest: (e: React.FormEvent) => void;
  testPhone: string;
  setTestPhone: (val: string) => void;
  testTemplate: string;
  setTestTemplate: (val: string) => void;
  setTestTemplateLang: (val: string) => void;
  testParams: string;
  setTestParams: (val: string) => void;
  dbTemplates: any[];
  sendingTest: boolean;
  testSuccess: boolean | null;
  testError: string;
}

export function WhatsAppSettingsTab({
  configStatus,
  handleSendTest,
  testPhone,
  setTestPhone,
  testTemplate,
  setTestTemplate,
  setTestTemplateLang,
  testParams,
  setTestParams,
  dbTemplates,
  sendingTest,
  testSuccess,
  testError,
}: WhatsAppSettingsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* System Status Credentials */}
      <div className="bg-card/40 border border-border rounded p-6 backdrop-blur-md space-y-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            System Configuration Status
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verification of Meta credentials defined in the environment parameters.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-card rounded border border-border">
            <div>
              <h5 className="text-xs font-bold text-foreground">Meta API Token</h5>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                WHATSAPP_ACCESS_TOKEN
              </p>
            </div>
            {configStatus.loading ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground bg-accent px-2.5 py-0.5 rounded border border-border">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking...
              </span>
            ) : configStatus.hasAccessToken ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5" /> Configured
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5" /> Missing
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-3.5 bg-card rounded border border-border">
            <div>
              <h5 className="text-xs font-bold text-foreground">Meta Phone Number ID</h5>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                WHATSAPP_PHONE_NUMBER_ID
              </p>
            </div>
            {configStatus.loading ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground bg-accent px-2.5 py-0.5 rounded border border-border">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking...
              </span>
            ) : configStatus.hasPhoneNumberId ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5" /> Configured
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5" /> Missing
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-3.5 bg-card rounded border border-border">
            <div>
              <h5 className="text-xs font-bold text-foreground">Incoming Messages Webhook</h5>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                GET/POST /api/webhooks/whatsapp
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5" /> Active
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Meta Webhook Target URL
          </h5>
          <code className="block bg-card p-3 rounded border border-border text-xs text-brand-secondary-400 break-all select-all font-mono">
            {typeof window !== "undefined"
              ? `${window.location.origin}/api/webhooks/whatsapp`
              : "https://yourdomain.com/api/webhooks/whatsapp"}
          </code>
        </div>
      </div>

      {/* Manual Template Test Form */}
      <div className="bg-card/40 border border-border rounded p-6 backdrop-blur-md flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Dispatch Test Template</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Send an approved transactional message template to verify API connectivity.
          </p>
        </div>

        <form onSubmit={handleSendTest} className="space-y-4 my-6">
          <div>
            <label
              className="block text-xs font-semibold text-muted-foreground mb-1"
              htmlFor="test-phone-number"
            >
              Recipient Phone Number (with country code, e.g. +23354XXXXXXX)
            </label>
            <input
              id="test-phone-number"
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+233541234567"
              required
              className="w-full px-4 py-2.5 bg-card border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-secondary-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-semibold text-muted-foreground mb-1"
                htmlFor="test-template-name"
              >
                Template Name
              </label>
              <select
                id="test-template-name"
                value={testTemplate}
                onChange={(e) => {
                  const t = dbTemplates.find((x) => x.name === e.target.value);
                  if (t) {
                    setTestTemplate(t.name);
                    setTestTemplateLang(t.whatsappTemplateLanguage || "en");
                    if (t.expectedParams && t.expectedParams.length > 0) {
                      setTestParams(t.expectedParams.map((p: string) => `[${p}]`).join(","));
                    } else {
                      setTestParams("");
                    }
                  } else {
                    setTestTemplate(e.target.value);
                  }
                }}
                required
                className="w-full px-4 py-2.5 bg-card border border-border rounded text-sm text-foreground focus:outline-none appearance-none"
              >
                <option value="">-- Select --</option>
                {dbTemplates.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} {t.category ? `(${t.category})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-semibold text-muted-foreground mb-1"
                htmlFor="test-template-params"
              >
                Parameters (CSV)
              </label>
              <input
                id="test-template-params"
                type="text"
                value={testParams}
                onChange={(e) => setTestParams(e.target.value)}
                placeholder="e.g. 123456"
                className="w-full px-4 py-2.5 bg-card border border-border rounded text-sm text-foreground focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={sendingTest}
            className="w-full bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground py-2.5 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {sendingTest ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Test Template
          </button>
        </form>

        {/* Status Banner */}
        {testSuccess === true && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            Test template message dispatched successfully! Check logs.
          </div>
        )}
        {testSuccess === false && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded flex items-start gap-2">
            <X className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Dispatch failed</p>
              <p className="mt-0.5 text-rose-300 font-mono text-[10px] break-all">
                {testError}
              </p>
            </div>
          </div>
        )}
        {testSuccess === null && <div className="h-10" />}
      </div>
    </div>
  );
}
