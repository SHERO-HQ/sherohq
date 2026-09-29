"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { removeFromCart } from "@/lib/cart";

export function RemoveFromCart({ listingId, model }: { listingId: string; model: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        removeFromCart(listingId);
        startTransition(() => router.refresh());
      }}
      className="min-h-6 self-start text-body-sm text-ink-secondary underline underline-offset-3 hover:text-ink disabled:opacity-60"
    >
      Remove<span className="sr-only"> {model}</span>
    </button>
  );
}
