"use client";
import React from "react";
import { m } from "motion/react";
import { ChevronLeft, CheckCircle, Smartphone, CreditCard, Wallet, Store, ShoppingBag, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentIcons from "@/components/layout/PaymentIcons";
import { useCheckout } from "../CheckoutContext";
import { useCart } from "@/hooks/queries/useCartQuery";
import { useNotifications } from "@/hooks/useNotifications";

type PaymentMethodValue = "momo" | "card" | "cod" | "store_pickup";

type PaymentMethodOption = {
  value: PaymentMethodValue;
  title: string;
  description: string;
  helper: string;
  icon: LucideIcon;
};

// eslint-disable-next-line react-refresh/only-export-components
export const ONLINE_PAYMENT_OPTIONS: PaymentMethodOption[] = [
  {
    value: "momo",
    title: "Momo",
    description: "Mobile money checkout for MTN and Telecel Cash.",
    helper: "Best for fast local payments.",
    icon: Smartphone,
  },
  {
    value: "card",
    title: "Credit / Bank",
    description: "Visa, Mastercard, and bank card payment.",
    helper: "You will be redirected to the available secure gateway.",
    icon: CreditCard,
  },
];

// eslint-disable-next-line react-refresh/only-export-components
export const OFFLINE_PAYMENT_OPTIONS: PaymentMethodOption[] = [
  {
    value: "cod",
    title: "Cash on Delivery",
    description: "Pay when your order arrives.",
    helper: "Good for local delivery orders.",
    icon: Wallet,
  },
  {
    value: "store_pickup",
    title: "Store Pickup",
    description: "Pay when you collect in store.",
    helper: "No payment redirect at checkout.",
    icon: Store,
  },
];

export default function CheckoutStepPayment({ onSubmit }: { onSubmit: (data: any) => Promise<void> }) {
  const { cart } = useCart();
  const {
    formMethods: {
      setValue,
      watch,
      handleSubmit,
      formState: { errors },
    },
    handleBack,
    isSubmitting,
    setCurrentStep,
    isRetryOrder,
  } = useCheckout();
  const { addNotification } = useNotifications();
  const paymentMethod = watch("paymentMethod");

  const isCartEmpty = cart.length === 0 && !isRetryOrder;

  const handleFormSubmit = async (data: any) => {
    if (isCartEmpty) {
      addNotification(
        "Empty Cart",
        "Your cart is empty. Please add at least one item before completing payment.",
        "warning",
      );
      setCurrentStep(1);
      return;
    }
    await onSubmit(data);
  };

  const onError = (formErrors: any) => {
    if (formErrors.shippingAddress || formErrors.email || formErrors.phone) {
      addNotification("Validation Error", "Please check your delivery details. Some fields are missing.", "error");
      setCurrentStep(2);
    }
  };

  return (
    <m.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6"
    >
      <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Choose Payment
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Pick one method. Momo and Credit / Bank will redirect to the right
            available secure gateway.
          </p>
        </div>
      </div>

      {isCartEmpty && (
        <div className="mb-6 p-4 rounded border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Your cart is empty
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Please add at least one item to proceed with payment.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentStep(1)}
            className="border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100 text-xs shrink-0"
          >
            Review Cart
          </Button>
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Online payment
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Fast, secure, and redirected automatically.
              </p>
            </div>
            <PaymentIcons />
          </div>

          <div className="grid gap-2">
            {ONLINE_PAYMENT_OPTIONS.map((option) => {
              const isSelected = paymentMethod === option.value;
              const OptionIcon = option.icon;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue("paymentMethod", option.value)}
                  className={`w-full rounded border p-3 text-left transition-all ${
                    isSelected
                      ? "border-brand-secondary-500 bg-brand-secondary-50 dark:bg-brand-secondary-900/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-secondary-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-brand-secondary-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <OptionIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 dark:text-white">
                          {option.title}
                        </h3>
                        {isSelected && (
                          <span className="inline-flex items-center rounded-full bg-brand-secondary-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-snug">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Offline payment
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              For orders that do not need an online checkout.
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {OFFLINE_PAYMENT_OPTIONS.map((option) => {
              const isSelected = paymentMethod === option.value;
              const OptionIcon = option.icon;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue("paymentMethod", option.value)}
                  className={`w-full rounded border p-3 text-left transition-all ${
                    isSelected
                      ? "border-brand-secondary-500 bg-brand-secondary-50 dark:bg-brand-secondary-900/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-brand-secondary-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-brand-secondary-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <OptionIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 dark:text-white">
                          {option.title}
                        </h3>
                        {isSelected && (
                          <span className="inline-flex items-center rounded-full bg-brand-secondary-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-snug">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {errors.paymentMethod && (
          <p className="text-red-500 text-sm mt-2">
            {errors.paymentMethod?.message}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4 mt-8">
        <Button
          onClick={handleBack}
          variant="outline"
          className="font-bold gap-2 px-8 border-slate-300 dark:border-slate-700"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit, onError)}
          disabled={isSubmitting || isCartEmpty}
          variant="brand"
          className="font-bold gap-2 px-8"
        >
          {isSubmitting ? "Processing..." : "Place Order"}
          <CheckCircle className="w-5 h-5" />
        </Button>
      </div>
    </m.div>
  );
}
