"use client";
import React from "react";
import { m } from "motion/react";
import { Minus, Plus, Trash2, ChevronRight, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppImage from "@/components/common/AppImage";
import { getImageUrl } from "@/services/api";
import { useCart } from "@/hooks/queries/useCartQuery";
import { useCheckout } from "../CheckoutContext";
import { useRouter } from "next/navigation";

export default function CheckoutStepCart() {
  const router = useRouter();
  const { cart, updateQuantity, removeItem } = useCart();
  const { handleNext } = useCheckout();

  if (cart.length === 0) {
    return (
      <m.div
        key="step1-empty"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center"
      >
        <div className="w-20 h-20 bg-brand-secondary-50 dark:bg-brand-secondary-900/20 text-brand-secondary-600 dark:text-brand-secondary-400 rounded-full flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 text-sm sm:text-base leading-relaxed">
          You don&apos;t have any items in your cart. Please add at least one product to continue with your checkout.
        </p>
        <Button
          onClick={() => router.push("/products")}
          variant="brand"
          className="font-bold gap-2 px-8 h-12 shadow-sm hover:shadow transition-all"
        >
          Browse Products
          <ArrowRight className="w-4 h-4" />
        </Button>
      </m.div>
    );
  }

  return (
    <m.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6"
    >
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Review Your Cart
      </h2>

      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex flex-row sm:flex-row gap-4 p-4 rounded border border-slate-200 dark:border-slate-800 hover:border-brand-secondary-500 dark:hover:border-brand-secondary-500 transition-colors">
              <div className="relative w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center overflow-hidden shrink-0">
                {item.image &&
                (item.image.startsWith("/uploads") ||
                  item.image.startsWith("http")) ? (
                  <AppImage
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="text-3xl">{item.image}</div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {item.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.category}
                </p>
                <p className="text-lg font-bold text-brand-secondary-600 dark:text-brand-secondary-400 mt-2">
                  GHS {item.price}
                </p>
              </div>
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-4 sm:pt-0">
              <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-bold text-slate-900 dark:text-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={handleNext}
          disabled={cart.length === 0}
          variant="brand"
          className="font-bold gap-2 px-8"
        >
          Continue to Delivery
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </m.div>
  );
}
