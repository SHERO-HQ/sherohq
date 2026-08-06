import { m, AnimatePresence } from "motion/react";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/assets/icons/icons";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import type { Order } from "@/services/api";

export function PaymentPending({
  order,
  brand,
  loadingText,
  readableOrderId,
  orderId,
}: {
  order: Order | null;
  brand: any;
  loadingText: string;
  readableOrderId: string;
  orderId: string;
}) {
  return (
    <div className="py-8 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800/50 rounded flex items-center justify-center mb-6 shadow-inner">
        <ShieldCheck className="w-7 h-7 text-slate-400 dark:text-slate-500" />
      </div>

      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2 text-center tracking-tight">
        Processing Transfer
      </h2>
      <div className="h-6 overflow-hidden mb-6">
        <AnimatePresence mode="wait">
          <m.p
            key={loadingText}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-slate-500 dark:text-slate-400 text-sm font-medium"
          >
            {loadingText}
          </m.p>
        </AnimatePresence>
      </div>

      <div className="w-full bg-white dark:bg-[#0f1115] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded p-8 mb-8 border border-slate-100 dark:border-slate-800/60 relative overflow-hidden">
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent ${brand.glow} to-transparent`}
        />

        <div className="flex flex-col items-center mb-10">
          <span className="text-slate-400 text-[11px] uppercase tracking-[0.2em] font-semibold mb-3">
            Total Amount
          </span>
          {order && order.total > 0 ? (
            <div className="flex items-start gap-1">
              <span className="text-lg font-medium text-slate-400 mt-1">
                GHS
              </span>
              <span className="text-5xl font-light tracking-tight text-slate-900 dark:text-white">
                {order.total.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="h-12 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          )}
        </div>

        <div className="space-y-5">
          <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500 text-sm font-medium">To</span>
            <span className="text-slate-900 dark:text-slate-100 text-sm font-semibold">
              SHERO TECHNOLOGIES
            </span>
          </div>
          <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500 text-sm font-medium">Ref ID</span>
            <span className="text-slate-900 dark:text-slate-100 text-sm font-mono">
              {readableOrderId}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-sm font-medium">Network</span>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
              <div
                className={`w-2 h-2 rounded-full ${brand.pulse} animate-pulse`}
              />
              <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wide">
                Authorizing
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full space-y-3">
        <a
          href={`https://wa.me/${COMPANY_CONTACTS.WHATSAPP}?text=${encodeURIComponent(
            `Hello SHERO, my transfer for order ${readableOrderId} is still authorizing. Can you check?`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-6 py-4 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors group"
        >
          <div className="flex items-center gap-3">
            <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
            <span className="font-semibold text-sm">Contact Support</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </a>

        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              const isShop = window.location.hostname.includes("shop.");
              const targetHost = isShop
                ? window.location.host.replace("shop.", "")
                : window.location.host;
              window.location.href = `${window.location.protocol}//${targetHost}/track/${orderId}`;
            }
          }}
          className="w-full flex items-center justify-between px-6 py-4 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-slate-400 dark:border-slate-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            </div>
            <span className="font-semibold text-sm">Track Status Later</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
