"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/** Records the order_placed key event once per order (not on reload). No personal details. */
export function OrderPlacedEvent({ number, value, delivery, payment }: { number: string; value: number; delivery: string; payment: string }) {
  useEffect(() => {
    const key = `shero-tracked-${number}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked: sending twice on reload is the lesser problem.
    }
    trackEvent("order_placed", { value, currency: "GHS", delivery, payment });
  }, [number, value, delivery, payment]);
  return null;
}
