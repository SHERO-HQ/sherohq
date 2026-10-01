"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Check } from "lucide-react";
import { addToCart, cartSnapshot, serverCartSnapshot, subscribeCart } from "@/lib/cart";
import { shopUrl } from "@/lib/site";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/Button";

/** Adds this one device to the cart; once added, it links to the cart instead. */
export function AddToCart({ listingId, available, className }: { listingId: string; available: boolean; className?: string }) {
  const cart = useSyncExternalStore(subscribeCart, cartSnapshot, serverCartSnapshot);
  const base = buttonClass({ size: "lg", className });

  if (!available) {
    return (
      <span className={cn(base, "bg-surface text-ink-secondary ring-1 ring-border ring-inset")}>Reserved for another order</span>
    );
  }
  if (cart.includes(listingId)) {
    return (
      <Link href={shopUrl.cart} className={buttonClass({ variant: "outline", size: "lg", className })}>
        <Check aria-hidden="true" size={18} strokeWidth={1.5} />
        In your cart · View cart
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => addToCart(listingId)}
      className={base}
    >
      Add to cart
    </button>
  );
}
