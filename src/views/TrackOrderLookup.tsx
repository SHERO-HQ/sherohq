"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Search } from "lucide-react";

export default function TrackOrderLookup() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedOrderId = orderId.trim().replace(/^ord-/i, "");
    const normalizedToken = token.trim();

    if (!normalizedOrderId) {
      setError("Order ID is required.");
      return;
    }

    setError("");

    const basePath = `/track/${encodeURIComponent(normalizedOrderId)}`;
    const query = normalizedToken
      ? `?token=${encodeURIComponent(normalizedToken)}`
      : "";

    router.push(`${basePath}${query}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-8 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-6 sm:p-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Track Your Order
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Enter your order ID to view latest delivery status.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="orderId"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
              >
                Order ID
              </label>
              <input
                id="orderId"
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                placeholder="e.g. ORD-1B83F872 or 1B83F872"
                className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/40"
              />
            </div>

            <div>
              <label
                htmlFor="token"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
              >
                Access Token (Optional)
              </label>
              <input
                id="token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Paste token from your order link"
                className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/40"
              />
            </div>

            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white font-semibold px-4 py-2 transition-colors"
            >
              <Search className="w-4 h-4" />
              Track Order
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
