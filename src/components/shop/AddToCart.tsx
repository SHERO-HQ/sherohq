"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Check } from "lucide-react";
import { addToCart, cartSnapshot, serverCartSnapshot, subscribeCart } from "@/lib/cart";
import { routes } from "@/lib/site";
import { cn } from "@/lib/cn";

/** Adds this one device to the cart; once added, it links to the cart instead. */
export function AddToCart({ listingId, available, className }: { listingId: string; available: boolean; className?: string }) {
  const cart = useSyncExternalStore(subscribeCart, cartSnapshot, serverCartSnapshot);
  const base = cn(
    "inline-flex h-[52px] items-center justify-center gap-2 rounded-sm px-7 text-base/5 font-medium whitespace-nowrap",
    className,
  );

  if (!available) {
    return (
      <span className={cn(base, "border border-border bg-surface text-ink-secondary")}>Reserved for another order</span>
    );
  }
  if (cart.includes(listingId)) {
    return (
      <Link href={routes.cart} className={cn(base, "border border-primary text-primary hover:bg-surface")}>
        <Check aria-hidden="true" size={18} strokeWidth={1.5} />
        In your cart · View cart
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => addToCart(listingId)}
      className={cn(base, "bg-primary text-on-primary transition-colors duration-150 hover:bg-primary-hover")}
    >
      Add to cart
    </button>
  );
}
